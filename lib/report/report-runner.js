require('colors');
const _ = require('./lodash-legacy');
const lodash4 = require('lodash');
const async = require('async');
const Big = require('big.js');
const crypto = require('crypto');
const constants = require('../const');
const dot = require('dot');
const moment = require('moment-timezone')
const rc = require('../peachrc');
const request = require('request');
const vm = require("vm");
const wtm = require('./wtm'); 
const xml = require('xml');
const xml2json = require('xml2json');

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
    console.log('Warning!'.gray.bold + ' If your report uses appId, then please provide `app_id` in `.peachrc` file\n'.gray);
  }

  return Object.assign(
    globalContext, {
      _,
      apiEndpoint: config.baseUrl,
      async,
      Big,
      Buffer,
      console,
      crypto,
      done: createDoneCallback(),
      dot,
      environment: process.env.NODE_ENV,
      lodash4,
      moment,
      peach: wtm(config),
      request,
      setTimeout,
      xml,
      xml2json,
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