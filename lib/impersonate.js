'use strict';

const api       = require('./api');

function impersonate(config) {

  /**
   * Get impersonation tokens of an account owner.
   * @param accountId
   * @returns Promise<any>
   */
  function getTokensForAccountOwner(accountId){
    return getTokensByQuery(
      "SELECT u.id, u.first_name, u.last_name from accounts a JOIN users u ON u.id = a.owned_by where a.id = " +
      accountId
    );
  }

  /**
   * Get impersonation tokens of a user.
   * @param email
   * @returns Promise<any>
   */
  function getTokensForUser(email){
    return getTokensByQuery("SELECT u.id, u.first_name, u.last_name from users u where u.email = '" + email + "'");
  }
  /**
   * @param query {string} The query which should return a user to impersonate (with fields id, first_name, last_name);
   * Returns a promise with tokens
   */
  function getTokensByQuery(query) {
    return api(config).adminMetrics({users: query})
      .then((response) => {
        if(response.results.users && response.results.users.length){
          let user = response.results.users[0];
          console.log('Impersonating user: ' + user.first_name + ' ' + user.last_name);
          return user;
        }
      })
      .then(user => api(config).impersonateUser(user.id))
  }

  return {
    getTokensForAccountOwner,
    getTokensForUser
  };

}

module.exports = impersonate;
