'use strict';

let _                    = require('lodash');
let constants            = require('./const');
let rc                   = require('./peachrc');

class BaseProcess {

  constructor(config) {

    this.appType = rc.appType;
    this.config = config;
    this.framework = rc.framework;
    this.rcFile = rc.rcFile;

  }

}

module.exports = BaseProcess;
