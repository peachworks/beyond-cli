'use strict';

const api = require('../api');

class PaqlReport {
  constructor(config, params) {
    this.api = api(config);
    this.params = params;
  }

  run(query) {
    return this.api
      .runWaql(query, this.params);
  }
}

module.exports = PaqlReport;