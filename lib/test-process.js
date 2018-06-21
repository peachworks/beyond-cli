'use strict';

let BaseProcess                = require('./base-process');
let constants                  = require('./const');
let ExtractTextPlugin          = require('extract-text-webpack-plugin');
let karmaServer                = require('karma').Server;
let path                       = require('path');
let WebpackConfigBuilder       = require('./config-builder');
let _                          = require('lodash');

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
        'sinon-chai'
      ],
      reporters: [
        'mocha',
        'coverage'
      ],
      files: [
        __dirname + '/../node_modules/babel-polyfill/dist/polyfill.min.js',
        __dirname + '/../node_modules/phantomjs-polyfill/bind-polyfill.js',
        // Grab all files in the app folder that contain .test.
        'client/app/tests.webpack.js'
      ],
      preprocessors: {
        'client/app/tests.webpack.js': ['webpack', 'sourcemap']
      },
      browsers: [
        'PhantomJS'
      ],
      autoWatch : true,
      singleRun: !this.config.watch,
      coverageReporter: {
        dir: 'coverage/',
        reporters: [
          { type: 'lcov', subdir: '.' },
          { type: 'text', subdir: '.' },
          { type: 'cobertura', subdir: '.', file: 'cobertura-coverage.xml' }
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
