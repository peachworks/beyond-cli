'use strict';

let request = require('request');

function versionCheck(resolve, reject) {

  const options = {
    baseUrl : 'https://registry.npmjs.org',
    uri     : '/@getbeyond/beyond-cli',
    method  : 'GET',
    json    : true,
    headers : {
      'User-Agent': 'getbeyond/beyond-cli'
    }
  };

  return new Promise((resolve, reject) => {
    return request(options, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      if (response.statusCode !== 200) {
        return reject('NPM registry connection error');
      }
      return resolve(body);
    });
  });

};

module.exports = versionCheck;
