'use strict';

let RunnerProcess        = require('./runner-process');
let bodyParser           = require('body-parser');
let constants            = require('./const');
let cookieParser         = require('cookie-parser');
let express              = require('express');
let helmet               = require('helmet');
let http                 = require('http');
let https                = require('https');
let methodOverride       = require('method-override');
let spawn                = require('child_process').spawn;
let swig                 = require('swig-templates');
let path                 = require('path');
let webpack              = require('webpack');
let WebpackDevServer     = require('webpack-dev-server');
let WebpackConfigBuilder = require('./config-builder');
let _                    = require('lodash');

class DevProcess extends RunnerProcess {

  constructor(config) {
    super(config);
  }

  start(parentRunnerServer = null) {

    if (this.framework === constants.ANGULAR) {

      let devOpts = _.clone(constants.NG_CLI_SERVE_PARAMS);
      let initialBuildReady = false;
      let ngCLIBuildServer;
      let renderConfigClone = _.cloneDeep(this.renderConfig);
      let serverSockets;

      console.info('Starting development server...');

      if (this.config.watch && parentRunnerServer) {

        serverSockets = require('socket.io')(parentRunnerServer);

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
      renderConfigClone.host = this.config.requested_host;
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
      this.app.use(helmet());
      this.app.disable('x-powered-by');

      // CookieParser should be above session
      this.app.use(cookieParser());

      if (this.runAsDev) {

        this.app.use(express.static(path.resolve(process.cwd() + '/' + constants.BUILD_FOLDER)));
        this.app.get('/runner/preview/accounts/:accountId/apps/:appKey', (req, res) => {
          res.render(constants.TEMPLATE_IFRAME_ANGULAR, renderConfigClone);
        });

      } else {
        
        this.app.use(express.static(path.resolve(process.cwd() + '/' + constants.BUILD_FOLDER)));
        this.app.get('/runner/accounts/:accountId/apps/:appKey', (req, res) => {
          res.render(constants.TEMPLATE_IFRAME_ANGULAR, renderConfigClone);
        });

      }

      if (!this.config.ssl) {

        this.server = http.createServer(this.app).listen(this.config.devPort, this.config.host);

      } else {

        this.server = https.createServer(this.httpsOptions, this.app).listen(this.config.devPort, this.config.host);
      
      }

      if (!/^win/.test(process.platform)) {
          ngCLIBuildServer = spawn('ng', devOpts);
      }else{
          ngCLIBuildServer = spawn('ng', devOpts, {shell: true});
      }
      
      ngCLIBuildServer.stdout.on('data', (data) => {
        
        process.stdout.write(data.toString());

        if (serverSockets) {
          serverSockets.emit('BeyondReloadIframe');
        }

        if (!initialBuildReady) {

          initialBuildReady = true;

          this._onStartMessage(`Dev Server: http${this.config.ssl ? 's': ''}://${this.config.requested_host}:${this.config.port}`);

        }

      });

      ngCLIBuildServer.stderr.on('data', (data) => {
        process.stdout.write(data.toString());
      });

      ngCLIBuildServer.on('close', (code) => {
        if (this.config.watch) {
          console.error('Ng CLI build server closed.'); // in dev mode with watch flag ng cli should never stop itself
        }
      });

    } else {

      let webpackConfigBuilder = new WebpackConfigBuilder();
      let webpackConfig        = webpackConfigBuilder.getDevConfig(
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
      );
      let compiler             = webpack(webpackConfig); // returns a Compiler instance

      this.server = new WebpackDevServer(compiler, webpackConfig.devServer);

      // server for the app iframe, running on a different port
      this.server.listen(this.config.devPort, this.config.host);

      this._onStartMessage(`Dev Server: http${this.config.ssl ? 's': ''}://${this.config.requested_host}:${this.config.port}`);

    }

  }

}

module.exports = DevProcess;
