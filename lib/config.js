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
    this.devPort = parseInt(params.devPort) || null;
    this.env = (params.env) ? params.env.toUpperCase() : null;
    this.host = params.host || constants.DEFAULT_HOST;
    this.key = params.key || null;
    this.port = parseInt(params.port || constants.DEFAULT_PORT);
    this.preserveSymlinks = params.preserveSymlinks || false;
    this.requestedHost = this.host; // preserve original host value we got from user - in case we will need to overwrite it
    this.serveDist = params.serveDist || false;
    this.skipDependenciesCheck = params.skipDpCheck || false;
    this.ssl = params.ssl || false;
    this.token = params.token || null;
    this.tokens = {};
    this.verbose = params.verbose || false;
    this.vhost = params.vhost || false;
    this.watch = (_.isString(params.watch) ? parseInt(params.watch, 10) : params.watch) || false;
    this.debug = params.debug || false;

    // set env only if not set by user - for customer mode staging is default, otherwise - prod
    if (!this.env) {

      this.env = (this.accountType && this.accountType === constants.ACCT_TYPE_CUSTOMER) ?
        constants.ENV_TYPE_STAGING :
        constants.ENV_TYPE_PROD;

    }

    // set api url depending on env
    switch (this.env) {
      case constants.ENV_TYPE_DEV:
        this.apiBaseUrl = constants.API_DEV_URL;
        break;
      case constants.ENV_TYPE_PROD:
        this.apiBaseUrl = constants.API_PROD_URL;
        break;
      case constants.ENV_TYPE_STAGING:
        this.apiBaseUrl = constants.API_STAGING_URL;
        break;
      default:
        this.apiBaseUrl = constants.API_DEV_URL;
        break;
    }

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

  setTokens(tokens) {
    this.tokens = tokens;
  }

}

module.exports = CLIConfig;
