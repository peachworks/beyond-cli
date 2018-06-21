'use strict';

let constants = require('../const');
let request   = require('request');

function wtm(config) {

  const access_token = config.tokens.access_token;
  const baseUrl = config.apiBaseUrl;
  const qsStringifyOptions = {
    arrayFormat: 'brackets'
  };

  function get(uri, params, cb) {
    const {qs, callback} = setCallback(params, cb);
    const json = {access_token};

    request.get(
      {baseUrl, uri, qs, json, qsStringifyOptions},
      callCallback(callback)
    );
  }

  function post(uri, data, params, cb) {
    const {qs, callback} = setCallback(params, cb);
    const json = Object.assign({access_token}, data);

    request.post(
        {baseUrl, uri, qs, json, qsStringifyOptions},
        callCallback(callback)
    )
  }

  function put(uri, data, params, cb) {
    const {qs, callback} = setCallback(params, cb);
    const json = Object.assign({access_token}, data);

    request.put(
        {baseUrl, uri, qs, json, qsStringifyOptions},
        callCallback(callback)
    )
  };

  function del(uri, params, cb) {
    const {qs, callback} = setCallback(params, cb);

    request.del(
      {baseUrl, uri, qs, json, qsStringifyOptions},
      callCallback(callback)
    )
  }

  function delCollection(uri, collection, params, cb) {
    const {qs, callback} = setCallback(params, cb);
    const json = {access_token, collection};

    request.del(
      {baseUrl, uri, qs, json, qsStringifyOptions},
      callCallback(callback)
    )
  }

  // @todo - not implemented
  function alert(alert_key, params, cb) {
    callback(null, {status: 'not created'});
  }

  function log(...args) {
    console.log(...args);
  }

  function setCallback(qs, callback) {
    if (!callback) return {callback: qs, qs: {}};

    return {qs, callback};
  }

  function callCallback(callback) {
    return (error, response, body) => {
      if (error) {
        callback(error);
      } else if (response.statusCode !== 200) {
        callback(body);
      } else {
        callback(null, body);
      }
    }
  }

  return {
    get,
    post,
    put,
    del,
    delCollection,
    alert,
    log
  };

};

module.exports = wtm;
