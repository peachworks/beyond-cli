const ACCT_TYPE_CUSTOMER            = 'customer';
const ACCT_TYPE_DEVELOPER           = 'developer';
const ANGULARJS                     = 'angular';
const ANGULAR                       = 'angular5';
const API_DEV_URL                   = 'https://api.dev.peachworks.com';
const API_DEV_LOGIN_URL             = 'https://dev.peachworks.com';
const API_PROD_URL                  = 'https://api.peachworks.com';
const API_PROD_LOGIN_URL            = 'https://my.peachworks.com';
const API_STAGING_URL               = 'https://api.staging.peachworks.com';
const API_STAGING_LOGIN_URL         = 'https://my.staging.peachworks.com';
const APP_KEY_ANALYTICS             = 'analytics';
const APP_KEY_WEB2                  = 'beyondWeb';
const APP_RC_FILE                   = '.peachrc';
const CHECKOUT_API_DEV_URL          = 'https://checkout-api-dev.getbeyond.xyz/api/v1';
const CHECKOUT_API_PROD_URL         = 'https://checkout-api.getbeyond.xyz/api/v1';
const CHECKOUT_API_STAGING_URL      = 'https://checkout-api-qa-auto.getbeyond.xyz/api/v1';
const CHECKOUT_CLIENT_DEV_URL       = 'https://checkout-dev.getbeyond.xyz';
const CHECKOUT_CLIENT_PROD_URL      = 'https://store.getbeyond.com';
const CHECKOUT_CLIENT_STAGING_URL   = 'https://store-test.getbeyond.com';
const CHECKOUT_FN_DEV_URL           = 'https://fncheckout-dev.azurewebsites.net/api';
const CHECKOUT_FN_PROD_URL          = 'https://fncheckout-dev.azurewebsites.net/api'; // TODO: update
const CHECKOUT_FN_STAGING_URL       = 'https://fncheckout-dev.azurewebsites.net/api'; // TODO: update
const CORE_APP_KEYS                 = ['config', 'dashboard', 'help', 'launch', 'profile', 'reports', 'welcome'];
const COVERAGE_DIR                  = 'coverage';
const CREDS_FILE_SPLITTER           = ':';
const DEFAULT_HOST                  = 'localhost';
const DEFAULT_PORT                  = 8080;
const DIST_DIR                      = 'dist';
const ENV_TYPE_DEV                  = 'DEV';
const ENV_TYPE_STAGING              = 'STAGING';
const ENV_TYPE_PROD                 = 'PROD';
const HUB_DEV_URL                   = 'https://hub.dev.peachworks.com';
const HUB_PROD_URL                  = 'https://hub.peachworks.com';
const HUB_STAGING_URL               = 'https://hub.dev.peachworks.com'; // TODO: ??? is there staging hub url?
const LOCALHOST_ADDRESSES           = ['localhost', '127.0.0.1'];
const NG_CLI_BUILD_PARAMS           = [
                                      'build',
                                      '--prod',
                                      '--aot',
                                      '--delete-output-path', // clear dist before each build
                                      '--build-optimizer=true',
                                      // '--vendor-chunk=false', // create vendors chunk in prod build if needed
                                      // '--common-chunk=false', // create common chunk in prod build if needed
                                      '--output-hashing=media', // output hashing - none
                                      '--extract-css=true', // extract css
                                      '--extract-licenses=false',
                                      '--source-map=false', // no source maps
                                    ];
const NG_CLI_SERVE_PARAMS           = [
                                      'build',
                                      '--aot=false',
                                      '--delete-output-path', // clear dist before each build
                                      '--build-optimizer=false',
                                      '--vendor-chunk=false', // no vendors chunk
                                      '--common-chunk=false', // no commons chunk
                                      '--output-hashing=media', // output hashing - none
                                      '--extract-css=true', // extract css
                                      '--extract-licenses=false',
                                      '--source-map=true', // source maps
                                    ];
const PAYROLL_API_DEV_URL           = 'https://beyondone-payroll-api-dev.getbeyond.me';
const PAYROLL_API_PROD_URL          = 'https://beyondone-payroll-api-prd.getbeyond.me';
const PAYROLL_API_STAGING_URL       = 'https://beyondone-payroll-api-dev.getbeyond.me';
const REQUIRED_RCFILE_KEYS          = ['key', 'framework'];
const REQUIRED_UP_TO_DATE_DEPS      = {
                                      [ANGULAR]: ['@getbeyond/beyond-js', '@getbeyond/ng-beyond-js'],
                                      [ANGULARJS]: ['@getbeyond/ng-js-beyond-js', '@getbeyond/beyond-css', 'ng-peach', 'peach.css']
                                    };
