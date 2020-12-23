'use strict';

const _ = require('lodash'),
  BaseProcess = require('./base-process'),
  constants = require('./const'),
  karmaServer = require('karma').Server,
  WebpackConfigBuilder = require('./config-builder');

process.env.CHROME_BIN = require('puppeteer').executablePath()

class TestProcess extends BaseProcess {

  constructor(config) {
    super(config);
  }

  test() {
      
    if (this.framework === constants.ANGULAR) {
      console.warn('Please run your tests for Angular 5 app using angular CLI - ng test')
      return false;
    }

    let webpackConfigBuilder = new WebpackConfigBuilder();
    let webpackConfig = webpackConfigBuilder.getTestConfig(_.extend({}, this.config, {framework: this.framework}));
    let karmaConfig = {
      frameworks: [
        'mocha',
        'sinon-chai',
        'webpack'
      ],
      reporters: [
        'mocha',
        'coverage'
      ],
      files: [
        // Grab all files in the app folder that contain .test.
        'client/app/tests.webpack.js'
      ],
      preprocessors: {
        'client/app/tests.webpack.js': ['webpack', 'sourcemap']
      },
      browsers: [
        'ChromeHeadless'
      ],
      autoWatch : true,
      singleRun: !this.config.watch,
      coverageReporter: {
        dir: this.config.coverageDir,
        reporters: [
          { type: 'lcov', subdir: '.' },
          { type: 'text', subdir: '.' }
        ]
      },
      mochaReporter: {
        showDiff: true
      },
      webpack: webpackConfig,
      // Hide webpack build information from output
      webpackMiddleware: {
        noInfo: true
      }
    };

    let server = new karmaServer(karmaConfig, (exitCode) => {
      process.exit(exitCode);
    });

    server.start();
    
  }
}

module.exports = TestProcess;
