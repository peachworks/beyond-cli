'use strict';

const _ = require('lodash'),
  BaseProcess = require('./base-process'),
  constants = require('./const'),
  fs = require('fs'),
  os = require('os'),
  rimraf = require('rimraf'),
  spawn = require('child_process').spawn,
  webpack = require('webpack'),
  WebpackConfigBuilder = require('./config-builder');

class BuildProcess extends BaseProcess {

  constructor(config) {
    super(config);
  }

  build() {

    try {

      let cleanPromise = new Promise(this.clean.bind(this));

      cleanPromise
        .then(() => {

          return new Promise(this.dependenciesCheck.bind(this));

        })
        .then(() => {

          console.info('\nBeginning build...');

          if (this.framework === constants.ANGULAR) {

            let buildOpts = _.clone(constants.NG_CLI_BUILD_PARAMS);

            buildOpts.push(`--output-path=${this.config.distDir}`);

            if (this.config.verbose) {
              buildOpts.push('---progress=true');
            }
            if (this.config.preserveSymlinks) {
              buildOpts.push('--preserve-symlinks=true');
            }

            return new Promise((resolve, reject) => {
              let angularCLIPath = 
                fs.existsSync(`${process.cwd()}/node_modules/@angular/cli/bin/ng`) ?
                  `${process.cwd()}/node_modules/@angular/cli/bin/ng` :
                  'ng';
              let angularCLIBuildCommand;

              if (!/^win/.test(process.platform)) {
                angularCLIBuildCommand = spawn(angularCLIPath, buildOpts);
              }else{
                angularCLIBuildCommand = spawn(angularCLIPath, buildOpts, {shell: true});
              }

              angularCLIBuildCommand.stdout.on('data', (data) => {
                process.stdout.write(data.toString());
              });

              angularCLIBuildCommand.stderr.on('data', (data) => {
                process.stdout.write(data.toString());
              });

              angularCLIBuildCommand.on('error', (err) => {
                throw(err);
              });

              angularCLIBuildCommand.on('close', (code) => {
                this.successfullyCompiled();
                resolve();
              });

            });

          } else {
        
            let webpackConfigBuilder = new WebpackConfigBuilder();
            let webpackConfig = webpackConfigBuilder.getBuildConfig(_.extend({}, this.config, {framework: this.framework}));

            // returns a Compiler instance
            webpack(webpackConfig, (err, stats) => {

              if (err) {
                return this.handleFatalError(err);
              }

              let jsonStats = stats.toJson();

              if (jsonStats.errors.length > 0) {
                return this.handleSoftErrors(jsonStats.errors);
              }

              if (jsonStats.warnings.length > 0 && this.config.verbose) {
                this.handleWarnings(jsonStats.warnings);
              }

              this.successfullyCompiled();

            });

          }

        })
        .catch((error) => {
          console.error(error);
        });

    } catch (ex) {

      console.error(ex);
      console.error(ex.stack);
      return false;

    }

  }

  clean(resolve, reject) {

    console.info('\nCleaning up ' + this.config.distDir + ' directory...');

    rimraf(
      process.cwd() + '/' + this.config.distDir,
      (err) => {
        if (err) {
          reject(err);
          return false;
        }
        resolve(true);
      }
    );

  }

  dependenciesCheck(resolve, reject) {

    let npmOutdatedCommand;
    let npmOutdatedCommandOutput = '';
    let npmOutdatedCommandError = '';

    if (this.config.skipDependenciesCheck) {
      resolve();
      return;
    }

    console.info('\nChecking dependencies...');

    if (!/^win/.test(process.platform)) {
      npmOutdatedCommand = spawn('npm', ['outdated']);
    }else{
      npmOutdatedCommand = spawn('npm', ['outdated'], {shell: true});
    }

    npmOutdatedCommand.stdout.on('data', (data) => {
      data = data.toString();
      npmOutdatedCommandOutput = data;
      _.each(
        _.get(constants, ['REQUIRED_UP_TO_DATE_DEPS', this.framework], []),
        (dp) => {
          if (data.includes(dp)) {
            let rest = data.slice(data.indexOf(dp));
            let dpString = os.EOL + rest.slice(0, rest.indexOf(os.EOL));
            npmOutdatedCommandError += dpString;
            npmOutdatedCommandOutput = npmOutdatedCommandOutput.replace(dpString, '');
          }
          return;
        }
      );
      npmOutdatedCommandOutput = npmOutdatedCommandOutput.trim();
      npmOutdatedCommandError = npmOutdatedCommandError.trim();
      if(npmOutdatedCommandOutput) {
        console.log('You may consider updating these packages:');
        console.log(npmOutdatedCommandOutput);
      }
      if (npmOutdatedCommandError) {
        console.error(os.EOL + 'Packages listed below have to be updated to latest version, stopping build.');
        console.error(npmOutdatedCommandError);
      }
    });

    npmOutdatedCommand.stderr.on('data', (data) => {
      data = data.toString();
      console.error(data);
    });

    npmOutdatedCommand.on('error', (err) => {
      throw(err);
    });

    npmOutdatedCommand.on('close', (code) => {
      if (npmOutdatedCommandError) {
        reject();
      }
      resolve();
    });

  }

  handleFatalError(err) {
    console.error(err);
  }

  handleSoftErrors(jsonErrors) {
    console.error(jsonErrors.join(os.EOL));
  }

  handleWarnings(jsonWarnings) {
    console.warn(jsonWarnings.join(os.EOL));
  }

  successfullyCompiled() {
    console.success('Build complete!\n');
  }
}

module.exports = BuildProcess;
