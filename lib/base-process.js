'use strict';

let _                    = require('lodash');
let constants            = require('./const');
let rc                   = require('./peachrc');

class BaseProcess {

  constructor(config) {

    this.config = config;
    this.framework = rc.framework;
    this.rcFile = rc.rcFile;

    // set default host if not given, preserve original value we got from user
    this.config.requested_host = this.config.host || constants.DEFAULT_HOST;
    // translate localhost addresses to 0.0.0.0 in vm mode
    this.config.host = this.config.vhost && constants.LOCALHOST_ADDRESSES.indexOf(this.config.requested_host) >= 0 ?
      constants.VM_SAFE_LOCALHOST_ADDRESS :
      this.config.requested_host;
    this.config.port = parseInt(this.config.port || constants.DEFAULT_PORT);
    this.config.devPort = parseInt(this.config.devPort) || null;
    this.config.watch = (_.isString(this.config.watch) ? parseInt(this.config.watch, 10) : this.config.watch) || false;
  }

}

module.exports = BaseProcess;
