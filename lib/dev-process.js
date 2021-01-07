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
  swig = require('swig-templates'),
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

      let devOpts = _.clone(constants.NG_CLI_SERVE_PARAMS);
      let initialBuildReady = false;
      let ngCLIPath =
        fs.existsSync(`${process.cwd()}/node_modules/@angular/cli/bin/ng`) ?
          `${process.cwd()}/node_modules/@angular/cli/bin/ng` :
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

      // Set swig as the template engine
      this.app.engine('html', swig.renderFile);

      // Set views path and view engine
      this.app.set('view engine', 'html');
      this.app.set('views', __dirname + '/templates');
      this.app.set('view cache', false);

      // Request body parsing middleware should be above methodOverride
      this.app.use(bodyParser.urlencoded({extended: true}));
      this.app.use(bodyParser.json());
      this.app.use(methodOverride());

      // Use helmet to secure Express headers
      // loosen csp as much as possible - simply turn off
      // this.app.use(helmet.contentSecurityPolicy());
      this.app.use(helmet.dnsPrefetchControl());
      this.app.use(helmet.expectCt());
      this.app.use(helmet.frameguard());
      this.app.use(helmet.hidePoweredBy());
      this.app.use(helmet.hsts());
      this.app.use(helmet.ieNoOpen());
      this.app.use(helmet.noSniff());
      this.app.use(helmet.permittedCrossDomainPolicies());
      this.app.use(helmet.referrerPolicy());
      this.app.use(helmet.xssFilter());
      this.app.disable('x-powered-by');

      // CookieParser should be above session
      this.app.use(cookieParser());

      if (this.runAsDev) {

        this.app.use(express.static(path.resolve(process.cwd() + '/' + this.config.distDir)));
        this.app.get(`/runner/preview/accounts/:accountId${!this.isCoreApp ? '/apps' : ''}/:appKey`, (req, res) => {
          res.render(constants.TEMPLATE_IFRAME_ANGULAR, this.buildConfig(renderConfigClone, req));
        });

      } else {

        this.app.use(express.static(path.resolve(process.cwd() + '/' + this.config.distDir)));
        this.app.get(`/runner/accounts/:accountId${!this.isCoreApp ? '/apps' : ''}/:appKey`, (req, res) => {
          res.render(constants.TEMPLATE_IFRAME_ANGULAR, this.buildConfig(renderConfigClone, req));
        });

      }

      if (!this.config.ssl) {

        this.server = http.createServer(this.app).listen(this.config.devPort, this.config.host);

      } else {

        this.server = https.createServer(this.httpsOptions, this.app).listen(this.config.devPort, this.config.host);

      }

      if (!/^win/.test(process.platform)) {
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
