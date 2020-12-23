'use strict';

// Modules
const _ = require('lodash'),
  autoprefixer = require('autoprefixer'),
  constants = require('./const'),
  // CssMinimizerPlugin = require('css-minimizer-webpack-plugin'),
  ESLintPlugin = require('eslint-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  fs = require('fs'),
  MiniCssExtractPlugin = require('mini-css-extract-plugin'),
  path = require('path'),
  swig = require('swig-templates'),
  webpack = require('webpack');

let eslintrc = {};

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
    eslintrc = require('./eslintrc')({
      parser: require.resolve('@babel/eslint-parser'),
      parserOptions: {
        requireConfigFile: false
      }
    });
    templateFile = __dirname + '/templates/' + constants.TEMPLATE_IFRAME_ANGULARJS;
  }

  // Analytics app special case
  if (appKey === constants.APP_KEY_ANALYTICS) {
    eslintrc = require('./eslintrc')({
      parser: require.resolve('@babel/eslint-parser'),
      parserOptions: {
        requireConfigFile: false
      }
    });
    templateFile = __dirname + '/templates/' + constants.TEMPLATE_IFRAME_ANALYTICS;
  }

  let stylesLoader = {
    test: /\.(sa|sc|c)ss$/,
    use: [
      DEV ?
        'style-loader' :
        MiniCssExtractPlugin.loader,
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
          postcssOptions: {
            plugins: [
              autoprefixer({
                overrideBrowserslist: ['last 2 version']
              })
            ]
          }
        }
      }
    ]
  };

  let config = {
    devtool : 'source-map',
    mode: 'development',
    module  : {
      rules   : [
        {
          test: /(\.js)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: ['@babel/preset-env'].map(require.resolve)
            }
          }
        },
        {
          test: /(\.jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: ['@babel/preset-env', '@babel/preset-react'].map(require.resolve)
            }
          }
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|otf|ico)$/,
          type: 'asset/resource'
        },
        {
          test: /\.html$/,
          loader: 'html-loader'
        },
        {
          test: /\.peachrc$/,
          loader: 'json-loader'
        },
        stylesLoader
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css'
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

      config.devtool = 'inline-cheap-module-source-map';
      config.module.rules.push({
        enforce : 'post',
        test    : /(\.jsx|\.js|\.ts)$/,
        exclude : [
          /node_modules/,
          /\.spec\.js$/,
          /\.spec\.ts$/
        ],
        use: {
          loader: 'istanbul-instrumenter-loader',
          options   : {
            esModules: true
          }
        }
      });

    }

    stylesLoader.use = ['null-loader'];

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

    config.devServer = {
      contentBase: CWD + '/' + options.distDir,
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
      },
      host: options.host,
      port: options.devPort,
      https: options.ssl,
      liveReload: false
    };

    if (options.ssl) {

      config.devServer.https = {
        ca: fs.readFileSync(path.join(__dirname, '/ssl/wild.cli.getbeyond.com.cacert')),
        cert: fs.readFileSync(path.join(__dirname, '/ssl/wild.cli.getbeyond.com.cert')),
        key: fs.readFileSync(path.join(__dirname, '/ssl/wild.cli.getbeyond.com.key')),
      };

    }

    config.output = {
      // Absolute output directory
      path: CWD + '/' + options.distDir,

      // Output path from the view of the page
      // Uses webpack-dev-server in development
      publicPath: (options.ssl ? 'https://' : 'http://') + options.requestedHost + ':' + options.devPort + '/',

      // Filename for entry points
      // Only adds hash in build mode
      filename: '[name].js',

      // Filename for non-entry points
      // Only adds hash in build mode
      chunkFilename: '[name].js'
    };

    config.plugins.push(
      new ESLintPlugin({
        baseConfig: eslintrc
      })
    );

    config.plugins.push(
      new HtmlWebpackPlugin({
        templateContent: swig.renderFile(
          templateFile, 
          {
            BeyondApp: options.beyond_app,
            host: options.requestedHost,
            port: options.devPort,
            protocol: options.ssl ? 'https' : 'http'
          }
        ),
        inject: 'body',
        excludeChunks: excludeChunks
      })
    );

    if (options.watch) {

      config.devServer.liveReload = true;

      if (_.isNumber(options.watch)) {
        config.devServer.watchOptions = {
          poll: options.watch
        };
      }

    }

  }

  if (BUILD) {

    /* let uglifyOpts = {
      sourceMap: true
    }; */
    
    if (framework === constants.ANGULARJS) {
      
      config.entry = {
        app: [
          CWD + '/client/app/app.js'
        ]
      };

    }

    config.mode = 'production';

    config.optimization = {
      minimize: true
    };

    config.output = {
      // Absolute output directory
      path: CWD + '/' + options.distDir,

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

    config.plugins.push(
      new ESLintPlugin({
        baseConfig: eslintrc
      })
    );

  }

  return config;

}

module.exports = makeWebpackConfig;
