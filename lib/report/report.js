require('colors');
const constants = require('../../lib/const');
const fs = require('fs');
const isInvalidPath = require('is-invalid-path');
const JsReport = require('./js-report');
const PaqlReport = require('./paql-report');
const path = require('path');
const program = require('commander');
const Table = require('cli-table3');

class Report {
  constructor(config) {
    this.config = config;
    this.isPaql = null;
    this.params = [];
    this.reportFileContent = null;
    this.table = new Table({
      style: {
        head: ['cyan'],
        compact: true
      }
    });

    this.readReportFile();
  } 
  
  run() {
    let report;

    if (this.isPaql) {
      report = new PaqlReport(this.config, this.params);
    } else {
      report = new JsReport(this.config, this.params);
    }

    report
      .run(this.reportFileContent)
      .then(response => this.print(response));
  }

  print(response) {
    if (response.error) {
      this.printError(response.error);

    } else if (Array.isArray(response.results) && Array.isArray(response.columns)) {
      if (response.results.length === 0) {
        console.log('An empty result set'.gray);

      } else {
        if (program.export) {
          this.exportToCsv(response, program.export);
        } else {
          this.printTable(response);
        }
      }

    } else {
      console.log('Warning!'.gray.bold + '  The `done` callback should be called with the format of:\ndone(null, {results: [[]], columns: [{name}]})\n'.gray);
      console.log(response);
    }
  }

  printTable(response) {
    this.table.push(...response.results);
    this.table.options.head = this.getColumns(response);

    console.log(this.table.toString());
  }

  exportToCsv(response, filename) {
    const separator = ',';
    const wrapper = '"';
    const table = [
      this.getColumns(response),
      ...response.results
    ];

    const csv = table
      .map(row => {
        return row
          .map(cell => {
            if (cell.includes(separator)) {
              cell = `${wrapper}${cell}${wrapper}`;
            }
            return cell;
          })
          .join(separator);
      })
      .join("\n");

    fs.writeFile(filename, csv, error => {
      if (error) {
        error.status = 'fs';
        error.name = '✗ The file has not been saved'
        this.printError(error);
      } else {
        console.log('✓ The file has been saved'.green);
        console.log(`${response.results.length} rows into ${path.resolve(filename)}`);
      }
    });
  }
  
  getColumns(response) {
    return response.columns
      .map(column => column[0] || column)
      .map((column, i) => column && column.name ? column.name : `Column ${i + 1}`);
  }

  printError(error) {
    if (!error.status) {
      throw error;
    }

    if (!error.name) {
      error.name = 'Error';
    }

    console.log(error.name.red.bold);

    if (error.message && error.message !== 'invalid') {
      console.log(error.message.red);
    }

    if (error.fields) {
      for (const field in error.fields) {
        if (field.indexOf('Error') > -1) {
          const name = error.fields[field].name || 'invalid';

          console.log(name.red);
          console.log(error.fields[field].message);
        }
      }
    }
  }

  readReportFile() {
    if (program.args.length === 0) {
      throw `Please enter the file name from ${constants.REPORTS_PATH} directory`;
    }

    const reportFile = path.parse(program.args[0]);
    
    if (!['.js', '.paql'].includes(reportFile.ext)) {
      throw 'Only *.js or *.paql files are supported';
    }

    this.isPaql = reportFile.ext === '.paql';
    this.reportFileContent = fs.readFileSync(
      path.join(process.cwd(), constants.REPORTS_PATH, reportFile.base), 
      'UTF-8'
    );

    if (!this.reportFileContent) {
      throw 'The file seems to be empty';
    }

    this.parseDisplayParameters(reportFile.name);
  }

  parseDisplayParameters(reportFileName) {
    let params = null;

    if (program.params && !program.params.endsWith('.json')) {
      params = this.parseRawParameters(program.params);
    } else {
      const paramsFileName = this.getParamsFileName(reportFileName);
      params = this.parseParametersFile(paramsFileName);
    }
    
    if (params) {
      try {
        this.params = JSON.parse(params);
      } catch (err) {
        throw 'Syntax Error parsing parameters'.red.bold + '\n' + err.message.red;
      }

      if (this.params.display_params) {
        this.params = this.params.display_params;
      }
    }
  }

  parseRawParameters(params) {

    if (!['[', '{'].includes(params.trim().charAt(0))) {
      return JSON.stringify(
        params
          .trim()
          .split(/,(?![^\(\[]*[\]\)])/g)
          .map(param => param.trim())
      );
    }

    return params;
  }

  getParamsFileName(reportFileName) {
    if (program.params) {
      if (path.extname(program.params) !== '.json') {
        throw 'Only *.json files are supported as params or raw JSON or list of params separated by comma';
      }

      return path.join(process.cwd(), program.params);
    }

    return path.join(process.cwd(), constants.REPORTS_PATH, `${reportFileName}.json`);
  }
  
  parseParametersFile(paramsFileName) {
    try {
      return fs.readFileSync(
        paramsFileName, 
        'UTF-8'
      );
    } catch (err) {
      if (program.params) {
        throw 'Can\'t read the parameters file';
      }

      return null;
    }
  }
}

module.exports = Report;
