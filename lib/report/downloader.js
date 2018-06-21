require('colors');
const api = require('../api');
const constants = require('../const');
const fs = require('fs');
const path = require('path');
const rc = require('../peachrc');

class Downloader {
  constructor(config) {
    this.config = config;
    this.api = api(config);
  }

  run() {
    if (this.checkCanRun()) {
      this.downloadReports();
    }
  }

  downloadReports() {
    Promise
      .all([
        this.api.getReports(rc.rcFile.app_id),
        this.api.getReportsContent(rc.rcFile.app_id)
      ])
      .then(response => {
        const reports = response[0].results;
        const files = response[1].results;

        files.forEach((file, i) => {
          this.saveAfile(file.name, file.content);
          this.saveParamsDefinition(file.name, reports[i]);
        });

        console.log(`Downloaded ${files.length} report${files.length === 1 ? '' : 's'}.`);
      });
  }

  saveAfile(fileName, content) {
    const filePath = path.join(process.cwd(), constants.REPORTS_PATH, fileName);

    fs.writeFile(filePath, content, error => {
      if (error) {
        console.log(error);
      }
    });
  }

  saveParamsDefinition(fileName, report) {
    const reportFile = path.parse(fileName);
    const paramsFileName = `${reportFile.name}.json`;
    const definitionFileName = `${reportFile.name}.def.json`;

    this.prepareParamsFile(paramsFileName, report.display_params);
    this.saveAfile(definitionFileName, JSON.stringify(report, null, 2));
  }
  
  prepareParamsFile(fileName, params) {
    const example = [];
    const today = new Date().toISOString().substring(0, 10);

    params.forEach(param => {
      if (param.type === 'object') {
        const eq = param.allow_multiple ? 'IN (1)' : '= 1';
        example.push(`${param.value} ${eq}`);

      } else if (param.type === 'date_range') {
        example.push(`DAY = '${today}'`);
      }
    });
    
    this.saveAfile(fileName, JSON.stringify(example, null, 2));
  }

  checkCanRun() {
    if (!rc.rcFile.app_id) {
      console.log('Missing key in the config file.'.bold.red);
      console.log('Please provide the `app_id` in `.peachrc` file'.red);

      return false;
    }

    if (this.config.accountType !== constants.ACCT_TYPE_DEVELOPER) {
      console.log('Unauthorized attempt to get reports'.bold.red);
      console.log('Only developers can download the reports'.red);

      return false;
    }

    return true;
  }
}

module.exports = Downloader;
