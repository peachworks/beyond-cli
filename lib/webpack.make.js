'use strict';

// Modules
let autoprefixer      = require('autoprefixer');
let constants         = require('./const');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let eslintrc          = {};
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let fs                = require('fs');
let path              = require('path');
let swig              = require('swig-templates');
let webpack           = require('webpack');
let _                 = require('lodash');

function makeWebpackConfig(options) {

  /**
   * Environment type
   * BUILD is for generating minified builds
   * DEV is for starting a development server
   * TEST is for generating test builds
   */
  const BUILD     = !!options.BUILD;
  const DEV       = !!options.DEV;
  const TEST      = !!options.TEST;
  const CWD       = process.cwd();
  const VERBOSE   = !!options.verbose;

  let appKey        = options.app_key;
  let framework     = options.framework;
  let templateFile  = '';

  // AngularJS specific
  if (framework === constants.ANGULARJS) {
    eslintrc = require('./eslintrc')();
    templateFile = __dirname + '/templates/' + constants.TEMPLATE_IFRAME_ANGULARJS;
  }

  // Analytics app special case
  if (appKey === constants.APP_KEY_ANALYTICS) {
    eslintrc = require('./eslintrc')();
    templateFile = __dirname + '/templates/' + constants.TEMPLATE_IFRAME_ANALYTICS;
  }

  let sassLoader = {
    test: /(\.scss)$/,
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        {
          loader: 'css-loader',
          options: {
            sourceMap: true
          }
        },
        'sass-loader',
        {
          loader: 'postcss-loader',
          options: {
            plugins: [
              autoprefixer({
                browsers: ['last 2 version']
              })
            ]
          }
        }
      ]
    })
  };
  let cssLoader = {
    test: /(\.css)$/,
    use: ExtractTextPlugin.extract({
      fallback: 'style-loader',
      use: [
        {
          loader: 'css-loader',
          options: {
            sourceMap: true
          }
        },
        {
          loader: 'postcss-loader',
          options: {
            plugins: [
              autoprefixer({
                browsers: ['last 2 version']
              })
            ]
          }
        }
      ]
    })
  };
  let config = {
    devtool : 'source-map',
    module  : {
      rules   : [
        {
          test: /(\.js)$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            cacheDirectory: true,
            presets: [__dirname + '/../node_modules/babel-preset-env']
          }
        },
        {
          test: /(\.jsx)$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          query: {
            cacheDirectory: true,
            presets: [
              __dirname + '/../node_modules/babel-preset-env',
              __dirname + '/../node_modules/babel-preset-react'
            ]
          }
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|otf|ico)$/,
          loader: 'file-loader'
        },
        {
          test: /\.html$/,
          loader: 'raw-loader'
        },
        {
          test: /\.(json|peachrc)$/,
          loader: 'json-loader'
        },
        sassLoader,
        cssLoader
      ]
    },
    plugins: [
      new ExtractTextPlugin({
        filename: '[name].css',
        disable: TEST
      })
    ],
    resolveLoader: {
      modules: [
        __dirname + '/../node_modules',
        __dirname + '/../web_loaders',
        __dirname + '/../web_modules',
        __dirname + '/../node_loaders'
      ]
    },
    resolve: {
      extensions: ['*', '.js']
    }
  };

  if (TEST) {

    if (framework === constants.ANGULARJS) {

      config.devtool = 'inline-source-map';
      config.module.rules.push({
        enforce : 'pre',
        test    : /(\.jsx|\.js|\.ts)$/,
        exclude : [
          /node_modules/,
          /\.spec\.js$/,
          /\.spec\.ts$/
        ],
        loader  : 'istanbul-instrumenter-loader',
        query   : {
          esModules: true
        }
      });

    }

    sassLoader.use = ['null-loader'];
    cssLoader.use = ['null-loader'];

  }

  if (DEV) {

    let excludeChunks = ['app'];

    if (framework === constants.ANGULARJS) {
      
      config.entry = {
        app: [
          CWD + '/client/app/app.js'
        ]
      };

      config.devtool = 'eval';

    }

    config.output = {
      // Absolute output directory
      path: CWD + '/' + constants.BUILD_FOLDER,

      // Output path from the view of the page
      // Uses webpack-dev-server in development
      publicPath: (options.ssl ? 'https://' : 'http://') + options.requested_host + ':' + options.devPort + '/',

      // Filename for entry points
      // Only adds hash in build mode
      filename: '[name].bundle.js',

      // Filename for non-entry points
      // Only adds hash in build mode
      chunkFilename: '[name].bundle.js'
    };

    config.devServer = {
      contentBase: CWD + '/' + constants.BUILD_FOLDER,
      historyApiFallback: true,
      noInfo: !VERBOSE,
      stats: {
        modules: false,
        cached: false,
        colors: true,
        chunks: false
      },
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    };

    if (options.ssl) {

      config.devServer.https = {
        ca: fs.readFileSync(path.join(__dirname, '/ssl/wild.cli.getbeyond.com.cacert')),
        cert: fs.readFileSync(path.join(__dirname, '/ssl/wild.cli.getbeyond.com.cert')),
        key: fs.readFileSync(path.join(__dirname, '/ssl/wild.cli.getbeyond.com.key')),
      };

    }

    config.module.rules.push({
      test: /(\.jsx|\.js)$/,
      loader: 'eslint-loader?' + JSON.stringify(eslintrc),
      exclude: /node_modules/
    });

    config.plugins.push(
      new HtmlWebpackPlugin({
        templateContent: swig.renderFile(
          templateFile, 
          {
            PeachWorksApp: options.beyond_app,
            host: options.requested_host,
            port: options.devPort,
            protocol: options.ssl ? 'https' : 'http'
          }
        ),
        inject: 'body',
        excludeChunks: excludeChunks
      })
    );

    if (options.watch) {
      
      config.entry.app.unshift(
        __dirname + '/../node_modules/webpack-dev-server/client?' + (options.ssl ? 'https://' : 'http://') + options.host + ':' + options.devPort
      );

      if (_.isNumber(options.watch)) {
        config.devServer.watchOptions = {
          poll: options.watch
        };
      }

    }

  }

  if (BUILD) {

    let uglifyOpts = {
      sourceMap: true
    };
    
    if (framework === constants.ANGULARJS) {
      
      config.entry = {
        app: [
          CWD + '/client/app/app.js'
        ]
      };

    }

    config.output = {
      // Absolute output directory
      path: CWD + '/' + constants.BUILD_FOLDER,

      // Output path from the view of the page
      // Uses webpack-dev-server in development
      publicPath: '',

      // Filename for entry points
      // Only adds hash in build mode
      filename: '[name].js',

      // Filename for non-entry points
      // Only adds hash in build mode
      chunkFilename: '[name].js'
    };

    config.module.rules.push({
      test: /(\.jsx|\.js)$/,
      loader: 'eslint-loader?' + JSON.stringify(eslintrc),
      exclude: /node_modules/
    });

    config.plugins.push(
      new webpack.optimize.UglifyJsPlugin(uglifyOpts)
    );

    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      })
    );

  }

  return config;

}

module.exports = makeWebpackConfig;
