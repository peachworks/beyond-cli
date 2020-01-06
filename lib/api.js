'use strict';

let constants = require('./const');
let request   = require('request');
const _ = require('lodash')

function api(config) {

  let developer = config.accountType !== constants.ACCT_TYPE_CUSTOMER;

  /**
   * Simple wrapper to promisify request library.
   *
   * @param {Object} options
   * @return {Promise<any>}
   */
  function requestPromise(options) {
    return new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) {
          reject(error)
        } else {
          if(response.statusCode === 200) {
            resolve(body)
          } else {
            reject(new Error(`${response.statusCode} ${JSON.stringify(response.body, null, 2)}`))
          }
        }
      })
    })
  }

  /**
   * API wrapper with most common default parameters preset.
   *
   * @param {Object} options
   * @return {Promise<any>}
   */
  function apiRequestPromise(options) {
    return requestPromise(_.extend({
      baseUrl: config.apiBaseUrl,
      method: 'GET',
      json: true,
      headers: {
        Authorization: config.tokens.access_token
      }
    }, options))
  }

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
   * @param credentials { username: X, password: Y }
   */
  function login(credentials) {

    let options = {
      baseUrl : config.apiBaseUrl,
      uri     : (developer) ? constants.URL_DEV_LOGIN : constants.URL_CUSTOMER_LOGIN,
      method  : 'POST',
      json    : true,
      body    : credentials
    };

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
   * Login an admin
   * @param credentials { username: X, password: Y }
   * @returns {Promise} A promise containing the response with tokens.
   */
  function adminLogin(credentials) {

    let options = {
      baseUrl : config.apiBaseUrl,
      uri     : constants.URL_ADMIN_LOGIN,
      method  : 'POST',
      json    : true,
      body    : credentials
    };

    return new Promise((resolve, reject) => {

      request(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else if (error) {
          reject(error);
        } else {
          if(response.statusCode === 401) {
            reject('Incorrect username / password or user is not an admin.');
          } else {
            reject(response.statusCode);
          }
        }
      });

    });

  }

  /**
   * Call the admin metrics endpoint
   * @param queries {Object} An object holding the queries to run.
   * @returns {Promise<any>} A promise with the endpoints response.
   */
  function adminMetrics(queries){
    let options = {
      baseUrl : config.apiBaseUrl,
      uri     : constants.URL_ADMIN_METRICS,
      method  : 'POST',
      json    : true,
      body    : {queries},
      headers : {
        Authorization: config.adminTokens.access_token
      }
    };

    return new Promise((resolve, reject) => {

      request(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else if (error) {
          reject(error);
        } else {
          if(response.statusCode === 401) {
            reject('Incorrect username / password or user is not an admin.');
          } else {
            reject(response.statusCode);
          }
        }
      });

    });
  }

  /**
   * Impersonate a given user.
   * @param userId {number} Users id
   * @returns {Promise<any>} A promise with a response object holding users tokens.
   */
  function impersonateUser(userId){
    let options = {
      baseUrl : config.apiBaseUrl,
      uri     : constants.URL_IMPERSONATE + userId,
      method  : 'POST',
      json    : true,
      body    : {type: 'account'},
      headers : {
        Authorization: config.adminTokens.access_token
      }
    };

    return new Promise((resolve, reject) => {

      request(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(body);
        } else if (error) {
          reject(error);
        } else {
          if(response.statusCode === 401) {
            reject('Incorrect username / password or user is not an admin.');
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
   * Calls an endpoint
   * @param url string
   * @param method string
   * @param body string
   * @param qs string
   */
  function callEndpoint(uri, method, body, qs) {
    uri = uri.replace(':id', config.accountId || config.accounts[0].id);

    const options = {
      baseUrl : config.apiBaseUrl,
      uri     : uri,
      method  : method,
      json    : true,
      headers : {
        Authorization: config.tokens.access_token
      },
    };

    if (['post', 'put'].includes(method)) {
      options.body = body;
    }

    if (qs) {
      options.qs = qs;
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

  function getTriggers() {
    return apiRequestPromise({
      uri: '/v1/triggers'
    })
      // decorate triggers with file data
      .then(result => {
        let triggers = result.results
        let fileIds = _.map(triggers, 'file_id')
        return apiRequestPromise({
          uri: '/v1/files',
          qs: {
            find: JSON.stringify({
              id: fileIds
            })
          }
        })
          .then(result => {
            let files = result.results
            let filesMap = _.keyBy(files, 'id')
            return _.map(triggers, trigger => {
              trigger.file_id = filesMap[trigger.file_id]
              return trigger
            })
          })
      })
      // decorate triggers with object data
      .then(triggers => {
        let objectIds = _.map(triggers, 'object_id')
        return apiRequestPromise({
          uri: '/v1/objects',
          qs: {
            find: JSON.stringify({
              id: objectIds
            })
          }
        })
          .then(result => {
            let objects = result.results
            let objectsMap = _.keyBy(objects, 'id')
            return _.map(triggers, trigger => {
              trigger.object_id = objectsMap[trigger.object_id]
              return trigger
            })
          })
      })
  }

  return {
    adminLogin,
    adminMetrics,
    getAccounts,
    impersonateUser,
    login,
    runWaql,
    callEndpoint,
    getReports,
    getReportsContent,
    getTriggers
  };

};

module.exports = api;
