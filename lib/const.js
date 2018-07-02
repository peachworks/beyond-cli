const ACCT_TYPE_CUSTOMER            = 'customer';
const ACCT_TYPE_DEVELOPER           = 'developer';
const ANGULARJS                     = 'angular';
const ANGULAR                       = 'angular5';
const API_DEV_URL                   = 'https://api.dev.peachworks.com';
const API_PROD_URL                  = 'https://api.peachworks.com';
const API_STAGING_URL               = 'https://api.staging.peachworks.com';
const APP_KEY_ANALYTICS             = 'analytics';
const APP_RC_FILE                   = '.peachrc';
const BUILD_FOLDER                  = 'dist';
const CREDS_FILE_SPLITTER           = ':';
const DEFAULT_HOST                  = 'localhost';
const DEFAULT_PORT                  = 8080;
const ENV_TYPE_DEV                  = 'DEV';
const ENV_TYPE_STAGING              = 'STAGING';
const ENV_TYPE_PROD                 = 'PROD';
const LOCALHOST_ADDRESSES           = ['localhost', '127.0.0.1'];
const NG_CLI_BUILD_PARAMS           = [
                                      'build',
                                      '--prod',
                                      '--aot',
                                      '--delete-output-path', // clear dist before each build
                                      '--build-optimizer=true',
                                      '--vendor-chunk=false', // no vendors chunk
                                      '--common-chunk=false', // no commons chunk
                                      '--output-hashing=none', // output hashing - none
                                      '--extract-css=true', // extract css
                                      '--extract-licenses=false',
                                      '--source-map=false', // no source maps
                                      `--output-path=${BUILD_FOLDER}`
                                    ];
const NG_CLI_SERVE_PARAMS           = [
                                      'build',
                                      '--aot=false',
                                      '--delete-output-path', // clear dist before each build
                                      '--build-optimizer=false',
                                      '--vendor-chunk=false', // no vendors chunk
                                      '--common-chunk=false', // no commons chunk
                                      '--output-hashing=none', // output hashing - none
                                      '--extract-css=true', // extract css
                                      '--extract-licenses=false',
                                      '--source-map=true', // source maps
                                      `--output-path=${BUILD_FOLDER}`
                                    ];
const REQUIRED_RCFILE_KEYS          = ['key', 'framework'];
const REQUIRED_UP_TO_DATE_DEPS      = {
                                      [ANGULAR]: ['@getbeyond/beyond-js', '@getbeyond/ng-beyond-js'],
                                      [ANGULARJS]: ['@getbeyond/ng-js-beyond-js', '@getbeyond/beyond-css']
                                    };
const REPORTS_PATH                  = '/reports';
const TEMPLATE_IFRAME_ANGULAR       = 'angular.html';
const TEMPLATE_IFRAME_ANGULARJS     = 'angularjs.html';
const TEMPLATE_IFRAME_ANALYTICS     = 'analytics.html';
const TEMPLATE_PLATFORM             = 'runner.html'
const URL_CUSTOMER_ACCOUNTS         = '/v1/accounts';
const URL_CUSTOMER_LOGIN            = '/v1/oauth/session/login';
const URL_DEV_ACCOUNTS              = '/v1/developers/me';
const URL_DEV_LOGIN                 = '/v1/oauth/session/developer_login';
const URL_FILES                     = '/v1/files';
const URL_OAUTH_TOKEN               = '/v1/oauth/token';
const URL_REPORTS                   = '/v1/reports';
const URL_WAQL                      = '/v1/accounts/:id/waql';
const VM_SAFE_LOCALHOST_ADDRESS     = '0.0.0.0';

module.exports = {
  ACCT_TYPE_CUSTOMER,
  ACCT_TYPE_DEVELOPER,
  ANGULARJS,
  ANGULAR,
  API_DEV_URL,
  API_PROD_URL,
  API_STAGING_URL,
  APP_KEY_ANALYTICS,
  APP_RC_FILE,
  BUILD_FOLDER,
  CREDS_FILE_SPLITTER,
  DEFAULT_HOST,
  DEFAULT_PORT,
  ENV_TYPE_DEV,
  ENV_TYPE_STAGING,
  ENV_TYPE_PROD,
  LOCALHOST_ADDRESSES,
  NG_CLI_BUILD_PARAMS,
  NG_CLI_SERVE_PARAMS,
  REQUIRED_RCFILE_KEYS,
  REQUIRED_UP_TO_DATE_DEPS,
  REPORTS_PATH,
  TEMPLATE_IFRAME_ANGULAR,
  TEMPLATE_IFRAME_ANGULARJS,
  TEMPLATE_IFRAME_ANALYTICS,
  TEMPLATE_PLATFORM,
  URL_CUSTOMER_ACCOUNTS,
  URL_CUSTOMER_LOGIN,
  URL_DEV_ACCOUNTS,
  URL_DEV_LOGIN,
  URL_FILES,
  URL_OAUTH_TOKEN,
  URL_REPORTS,
  URL_WAQL,
  VM_SAFE_LOCALHOST_ADDRESS
};
