'use strict'

const login = require('./login')
const constants = require('./const')
const api = require('./api')
const _ = require('lodash')
const path = require('path')
const Bluebird = require('bluebird')
const fs = require('fs')

class TriggersProcess {
  constructor(config) {
    config.accountType = constants.ACCT_TYPE_DEVELOPER;
    this.api = api(config)
    this.config = config
  }

  pull() {
    login(this.config)
      .then((loggedIn) => {
        if (!loggedIn) {
          throw new Error(`Failed to log in`)
        }
        console.log(`API URL:`, this.config.apiBaseUrl)
        return this.api.getTriggers()
      })
      .then(triggers => {
        let baseDir = this.config.env

        // for each entry create file with contents overwriting existing ones
        return Bluebird.each(triggers, trigger => {
          let filePath = path.join(baseDir, trigger.object_id.api_name, trigger.file_id.name)
          console.log(`Pulling trigger`, trigger.id, filePath, trigger.file_id.content.length)

          fs.mkdirSync(path.dirname(filePath), {
            recursive: true
          })
          fs.writeFileSync(filePath, trigger.file_id.content)
        })
      })
      .catch(err => {
        console.error(err)
      })
  }

  push(objectName) {
    login(this.config)
      .then((loggedIn) => {
        if (!loggedIn) {
          throw new Error(`Failed to log in`)
        }
        console.log(`API URL:`, this.config.apiBaseUrl)
        // TODO update triggers in object path
        return this.api.getTriggers()
      })

    // TODO can we only overwrite if previous version was not changed from web editor? How could we distinguish that?
    console.log('PUSH', options)
  }
}

module.exports = TriggersProcess
