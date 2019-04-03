'use strict';

let BaseProcess    = require('./base-process');
let express        = require('express');
let fs             = require('fs');
let http           = require('http');
let https          = require('https');
let path           = require('path');

class Proxy extends BaseProcess {

  constructor(config) {

    super(config);

    const appKey = this.rcFile.key;
    const appTokens = (!!this.config.tokens && !!this.config.tokens.app_tokens) ?
      this.config.tokens.app_tokens :
      '';

    this.app = express();
    this.accessToken = (!!this.config.tokens && !!this.config.tokens.access_token) ?
      this.config.tokens.access_token :
      '';
    this.appToken = appTokens && appTokens[appKey] && appTokens[appKey].access_token;
    this.accountId = this.config.accountId || this.config.accounts[0].id;
    this.ssl = this.config.ssl ? 
      {
        cert   : fs.readFileSync(path.join(__dirname, '/ssl/wild.cli.getbeyond.com.cert')),
        key    : fs.readFileSync(path.join(__dirname, '/ssl/wild.cli.getbeyond.com.key')),
      } :
      null;

  }

  start() {
    const proxy = require('http-proxy').createProxyServer();
    const target = this.config.apiBaseUrl;
    const ssl = this.ssl;

    this.app.use((req, res) => {
      proxy.web(req, res, {
        ssl,
        target,
        secure: false
      });
    });

    proxy.on('proxyReq', proxyReq => {
      const token = proxyReq.path.includes('null') && this.appToken ?
        this.appToken :
        this.accessToken;

      proxyReq.path = proxyReq.path.replace('null', this.accountId);
      proxyReq.setHeader('Authorization', token);
    });

    proxy.on('error', console.error);

    if (!this.config.ssl) {

      this.server = http.createServer(this.app).listen(this.config.port, this.config.host);

    } else {

      this.server = https.createServer(this.httpsOptions, this.app).listen(this.config.port, this.config.host);
    
    }

    Proxy._onStartMessage(`Proxy Server: http${this.config.ssl ? 's': ''}://${this.config.requestedHost}:${this.config.port} (Environment: ${this.config.env})`);

  }

  static _onStartMessage(message = '') {

    console.info('--------------------------------------------------------------------');
    console.info(message);
    console.info('--------------------------------------------------------------------');

  }
  
}

module.exports = Proxy;
