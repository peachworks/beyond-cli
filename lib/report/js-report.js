'use strict';

const cluster = require('cluster');

class JsReport {
  constructor(config, params) {
    this.config = config;
    this.params = params;

    let fixedExecArgv = [];

    if (config.debug) { 
     fixedExecArgv.push('--inspect');
    }

    cluster.setupMaster({
      exec : `${__dirname}/report-runner.js`,
      execArgv: fixedExecArgv 
    });
  }

  run(report) {
    return new Promise(resolve => {
      cluster.on('online', worker => {

        // resolve results from worker and kill him!
        worker.on('message', response => {
          resolve(response);
          worker.isDead() || worker.kill();
        });

        // send data to the worker
        worker.send({
          report, 
          config: this.config,
          params: this.params
        });
      });
      
      cluster.fork();
    });
  }
}

module.exports = JsReport;