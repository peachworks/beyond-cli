'use strict';

let _ = require('lodash');

class WebpackConfigBuilder {

  constructor() {}

  getBuildConfig(options = {}) {

    let extendedOptions = _.extend(
      {},
      options,
      {
        BUILD : true,
        DEV   : false,
        TEST  : false
      }
    );

    return require('./webpack.make')(extendedOptions);

  }

  getDevConfig(options = {}) {

    let extendedOptions = _.extend(
      {},
      options,
      {
        BUILD : false,
        DEV   : true,
        TEST  : false
      }
    );

    return require('./webpack.make')(extendedOptions);

  }

  getTestConfig(options = {}) {

    let extendedOptions = _.extend(
      {},
      options,
      {
        BUILD : false,
        DEV   : false,
        TEST  : true
      }
    );

    return require('./webpack.make')(extendedOptions);

  }
  
}

module.exports = WebpackConfigBuilder;
