require('colors');
const api = require('../api');
const constants = require('../../lib/const');
const fs = require('fs');
const path = require('path');
const program = require('commander');
const Table = require('cli-table3');

class Query {
  constructor(config) {
    this.api = api(config);

    this.object = program.args[0];
    this.url = program.url;
    this.method = program.method.toLowerCase();
    this.json = program.json;
    this.export = program.export;
    this.find = program.find;
    // this.findIncludes = program.findIncludes;
    // this.includes = program.includes;
    this.fields = program.fields;
    this.sort = program.sort;
    this.limit = program.limit;
    this.page = program.page;

    this.table = new Table({
      style: {
        head: ['cyan'],
        compact: true
      }
    });
  } 
  
  run() {

    if (!this.object && !this.url) {
      this.printError('Please provide an object name or an URL');
    }

    const uri = this.url || constants.URL_RESOURCE.replace(':resource', this.object);
    const body = null;
    const qs = this.buildParams();
    
    this.api
      .callEndpoint(uri, this.method, body, qs)
      .then(this.print.bind(this));
  }

  print(response) {
    if (response.error) {
      return this.printError(response.error);
    }

    let results = [];
    
    if (response.results && Array.isArray(response.results)) {
      results = response.results;
    } else {
      results = [response];
    }

    if (results.length === 0) {
      this.printError('An empty result set'.gray);
    }
    
    if (this.export) {
      this.exportToCsv(results, this.export);
    } else {
      this.printTable(results);
      console.log(`Total: ${response.count || results.length}, Limit: ${this.limit}`.gray);
    }
  }

  printTable(results) {
    this.table.push(...results.map(Object.values));
    this.table.options.head = this.getColumns(results);

    console.log(this.table.toString());
  }

  exportToCsv(results, filename) {
    const separator = ',';
    const wrapper = '"';
    const table = [
      this.getColumns(results),
      ...results.map(Object.values)
    ];

    const csv = table
      .map(row => {
        return row
          .map(cell => {
            if (cell && typeof cell === 'string' && cell.includes(separator)) {
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
        console.log(`${results.length} rows into ${path.resolve(filename)}`);
      }
    });
  }

  getColumns(results) {
    return Object.keys(results[0]);
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

  buildParams() {
    if (this.json) {
      return this.parseFile();
    }

    return this.parseOptions();
  }

  parseFile() {
    let content;

    try {
      content = fs.readFileSync(this.json, 'utf8');
    } catch (error) {
      this.printError(`Cannot read a file ${this.json}`);      
    }

    if (!content) {
      this.printError(`It seems a file ${this.json} is empty`);
    }

    const parsed = JSON.parse(content);

    if (parsed.find) {
      parsed.find = JSON.stringify(parsed.find);
    }

    // if (parsed.findIncludes) {
    //   parsed.findIncludes = JSON.stringify(parsed.findIncludes);
    // }

    return parsed;
  }

  parseOptions() {
    const qs = {
      limit: this.limit
    };

    if (this.find) {
      const find = {};
      let key, value;

      this.find
        .split(/,(?![^'"{\(\[]*['"}\]\)])/g)
        .forEach(pair => {
          switch (true) {
            case />=/.test(pair):
              [key, value] = pair.split('>=').map(p => p.trim());
              value = `{"$gte":${value}}`;
              break;
            case /<=/.test(pair):
              [key, value] = pair.split('<=').map(p => p.trim());
              value = `{"$lte":${value}}`;
              break;
            case />/.test(pair):
              [key, value] = pair.split('>').map(p => p.trim());
              value = `{"$gt":${value}}`;
              break;
            case /</.test(pair):
              [key, value] = pair.split('<').map(p => p.trim());
              value = `{"$lt":${value}}`;
              break;
            default: 
              [key, value] = pair.split(/:|=/).map(p => p.trim());
          }

          if (!(key && value)) {
            this.printError(`Cannot parse --find value: ${pair}`);
          }
           
          find[key] = this.tryParseJson(value);
        });
      
      qs.find = JSON.stringify(find);
    }

    if (this.fields) {
      qs.fields = this.fields;
    }

    if (this.sort) {
      qs.sort = this.sort;
    }

    if (this.page) {
      qs.page = this.page;
    }

    return qs;
  }

  tryParseJson(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }
}

module.exports = Query;
