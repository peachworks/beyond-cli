'use strict';

let colors = require('colors');

function setupConsoleLoggingHelpers() {

  colors.setTheme({
    silly   : 'rainbow',
    input   : 'grey',
    small   : 'grey',
    verbose : 'cyan',
    prompt  : 'grey',
    info    : 'white',
    data    : 'grey',
    help    : 'cyan',
    warn    : 'yellow',
    debug   : 'blue',
    error   : 'red'
  });

  let consoleInfo = console.info;
  console.info = function() {
    if (arguments.length === 1 && !arguments[0]) return;
    let msg = '';
    for (let n in arguments) {
      msg += arguments[n] + ' ';
    }
    consoleInfo.call(console, msg.white.bold);
  };

  let consoleVerbose = console.info;
  console.verbose = function() {
    if (arguments.length === 1 && !arguments[0]) return;
    let msg = '';
    for (let n in arguments) {
      msg += arguments[n] + ' ';
    }
    consoleVerbose.call(console, msg.cyan.bold);
  };

  let consoleError = console.error;
  console.error = function() {
    if (arguments.length === 1 && !arguments[0]) return;
    let msg = '';
    for (let n in arguments) {
      msg += ' ' + arguments[n];
    }
    consoleError.call(console, msg.red.bold);
  };

  let consoleWarn = console.warn;
  console.warn = function() {
    if (arguments.length === 1 && !arguments[0]) return;
    let msg = ' ✗';
    for (let n in arguments) {
      msg += ' ' + arguments[n];
    }
    consoleError.call(console, msg.warn.bold);
  };

  console.success = function() {
    if (arguments.length === 1 && !arguments[0]) return;
    let msg = ' ✓';
    for (let n in arguments) {
      msg += ' ' + arguments[n];
    }
    console.log(msg.green.bold);
  };
  
};

module.exports = setupConsoleLoggingHelpers;