const REPORTS_PATH                  = '/reports';
const TEMPLATE_IFRAME_ANGULAR       = 'angular.html';
const TEMPLATE_IFRAME_ANGULARJS     = 'angularjs.html';
const TEMPLATE_IFRAME_ANALYTICS     = 'analytics.html';
const TEMPLATE_PLATFORM             = 'runner.html'
const URL_ADMIN_LOGIN               = '/v1/oauth/session/admin_login';
const URL_ADMIN_METRICS             = '/v1/admin/admin_metrics';
const URL_CUSTOMER_ACCOUNTS         = '/v1/accounts';
const URL_CUSTOMER_LOGIN            = '/v1/oauth/session/login';
const URL_DEV_ACCOUNTS              = '/v1/developers/me';
const URL_DEV_LOGIN                 = '/v1/oauth/session/developer_login';
const URL_FILES                     = '/v1/files';
const URL_IMPERSONATE               = '/v1/impersonate/';
const URL_OAUTH_TOKEN               = '/v1/oauth/token';
const URL_REPORTS                   = '/v1/reports';
const URL_RESOURCE                  = '/v1/accounts/:id/:resource';
const URL_WAQL                      = '/v1/accounts/:id/waql';
const VM_SAFE_LOCALHOST_ADDRESS     = '0.0.0.0';
const V3_CORE_APP_KEY_PREFIX        = 'core_';

module.exports = {
  ACCT_TYPE_CUSTOMER,
  ACCT_TYPE_DEVELOPER,
  ANGULARJS,
  ANGULAR,
  API_DEV_URL,
  API_DEV_LOGIN_URL,
  API_PROD_URL,
  API_PROD_LOGIN_URL,
  API_STAGING_URL,
  API_STAGING_LOGIN_URL,
  APP_KEY_ANALYTICS,
  APP_KEY_WEB2,
  APP_RC_FILE,
  CHECKOUT_API_DEV_URL,
  CHECKOUT_API_PROD_URL,
  CHECKOUT_API_STAGING_URL,
  CHECKOUT_CLIENT_DEV_URL,
  CHECKOUT_CLIENT_PROD_URL,
  CHECKOUT_CLIENT_STAGING_URL,
  CHECKOUT_FN_DEV_URL,
  CHECKOUT_FN_PROD_URL,
  CHECKOUT_FN_STAGING_URL,
  CORE_APP_KEYS,
  COVERAGE_DIR,
  CREDS_FILE_SPLITTER,
  DEFAULT_HOST,
  DEFAULT_PORT,
  DIST_DIR,
  ENV_TYPE_DEV,
  ENV_TYPE_STAGING,
  ENV_TYPE_PROD,
  HUB_DEV_URL,
  HUB_PROD_URL,
  HUB_STAGING_URL,
  LOCALHOST_ADDRESSES,
  NG_CLI_BUILD_PARAMS,
  NG_CLI_SERVE_PARAMS,
  PAYROLL_API_DEV_URL,
  PAYROLL_API_PROD_URL,
  PAYROLL_API_STAGING_URL,
  REQUIRED_RCFILE_KEYS,
  REQUIRED_UP_TO_DATE_DEPS,
  REPORTS_PATH,
  TEMPLATE_IFRAME_ANGULAR,
  TEMPLATE_IFRAME_ANGULARJS,
  TEMPLATE_IFRAME_ANALYTICS,
  TEMPLATE_PLATFORM,
  URL_ADMIN_LOGIN,
  URL_ADMIN_METRICS,
  URL_CUSTOMER_ACCOUNTS,
  URL_CUSTOMER_LOGIN,
  URL_DEV_ACCOUNTS,
  URL_DEV_LOGIN,
  URL_FILES,
  URL_IMPERSONATE,
  URL_OAUTH_TOKEN,
  URL_REPORTS,
  URL_RESOURCE,
  URL_WAQL,
  VM_SAFE_LOCALHOST_ADDRESS,
  V3_CORE_APP_KEY_PREFIX
};
