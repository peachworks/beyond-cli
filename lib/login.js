'use strict';

const api           = require('../lib/api');
const credentials   = require('../lib/credentials');

const login = (program, config) => {
  let loginPromise = null;

  if (program.token) {
    loginPromise = credentials().token(program.token);
  } else if (program.key) {
    loginPromise = credentials().read(program.key);
  } else if (process.env.BEYOND_KEY) {
    loginPromise = credentials().read(process.env.BEYOND_KEY);
  } else {
    loginPromise = credentials().get();
  }

  return loginPromise
    .then((creds) => {
      return api(config).login(creds);
    })
    .then((tokens) => {
      config.tokens = tokens;
      return api(config).getAccounts();
    })
    .then((accounts) => {
      config.accounts = accounts;
    })
    .catch((error) => {
      console.error(error.message || error);
    });

};

module.exports = login;