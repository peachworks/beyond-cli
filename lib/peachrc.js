const  _ = require('lodash'),
  constants = require('./const'),
  fs = require('fs'),
  path = require('path');

let appType = constants.APP_TYPE_IFRAME,
  framework = constants.ANGULARJS,
  rcFile;

try {

  let rcFileMissingKey = null;

  if (fs.existsSync(path.resolve(process.cwd() + '/' + constants.APP_RC_FILE))) {
    rcFile = require('app-etc-load')(path.resolve(process.cwd() + '/' + constants.APP_RC_FILE), 'json');
  } else if (fs.existsSync(path.resolve(process.cwd() + '/client/' + constants.APP_RC_FILE))) {
    rcFile = require('app-etc-load')(path.resolve(process.cwd() + '/client/' + constants.APP_RC_FILE), 'json');
  } else {
    throw `${constants.APP_RC_FILE} file missing`
  }

  _.each(
    constants.REQUIRED_RCFILE_KEYS,
    (key) => {
      if (!_.get(rcFile, key)) {
        rcFileMissingKey = key;
        return false;
      }
    }
  );

  if (rcFileMissingKey) {
    throw 'You are missing the top level ' + rcFileMissingKey + ' attribute in ' + constants.APP_RC_FILE;
  }

  let type = _.get(rcFile, 'type');

  appType = [
    constants.APP_TYPE_IFRAME,
    constants.APP_TYPE_STANDALONE
  ].indexOf(type) === -1 ? appType : type;

  framework = _.isObject(rcFile.framework) ?
    _.get(_.keys(rcFile.framework), 0, null) :
    rcFile.framework;

  if (
    framework === constants.ANGULAR &&
    (
      !_.isObject(rcFile.framework) ||
      !rcFile.framework[constants.ANGULAR].root_selector
    )
  ) {
    throw 'You are missing the "root_selector" attribute in ' + constants.APP_RC_FILE;
  }

} catch (ex) {
  throw 'There was a problem with your ' + constants.APP_RC_FILE + ' file \n' + ex;
}

module.exports = {
  appType,
  framework,
  rcFile
};
