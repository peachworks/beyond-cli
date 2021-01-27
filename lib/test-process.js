'use strict';

const _ = require('lodash'),
  BaseProcess = require('./base-process'),
  constants = require('./const'),
  isDocker = require('is-docker')(),
  karmaServer = require('karma').Server,
  launcherFlags = [
    '--headless',
    '--disable-gpu',
    '--disable-web-security',
    '--remote-debugging-address=0.0.0.0',
    '--remote-debugging-port=9222'
  ],
  WebpackConfigBuilder = require('./config-builder');

process.env.CHROME_BIN = require('puppeteer').executablePath();

// We must disable the Chrome sandbox when running Chrome inside Docker
// (Chrome's sandbox needs more permissions than Docker allows by default)
if (isDocker) {
  launcherFlags.unshift('--no-sandbox');
}

class TestProcess extends BaseProcess {

  constructor(config) {
    super(config);
  }

  test() {
      
    if (this.framework === constants.ANGULAR) {
      console.warn('Please run your tests for Angular 5+ app using angular CLI - ng test')
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
        'coverage',
        'junit'
      ],
      files: [
        // Grab all files in the app folder that contain .test.
        'client/app/tests.webpack.js'
      ],
      preprocessors: {
        'client/app/tests.webpack.js': ['webpack', 'sourcemap']
      },
      browsers: ['ChromeHeadlessNoSandbox'],
      customLaunchers: {
        'ChromeHeadlessNoSandbox': {
          base: 'ChromeHeadless',
          flags: launcherFlags
        }
      },
      autoWatch : true,
      singleRun: !this.config.watch,
      coverageReporter: {
        dir: this.config.coverageDir,
        reporters: [
          { type: 'text', subdir: '.' },
          { type: 'cobertura', subdir: '.', file: 'cobertura-coverage.xml' }
        ]
      },
      junitReporter: {
        outputDir: 'coverage/',
        outputFile: 'report.xml',
        suite: 'beyond-js',
        useBrowserName: false
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
