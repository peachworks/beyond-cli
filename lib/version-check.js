'use strict';

let request = require('request');

function versionCheck(resolve, reject) {

  let options = {
    baseUrl : 'https://api.github.com',
    uri     : '/repos/getbeyond/beyond-cli/releases/latest',
    method  : 'GET',
    json    : true,
    headers : {
      'User-Agent': 'getbeyond/beyond-cli'
    }
  };

  request(options, (error, response, body) => {
    if (error) {
      reject(error);
      return false;
    }
    if (response.statusCode !== 200) {
      reject('github connection error at versionCheck');
      return false;
    }
    resolve(body);
  });

};

module.exports = versionCheck;
