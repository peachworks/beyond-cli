'use strict';

const api           = require('../lib/api');
const credentials   = require('../lib/credentials');

const adminLogin = (config) => {

  let loginPromise = null;

  if (config.key) {
    loginPromise = credentials().read(config.key);
  } else if (process.env.BEYOND_KEY) {
    loginPromise = credentials().read(process.env.BEYOND_KEY);
  } else {
    loginPromise = credentials().get();
  }

  return loginPromise

    .then((creds) => {
      return api(config).adminLogin(creds)
        .then((adminTokens) => {
          config.setAdminTokens(adminTokens);
        });
    })
    .then(() => {
      return true
    })
    .catch((error) => {
      console.error(error.message || error);
      return false;
    });

};

module.exports = adminLogin;
