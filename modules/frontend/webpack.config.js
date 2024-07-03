/* eslint-disable max-lines-per-function */

const path = require('path');
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const { isString, isObject } = require('coreutils-js');
const babelConfig = require('./babel.config');
const postConfig = require('./postcss.config');
const orgConfig = require('../config');

module.exports = function (config) {
  let envConfig = {};
  let IS_PROD = false;

  if (['production', 'closebeta', 'beta'].indexOf(config.env) !== -1) {
    envConfig = require('./prod')(config);
    IS_PROD = true;
  } else {
    envConfig = require('./dev');
    IS_PROD = false;
  }

  function generateHtml() {
    let rs = [];

    if (isString(config.entry)) {
      rs = [
        new HtmlWebpackPlugin({
          template: path.join(__dirname, '/index.ejs'),
          title: config.title,
          minify: IS_PROD,
          meta: {
            viewport: 'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no',
          },
          templateParameters: {
            config: orgConfig,
            buildversion: `?t=${Date.now()}`,
            moduleName: config.moduleName,
          },
          inject: 'head',
        }),
      ];
    } else if (isObject(config.entry)) {
      Object.keys(config.entry).forEach((key) => {
        rs.push(
          new HtmlWebpackPlugin({
            template: path.join(__dirname, '/index.ejs'),
            title: config.title,
            filename: `${key}.html`,
            minify: IS_PROD,
            chunks: [`${key}`],
            meta: {
              viewport: 'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no',
            },
            templateParameters: {
              config: orgConfig,
              buildversion: `?t=${Date.now()}`,
              moduleName: config.moduleName,
            },
            inject: 'head',
          }),
        );
      });
    }

    return rs;
  }

  return merge(
    {
      entry: config.entry,
      output: {
        filename: `[name].js?v=${config.version}&bt=${config.buildTime}`,
        path: path.join(config.root, '/dist'),
        chunkFilename: `js/[chunkhash].chunk.js?v=${config.version}&bt=${config.buildTime}`,
        libraryTarget: 'system',
        publicPath: '',
      },
      optimization: {
        splitChunks: {
          automaticNameDelimiter: '-',
          cacheGroups: {
            vendors: {
              test: new RegExp(`[\\\\/]node_modules[\\\\/](${(config.vendors || []).join('|')})[\\\\/]`),
              name: 'vendors',
              enforce: true,
            },
          },
        },
      },
      externals: [
        '@microui/react-icons',
        '@microui/react-ui',
        '@microui/layout',
        'react',
        'react-dom',
      ],
      module: {
        rules: [
          {
            test: /\.(js|ts|tsx)$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'babel-loader',
                options: babelConfig(config),
              },
            ],
          },
          {
            test: /\.(sa|sc|c)ss$/,
            exclude: /node_modules/,
            oneOf: [
              {
                resourceQuery: /global/,
                use: [
                  IS_PROD ? MiniCssExtractPlugin.loader : 'style-loader',
                  {
                    loader: 'css-loader',
                    options: {
                      sourceMap: false,
                    },
                  },
                  {
                    loader: 'postcss-loader',
                    options: postConfig(config),
                  },
                  {
                    loader: 'sass-loader',
                    options: {
                      additionalData: config.css.data,
                    },
                  },
                ],
              },
              {
                use: [
                  IS_PROD ? MiniCssExtractPlugin.loader : 'style-loader',
                  {
                    loader: 'css-loader',
                    options: {
                      modules: {
                        localIdentName: `${config.css.prefix}[local]`,
                      },
                      sourceMap: false,
                    },
                  },
                  {
                    loader: 'postcss-loader',
                    options: postConfig(config),
                  },
                  {
                    loader: 'sass-loader',
                    options: {
                      additionalData: config.css.data,
                    },
                  },
                ],
              },
            ],
          },
          {
            test: /\.(png|jpg|gif)$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: `[name]-[hash].[ext]?v=${config.version}&bt=${config.buildTime}`,
                  outputPath: 'images/',
                },
              },
            ],
          },
          {
            test: /\.(svg)$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: `[name]-[hash].[ext]?v=${config.version}&bt=${config.buildTime}`,
                  outputPath: 'svgs/',
                },
              },
            ],
          },
          {
            test: /\.(woff(2)?|ttf|eot|otf)$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: `[name]-[hash].[ext]?v=${config.version}&bt=${config.buildTime}`,
                  outputPath: 'fonts/',
                },
              },
            ],
          },
        ],
      },
      plugins: [
        new DuplicatePackageCheckerPlugin(),
        ...generateHtml(),
        new HtmlWebpackTagsPlugin({
          append: false,
          publicPath: '',
          tags: config.resources.js,
          hash: `v=${config.version}&bt=${config.buildTime}`,
        }),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(config.env),
          'process.env.NAME': JSON.stringify(config.name),
          'process.env.VERSION': JSON.stringify(config.version),
          'process.env.SCOPE': JSON.stringify(config.scope),
        }),
        new CopyPlugin(
          [
            ...(config.statics || []).map((dir) => ({
              from: dir,
              to: 'statics',
            })),
            {
              from: 'manifest.json',
              to: 'manifest.json',
              toType: 'file',
            },
          ],
        ),
      ],
      resolve: {
        symlinks: false,
        alias: config.alias,
        extensions: ['.ts', '.tsx', '.js', '.json'],
        fallback: {
          'react/jsx-runtime': 'react/jsx-runtime.js',
          'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
        },
      },
    },
    envConfig,
  );
};
