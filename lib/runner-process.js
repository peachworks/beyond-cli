'use strict';

let BaseProcess    = require('./base-process');
let bodyParser     = require('body-parser');
let constants      = require('./const');
let cookieParser   = require('cookie-parser');
let express        = require('express');
let fs             = require('fs');
let helmet         = require('helmet');
let http           = require('http');
let https          = require('https');
let methodOverride = require('method-override');
let path           = require('path');
let swig           = require('swig-templates');
let _              = require('lodash');

class RunnerProcess extends BaseProcess {

  constructor(config) {

    super(config);

    this.accessToken = (!!this.config.tokens && !!this.config.tokens.access_token) ?
      this.config.tokens.access_token :
      '';
    this.angularAppData = {
      accountModules : [],
      moduleName     : '',
      ngStrictDi     : false,
      ngController   : ''
    };
    this.app = express();
    this.appKey = this.rcFile.key;
    this.appTokens = (!!this.config.tokens && !!this.config.tokens.app_tokens) ?
      encodeURIComponent(JSON.stringify(this.config.tokens.app_tokens)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent) :
      '';
    this.expiryToken = (!!this.config.tokens && !!this.config.tokens.expires_in) ?
      this.config.tokens.expires_in :
      '';
    this.httpsOptions = this.config.ssl ? 
      {
        cacert : fs.readFileSync(path.join(__dirname, '/ssl/wild.cli.getbeyond.com.cacert')),
        cert   : fs.readFileSync(path.join(__dirname, '/ssl/wild.cli.getbeyond.com.cert')),
        key    : fs.readFileSync(path.join(__dirname, '/ssl/wild.cli.getbeyond.com.key')),
      } :
      null;
    this.refreshToken = (!!this.config.tokens && !!this.config.tokens.refresh_token) ?
      this.config.tokens.refresh_token :
      '';
    this.runAsDev     = this.config.accountType !== constants.ACCT_TYPE_CUSTOMER;
    this.renderConfig = {
      BeyondApp     : {
        accountId         : this.config.accountId || this.config.accounts[0].id,
        angular           : this.angularAppData,
        appPath           : 'apps/' + this.appKey,
        api               : {
          url               : this.config.apiBaseUrl,
          version           : 'v1',
        },
        session           : {
          cookieName        : 'peach_sid',
          refreshCookieName : 'peach_sid_ref',
          expiryCookieName  : 'peach_sid_expiry',
          devCookieName     : 'peach_dev_sid',
          development       : this.runAsDev
        }
      },
      accounts          : this.config.accounts,
      appKey            : this.appKey,
      host              : this.config.host,
      port              : this.config.port,
      protocol          : this.config.ssl ? 'https' : 'http',
      serveDist         : this.config.serveDist,
      watchSocket       : this.framework === constants.ANGULAR && this.config.watch,
      tokenAccess       : this.accessToken,
      tokenApps         : this.appTokens,
      tokenExpiry       : this.expiryToken,
      tokenRefresh      : this.refreshToken
    };
    this.server = null;

    switch (this.framework) {
      case constants.ANGULARJS :
        this.angularAppData.moduleName = _.get(this.rcFile.framework, ['angular', 'module']);
        break;
      case constants.ANGULAR :
        this.angularAppData = {
          accountModules : [],
          moduleName     : _.get(this.rcFile.framework, ['angular5', 'module']),
          rootSelector   : _.get(this.rcFile.framework, ['angular5', 'root_selector'])
        };
        break;
      default:
        break;
    };

    this.renderConfig.BeyondApp.angular = this.angularAppData;

  }

