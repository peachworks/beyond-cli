'use strict';

let constants = require('./const');
let request   = require('request');

function api(config) {
  
  let developer = config.accountType !== constants.ACCT_TYPE_CUSTOMER;

  /**
   * Returns a promise to retrieve a list of the logged in users accounts
   */
  function getAccounts() {

    let options = {
      baseUrl : config.apiBaseUrl,
      uri     : (developer) ? constants.URL_DEV_ACCOUNTS : constants.URL_CUSTOMER_ACCOUNTS,
      method  : 'GET',
      json    : true,
      headers : {
        Authorization: config.tokens.access_token
      }
    };

    return new Promise((resolve, reject) => {

      request(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve((developer) ? body.developer_accounts : body.results);
        } else if (error) {
          reject(error);
        } else {
          if(response.statusCode === 401) {
            reject('Unauthorized attempt to get account information');
          } else {
            reject(response.statusCode);
          }
        }
      });

    });

  }

  /**
   * Login the user
   * @param credentials { username: X, password: Y } OR { token: X }
   */
  function login(credentials) {

    let options = {
      baseUrl : config.apiBaseUrl,
      uri     : (developer) ? constants.URL_DEV_LOGIN : constants.URL_CUSTOMER_LOGIN,
      method  : 'POST',
      json    : true,
      body    : credentials
    };

    if (credentials.token) {
      options.uri = constants.URL_OAUTH_TOKEN;
      options.body = {
        refresh_token : credentials.token,
        grant_type    : 'refresh_token',
        key           : 'core'
      };
    }

    return new Promise((resolve, reject) => {

      request(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else if (error) {
          reject(error);
        } else {
          if(response.statusCode === 401) {
            reject('Incorrect username and/or password');
          } else {
            reject(response.statusCode);
          }
        }
      });

    });

  }

  /**
   * Executes a waql
   * @param query string 
   * @param params json 
   */
  function runWaql(query, params) {
    const uri = constants.URL_WAQL.replace(':id', config.accountId || config.accounts[0].id);

    const options = {
      baseUrl : config.apiBaseUrl,
      uri     : uri,
      method  : 'POST',
      json    : true,
      headers : {
        Authorization: config.tokens.access_token
      },
      body    : {
        query
      }
    };

    if (params && params.length) {
      options.body.params = params;
    }

    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }

  /**
   * Returns a promise to retrieve a list of the reports
   */
  function getReports(appId) {

    let options = {
      baseUrl : config.apiBaseUrl,
      uri     : constants.URL_REPORTS,
      method  : 'GET',
      json    : true,
      headers : {
        Authorization: config.tokens.access_token
      },
      qs      : {
        find: JSON.stringify({
          app_id: appId
        })
      }
    };

    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });

  }

  /**
   * Returns a promise to retrieve a content of the reports
   */
  function getReportsContent(appId) {

    let options = {
      baseUrl : config.apiBaseUrl,
      uri     : constants.URL_FILES,
      method  : 'GET',
      json    : true,
      headers : {
        Authorization: config.tokens.access_token
      },
      qs      : {
        find: JSON.stringify({
          app_id: appId,
          type: 'report'
        })
      }
    };

    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });

  }

  return {
    getAccounts,
    login,
    runWaql,
    getReports,
    getReportsContent
  };

};

module.exports = api;
