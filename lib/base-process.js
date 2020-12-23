'use strict';

const rc = require('./peachrc');

class BaseProcess {

  constructor(config) {

    this.config = config;
    this.framework = rc.framework;
    this.rcFile = rc.rcFile;

  }

}

module.exports = BaseProcess;
