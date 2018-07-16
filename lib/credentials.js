'use strict';

let constants = require('./const');

function credentials() {

  /**
   * Returns a promise to get credentials from prompt
   */
  function get() {

    return new Promise((resolve, reject) => {

      let prompt = require('prompt');
      let properties = [
        {
          name   : 'username'
        },
        {
          name   : 'password',
          hidden : true
        }
      ];

      console.info('----------------------------------------------------------');
      console.info('Login with your Beyond account to continue');
      console.info('----------------------------------------------------------');

      prompt.message = '';
      prompt.delimiter = '';
      prompt.start();

      prompt.get(properties, (err, result) => {
        if (err) {
          reject(err);
          return 1;
        }
        resolve(result);
      });

    });

  }

  /**
   * Returns a promise to read and parse credentials from file
   */
  function read(file) {

    return new Promise((resolve, reject) => {

      let fs = require('fs');
      let path = require('path');

      if (file[0] === '~') {
        file = path.join(process.env.HOME, file.slice(1));
      }

      fs.readFile(path.resolve(file), (err, data) => {

        let content = '';
        let splitter = 0;

        if (err) {
          reject(err);
          return 1;
        }

        if (Buffer.isBuffer(data)) {
          content = data.toString('utf8');
        } else {
          content = data;
        }

        splitter = content.indexOf(constants.CREDS_FILE_SPLITTER);

        resolve({
          username : content.substring(0, splitter).replace(/^\s+|\s+$/g, ''),
          password : content.substring(splitter + 1).replace(/^\s+|\s+$/g, '')
        });

      });

    });

  }

  /**
   * Returns a promise to immediately resolve the token
   */
  function token(token) {

    return new Promise((resolve) => {
      resolve({
        token: token
      });
    });

  }

  return {
    get   : get,
    read  : read,
    token : token
  };

};

module.exports = credentials;
