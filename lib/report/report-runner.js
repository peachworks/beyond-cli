require('colors');
const _ = require('./lodash-legacy');
const lodash4 = require('lodash');
const async = require('async');
const Big = require('big.js');
const Bluebird = require('bluebird');
const crypto = require('crypto');
const constants = require('../const');
const dot = require('dot');
const moment = require('moment-timezone')
const rc = require('../peachrc');
const request = require('request');
const vm = require("vm");
const wtm = require('./wtm'); 
const xml = require('xml');
// to enable, add xml2json in package.json
// I have removed it, because it doesnt seem to be used by any report, yet
// causes a lot of problems while being installed (node-gyp rebuild errors)
// const xml2json = require('xml2json');
const analytics = {
  track: console.log.bind(this, 'analytics.track -->')
};

process.on('message', function(data) {
  const report = vm.createScript(data.report);
  const context = createContext(data.config, data.params);
  const options = {
    filename: 'report.vm',
    displayErrors: true
  };

  report.runInNewContext(context, options);
});

function createContext(config, params) {
  // @todo: what about these, which require 'peach-js-api-lib'
  // peachPos: peachPosApiJsLib,
  // peachSupplier: peachSupplierApiJsLib,
  // PeachOvertimeCalculator: require('peach-overtime-calculator'),
  // @ref https://github.com/peachworks/Peach-Untrusted-API/blob/master/lib/sandbox/index.js#L156
  
  const globalContext = {
    accessToken: config.tokens.access_token,
    accountId: config.accountId || config.accounts[0].id,
    appId: rc.rcFile.app_id,
    isDeveloper: config.accountType !== constants.ACCT_TYPE_CUSTOMER,
    params
  };

  delete dot.process;

  if (!globalContext.appId) {
    console.log('Warning!'.gray.bold + ' If your report uses appId, then please provide `app_id` in `' + constants.APP_RC_FILE + '` file\n'.gray);
  }

  return Object.assign(
    globalContext, {
      _,
      analytics,
      apiEndpoint: config.baseUrl,
      async,
      Big,
      Bluebird,
      Buffer,
      checkoutApiUrl: config.checkoutApiUrl,
      checkoutStoreUrl: config.checkoutClientUrl,
      console,
      crypto,
      done: createDoneCallback(),
      dot,
      environment: process.env.NODE_ENV,
      lodash4,
      moment,
      payrollApiUrl: config.payrollApiUrl,
      peach: wtm(config),
      request,
      setTimeout,
      xml,
      // xml2json,
      wtm: wtm(config)
  });
}

function createDoneCallback() {
  return (error, response) => {
    if (error) {
      if (!error.error) {
        error = {error};
      }
      process.send(error);
    } else {
      process.send(response || 'An empty response');
    }
  }
}
