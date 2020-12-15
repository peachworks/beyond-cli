const constants = require('./const');
const path = require('path');
const _ = require('lodash');

let rcFile;
let framework;

try {

  const rcFileMissingKey = null;
  rcFile = require('app-etc-load')(path.resolve(process.cwd() + '/' + constants.APP_RC_FILE), 'json');
  framework = constants.ANGULARJS;
  
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
  rcFile,
  framework
};
