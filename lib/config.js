'use strict';

const constants = require('../lib/const');
const _         = require('lodash');

class CLIConfig {

  constructor(params) {

    // first - preserve original, just in case
    this.originalParams = _.cloneDeep(params);

    this.accountId = (params.account) ? params.account: null;
    this.accounts = [];
    this.accountType = (params.customer) ? constants.ACCT_TYPE_CUSTOMER : constants.ACCT_TYPE_DEVELOPER;
    this.apiBaseUrl = constants.API_DEV_URL;
    this.apiLoginUrl = constants.API_DEV_LOGIN_URL;
    this.checkoutApiUrl = params.checkoutApiUrl || constants.CHECKOUT_API_DEV_URL;
    this.checkoutClientUrl = params.checkoutClientUrl || constants.CHECKOUT_CLIENT_DEV_URL;
    this.checkoutFunctionUrl = params.checkoutFunctionUrl || constants.CHECKOUT_FN_DEV_URL;
    this.coverageDir = params.coverageDir || constants.COVERAGE_DIR;
    this.devPort = parseInt(params.devPort) || null;
    this.distDir = params.distDir || constants.DIST_DIR;
    this.env = (params.env) ? params.env.toUpperCase() : null;
    this.host = params.host || constants.DEFAULT_HOST;
    this.hubUrl = params.hubUrl || constants.HUB_DEV_URL;
    this.key = params.key || null;
    this.port = parseInt(params.port || constants.DEFAULT_PORT);
    this.imp = params.imp || false;
    this.payrollApiUrl = params.payrollApiUrl || constants.PAYROLL_API_DEV_URL;
    this.preserveSymlinks = params.preserveSymlinks || false;
    this.requestedHost = this.host; // preserve original host value we got from user - in case we will need to overwrite it
    this.serveDist = params.serveDist || false;
    this.skipDependenciesCheck = params.skipDpCheck || false;
    this.ssl = params.ssl || false;
    this.token = params.token || null;
    this.tokens = {};
    this.adminTokens = {};
    this.verbose = params.verbose || false;
    this.vhost = params.vhost || false;
    this.watch = (_.isString(params.watch) ? parseInt(params.watch, 10) : params.watch) || false;
    this.debug = params.debug || false;
    this.segmentApiKey = params.segmentKey || null;
    this.externalConfigs = params.externalConfigs ? JSON.parse(params.externalConfigs) : {};

    // set env only if not set by user - for customer mode staging is default, otherwise - prod
    if (!this.env) {
      this.env = (this.accountType && this.accountType === constants.ACCT_TYPE_CUSTOMER) ?
        constants.ENV_TYPE_STAGING :
        constants.ENV_TYPE_PROD;
    }

    // unsupported env set? then fallback to DEV
    if (![constants.ENV_TYPE_DEV, constants.ENV_TYPE_PROD, constants.ENV_TYPE_STAGING].includes(this.env)) {
      this.env = constants.ENV_TYPE_DEV;
    }

    // set various urls depending on env
    this.setEnvDependentValues(this.env, params);

    // translate localhost addresses to 0.0.0.0 in vm mode
    this.host = this.vhost && constants.LOCALHOST_ADDRESSES.indexOf(this.requestedHost) >= 0 ?
      constants.VM_SAFE_LOCALHOST_ADDRESS :
      this.requestedHost;

  }

  setAccounts(accounts) {
    this.accounts = accounts;
  }

  setDevPort(port) {
    this.devPort = port;
  }

  setEnvDependentValues(env, params) {
    this.apiBaseUrl = constants[`API_${env}_URL`];
    this.apiLoginUrl = constants[`API_${env}_LOGIN_URL`];
    this.checkoutApiUrl = params.checkoutApiUrl || constants[`CHECKOUT_API_${env}_URL`]; // preserve input, if any
    this.checkoutClientUrl = params.checkoutClientUrl || constants[`CHECKOUT_CLIENT_${env}_URL`]; // preserve input, if any
    this.checkoutFunctionUrl = params.checkoutFunctionUrl || constants[`CHECKOUT_FN_${env}_URL`]; // preserve input, if any
    this.hubUrl = params.hubUrl || constants[`HUB_${env}_URL`]; // preserve input, if any
    this.payrollApiUrl = params.payrollApiUrl || constants[`PAYROLL_API_${env}_URL`]; // preserve input, if any
  }

  setTokens(tokens) {
    this.tokens = tokens;
  }

  setAdminTokens(tokens) {
    this.adminTokens = tokens;
  }

}

module.exports = CLIConfig;
