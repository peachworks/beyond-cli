'use strict';

const _ = require('lodash'),
  bodyParser = require('body-parser'),
  constants = require('./const'),
  cookieParser = require('cookie-parser'),
  express = require('express'),
  fs = require('fs'),
  helmet = require('helmet'),
  http = require('http'),
  https = require('https'),
  methodOverride = require('method-override'),
  spawn = require('child_process').spawn,
  path = require('path'),
  RunnerProcess = require('./runner-process'),
  webpack = require('webpack'),
  WebpackDevServer = require('webpack-dev-server'),
  WebpackConfigBuilder = require('./config-builder');

class DevProcess extends RunnerProcess {

  constructor(config) {
    super(config);
  }

  start(parentServer = null) {

    console.info('\nStarting development server...\n');

    if (this.framework === constants.ANGULAR) {

      const expressApp = this.createCommonExpressApp();
      const isWin = /^win/.test(process.platform);

      let devOpts = _.clone(constants.NG_CLI_SERVE_PARAMS);
      let initialBuildReady = false;
      let ngCLIPath =
        fs.existsSync(`${process.cwd()}/node_modules/@angular/cli/bin/ng`) ?
          `${isWin ? 'node ' : ''}${process.cwd()}/node_modules/@angular/cli/bin/ng` :
          'ng';
      let ngCLIBuildServer;
      let renderConfigClone = _.cloneDeep(this.renderConfig);
      let serverSockets;

      devOpts.push(`--output-path=${this.config.distDir}`);

      if (this.config.watch && parentServer) {

        serverSockets = require('socket.io')(parentServer);

        devOpts.push('--watch=true');

        if (_.isNumber(this.config.watch)) {
          devOpts.push('--poll=' + this.config.watch);
        }

      } else {

        devOpts.push('--watch=false');

      }

      if (this.config.verbose) {
        devOpts.push('--progress=true');
      }
      if (this.config.preserveSymlinks) {
        devOpts.push('--preserve-symlinks=true');
      }

      // for non-angularjs apps we need another server which will get iframe content requests from main server proxy
      // and serve item content - for rendering static files it will use ng cli ran in DevProcess
      renderConfigClone.host = this.config.requestedHost;
      renderConfigClone.port = this.config.devPort;

      if (this.runAsDev) {

        expressApp.use(express.static(path.resolve(process.cwd() + '/' + this.config.distDir)));
        expressApp.get(`/runner/preview/accounts/:accountId${!this.isCoreApp ? '/apps' : ''}/:appKey`, (req, res) => {
          res.render(constants.TEMPLATE_IFRAME_ANGULAR, this.buildConfig(renderConfigClone, req));
        });

      } else {

        expressApp.use(express.static(path.resolve(process.cwd() + '/' + this.config.distDir)));
        expressApp.get(`/runner/accounts/:accountId${!this.isCoreApp ? '/apps' : ''}/:appKey`, (req, res) => {
          res.render(constants.TEMPLATE_IFRAME_ANGULAR, this.buildConfig(renderConfigClone, req));
        });

      }

      if (!this.config.ssl) {

        this.server = http.createServer(expressApp).listen(this.config.devPort, this.config.host);

      } else {

        this.server = https.createServer(this.httpsOptions, expressApp).listen(this.config.devPort, this.config.host);

      }

      if (!isWin) {
          ngCLIBuildServer = spawn(ngCLIPath, devOpts);
      } else {
          ngCLIBuildServer = spawn(ngCLIPath, devOpts, {shell: true});
      }

      ngCLIBuildServer.stdout.on('data', (data) => {

        process.stdout.write(data.toString() + '\n');

        if (serverSockets) {
          serverSockets.emit('BeyondReloadIframe');
        }

        if (!initialBuildReady) {

          initialBuildReady = true;

          DevProcess._onStartMessage(`Dev Server: http${this.config.ssl ? 's': ''}://${this.config.requestedHost}:${this.config.port} (Environment: ${this.config.env})`);

        }

      });

      ngCLIBuildServer.stderr.on('data', (data) => {
        process.stdout.write(data.toString() + '\n');
      });

      ngCLIBuildServer.on('close', (code) => {
        if (this.config.watch) {
          console.error('Ng CLI build server closed.'); // in dev mode with watch flag ng cli should never stop itself
        }
      });

    } else {

      const webpackConfigBuilder = new WebpackConfigBuilder(),
        webpackConfig = webpackConfigBuilder.getDevConfig(
          _.extend(
            {},
            this.config,
            {
              angular_opts: this.angularAppData,
              app_key: this.appKey,
              framework: this.framework,
              beyond_app: this.renderConfig.BeyondApp
            }
          )
        ),
        compiler = webpack(webpackConfig); // returns a Compiler instance

      this.server = new WebpackDevServer(compiler, webpackConfig.devServer);

      // server for the app iframe, running on a different port
      this.server.listen(this.config.devPort, this.config.host);

      // for regular apps if dev server is running,
      // it's also responsible for showing the message instead of parent server
      // but for web2 we need to customize this message a bit,
      // because its running in a different mode (w/o parent runner server)
      const message =
        (
          this.appKey !== constants.APP_KEY_WEB2 ?
            (`Dev Server: http${this.config.ssl ? 's': ''}://` +
              `${this.config.requestedHost}:${this.config.port}`) :
            (`Webpack Dev Server: http${this.config.ssl ? 's': ''}://` +
              `${this.config.requestedHost}:${this.config.devPort}`)
        ) +
          `(Environment: ${this.config.env})`;

      DevProcess._onStartMessage(message);

    }

  }

}

module.exports = DevProcess;