  start() {

    // Set swig as the template engine
	  this.app.engine('html', swig.renderFile);

    // Set views path and view engine
  	this.app.set('view engine', 'html');
  	this.app.set('views', __dirname + '/templates');
    this.app.set('view cache', false);
    swig.setDefaults({ cache: false });

    // Request body parsing middleware should be above methodOverride
  	this.app.use(bodyParser.urlencoded({extended: true}));
  	this.app.use(bodyParser.json());
  	this.app.use(methodOverride());

    // Use helmet to secure Express headers
    this.app.use(helmet());
    this.app.disable('x-powered-by');

    // CookieParser should be above session
    this.app.use(cookieParser());
    
    if (this.runAsDev && this.framework === constants.ANGULAR) {

      this.app.use(
        `/preview/accounts/:accountId/apps`,
        express.static(path.resolve(process.cwd() + '/' + constants.BUILD_FOLDER))
      );

    } else if (this.framework === constants.ANGULAR) {
      
      this.app.use(
        `/accounts/:accountId/apps`,
        express.static(path.resolve(process.cwd() + '/' + constants.BUILD_FOLDER))
      );

    }

    // Setup Routes
    this.app.get('/', (req, res) => { res.render('runner', this.renderConfig); });

    this.app.get('/accounts/:accountId', (req, res) => {
      res.render('runner', this.renderConfig);
    });

    this.app.get('/accounts/:accountId/*', (req, res) => {
      res.render('runner', this.renderConfig);
    });

    this.app.get('/preview/accounts/:accountId', (req, res) => {
      res.render('runner', this.renderConfig);
    });

    this.app.get('/preview/accounts/:accountId/*', (req, res) => {
      res.render('runner', this.renderConfig);
    });

    if (this.config.serveDist) {

      let renderConfigClone = _.cloneDeep(this.renderConfig);
      let view = this.appKey === constants.APP_KEY_ANALYTICS ?
        constants.TEMPLATE_IFRAME_ANALYTICS :
        (this.framework === constants.ANGULAR ? constants.TEMPLATE_IFRAME_ANGULAR : constants.TEMPLATE_IFRAME_ANGULARJS);

      this.app.get('/runner/accounts/:accountId/apps/:appKey', (req, res) => {
        res.render(view, renderConfigClone);
      });

      this.app.get('/runner/preview/accounts/:accountId/apps/:appKey', (req, res) => {
        res.render(view, renderConfigClone);
      });

      this.app.use(express.static(path.resolve(process.cwd() + '/' + constants.BUILD_FOLDER)));

      if (!this.config.ssl) {

        this.server = http.createServer(this.app).listen(this.config.port, this.config.host);

      } else {

        this.server = https.createServer(this.httpsOptions, this.app).listen(this.config.port, this.config.host);
      
      }

      this._onStartMessage(`Distribution Server: http${this.config.ssl ? 's': ''}://${this.config.requested_host}:${this.config.port}`);

    } else {

      let DevProcess = require('./dev-process');
      let findPort   = require('find-port');
      let findDevPortPromise;
      let devServer;

      if (this.config.devPort) {
        findDevPortPromise = new Promise((resolve) => {
          resolve([this.config.devPort]);
        });
      } else {
        findDevPortPromise = new Promise((resolve) => {
          findPort(
            this.config.host,
            this.config.port + 1,
            this.config.port + 100,
            resolve
          )
        });
      }

      findDevPortPromise
        .then((ports) => {

          this.config.devPort          = ports[0];      

          // Proxy iframe requests to dev server
          let httpProxy  = require('http-proxy');
          let proxy      = httpProxy.createProxyServer();
          let runnerPath = (this.runAsDev) ?
            '/runner/preview/accounts/:accountId/apps/:appKey' :
            '/runner/accounts/:accountId/apps/:appKey';

          this.app.get(runnerPath, (req, res) => {
            proxy.web(req, res, {
              secure : false,
              ssl    : this.config.ssl ? 
                {
                  key    : this.httpsOptions.key,
                  cert   : this.httpsOptions.cert
                }:
                null,
              target : `http${this.config.ssl ? 's': ''}://${this.config.host}:${this.config.devPort}`
            });
          });

          proxy.on('error', function(e) {
            console.error(e);
            console.error('Could not connect to proxy, please try again...');
          });

          // create main server
          if (!this.config.ssl) {

            this.server = http.createServer(this.app).listen(this.config.port, this.config.host);
    
          } else {
    
            this.server = https.createServer(this.httpsOptions, this.app).listen(this.config.port, this.config.host);
          
          }

          // create dev server, restore original requested host in config, pass in the server instance
          devServer = new DevProcess(_.extend({}, this.config, {host: this.config.requested_host}));
          devServer.start(this.server);

        });

    }

  }

  _onStartMessage(message = '') {

    console.info('----------------------------------------------------------');
    console.info(message);
    console.info('----------------------------------------------------------');

  }

}

module.exports = RunnerProcess;
