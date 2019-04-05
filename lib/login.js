'use strict';

const api           = require('../lib/api');
const credentials   = require('../lib/credentials');
const impersonate   = require('../lib/impersonate');

const login = (config) => {

  let loginPromise = null;

  if (config.token) {
    loginPromise = credentials().token(config.token);
  } else if (config.key) {
    loginPromise = credentials().read(config.key);
  } else if (process.env.BEYOND_KEY) {
    loginPromise = credentials().read(process.env.BEYOND_KEY);
  } else {
    loginPromise = credentials().get();
  }

  if(config.imp) {
    loginPromise = loginPromise
      .then(creds => api(config).adminLogin(creds))
      .then((adminTokens) => {
        config.setAdminTokens(adminTokens);
      })
      .then(() => {
        return config.imp === true ?
          impersonate(config).getTokensForAccountOwner(config.accountId) :
          impersonate(config).getTokensForUser(config.imp)
      })
      .then(tokens => ({token: tokens.refresh_token}));
  }

  return loginPromise
    .then((creds) => {
      return api(config).login(creds);
    })
    .then((tokens) => {
      config.setTokens(tokens);
      return api(config).getAccounts();
    })
    .then((accounts) => {
      config.setAccounts(accounts);
      return true;
    })
    .catch((error) => {
      console.error(error.message || error);
      return false;
    });

};

module.exports = login;
