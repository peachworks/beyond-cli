'use strict';

let _ = require('lodash');

class WebpackConfigBuilder {

  constructor() {}

  getBuildConfig(options) {

    if (_.isUndefined(options)) {
      options = {};
    }

    _.merge(
      options,
      {
        BUILD : true,
        DEV   : false,
        TEST  : false
      }
    );

    return require('./webpack.make')(options);

  }

  getDevConfig(options) {

    if (_.isUndefined(options)) {
      options = {};
    }

    _.merge(
      options,
      {
        BUILD : false,
        DEV   : true,
        TEST  : false
      }
    );

    return require('./webpack.make')(options);

  }

  getTestConfig(options) {

    if (_.isUndefined(options)) {
      options = {};
    }

    _.merge(
      options,
      {
        BUILD : false,
        DEV   : false,
        TEST  : true
      }
    );

    return require('./webpack.make')(options);

  }
  
}

module.exports = WebpackConfigBuilder;
