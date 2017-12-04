// Generate schema.js
require('./schema.config');

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HappyPack = require('happypack');
var happyThreadPool = HappyPack.ThreadPool({ size: require('os').cpus().length });

module.exports = function(env, args) {
  env = env || process.env.NODE_ENV;
  const config = Config(env);

  return {
    entry: {
      app: './src/index.jsx',
    },
    output: {
      filename: '[name].[chunkhash].js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
    },

    module: {
      rules: [{
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'happypack/loader?id=less',
        })
      }, {
        test: /\.(jpg|jpeg|gif|png)$/,
        use: ['file-loader'],
      }, {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ['file-loader'],
      }, {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: [{
          loader: 'happypack/loader?id=js_jsx',
        }, {
          loader: 'happypack/loader?id=eslint',
        }],
      }],
    },

    plugins: config.plugins,

    devtool: config.devtool,

    devServer: {
      contentBase: './dist',
      port: config.port,
      host: '0.0.0.0',
      // hot: true,
      disableHostCheck: true,
      historyApiFallback: true,
      proxy: {
        '/mock': {
          target: 'http://localhost:3000',
          pathRewrite: { '^/mock': '' },
        }
      }
    },

    resolve: {
      extensions: [".js", ".jsx"],
      alias: {
        library: path.resolve(__dirname, 'library'),
      },
    },

    externals: {
      jquery: 'jQuery'
    },

  };

};

// 区分环境
function Config(env) {
  return {
    port: 8080,
    get plugins() {
      // 生成环境
      if (env === 'production') {
        return [
          new CleanWebpackPlugin(['dist']),
          new webpack.NamedChunksPlugin(),
          new webpack.HashedModuleIdsPlugin({ hashDigestLength: 8 }),
          new ExtractTextPlugin('[name].[contenthash:20].css'),
          new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') }),
          new webpack.optimize.UglifyJsPlugin({ sourceMap: true }),
          new HtmlWebpackPlugin({ title: 'HEELO WORLD', template: 'index.html' }),
          new webpack.ProvidePlugin({ axios: 'axios' }),
          new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function(module) {
              return module.context && module.context.indexOf('node_modules') !== -1;
            },
          }),
          new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
          }),
          new HappyPack({
            id: 'js_jsx',
            threadPool: happyThreadPool,
            loaders: [{
              loader: 'cache-loader',
              options: {
                cacheDirectory: path.resolve(__dirname, '.cache--happypack')
              }
            }, {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true
              }
            }]
          }),
          new HappyPack({
            id: 'eslint',
            threadPool: happyThreadPool,
            loaders: [{
              loader: 'cache-loader',
              options: {
                cacheDirectory: path.resolve(__dirname, '.cache--happypack')
              }
            }, {
              loader: 'eslint-loader',
              options: {
                cacheDirectory: true
              }
            }]
          }),
          new HappyPack({
            id: 'less',
            threadPool: happyThreadPool,
            loaders: [{
              loader: 'cache-loader',
              options: {
                cacheDirectory: path.resolve(__dirname, '.cache--happypack')
              }
            },{
              loader: 'css-loader',
              options: { localIdentName: '[hash:base64:8]', sourceMap: true }
            }, {
              loader: 'postcss-loader',
              options: { sourceMap: true }
            }, {
              loader: 'less-loader',
              options: { sourceMap: true }
            }]
          }),
        ];
      }

      // 开发环境
      return [
        new CleanWebpackPlugin(['dist']),
        new ExtractTextPlugin('[name].[contenthash:20].css'),
        new HtmlWebpackPlugin({ title: 'HEELO WORLD', template: 'index.html' }),
        new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(env || 'development') }),
        new webpack.ProvidePlugin({ axios: 'axios' }),
        // new webpack.HotModuleReplacementPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
          name: 'vendor',
          minChunks: function(module) {
            return module.context && module.context.indexOf('node_modules') !== -1;
          },
        }),
        new webpack.optimize.CommonsChunkPlugin({
          name: 'manifest',
        }),
        new HappyPack({
          id: 'js_jsx',
          threadPool: happyThreadPool,
          loaders: [{
            loader: 'cache-loader',
            options: {
              cacheDirectory: path.resolve(__dirname, '.cache--happypack')
            }
          }, {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }]
        }),
        new HappyPack({
          id: 'eslint',
          threadPool: happyThreadPool,
          loaders: [{
            loader: 'cache-loader',
            options: {
              cacheDirectory: path.resolve(__dirname, '.cache--happypack')
            }
          }, {
            loader: 'eslint-loader',
            options: {
              cacheDirectory: true
            }
          }]
        }),
        new HappyPack({
          id: 'less',
          threadPool: happyThreadPool,
          loaders: [{
            loader: 'cache-loader',
            options: {
              cacheDirectory: path.resolve(__dirname, '.cache--happypack')
            }
          },{
            loader: 'css-loader',
            options: { localIdentName: '[hash:base64:8]', sourceMap: true }
          }, {
            loader: 'postcss-loader',
            options: { sourceMap: true }
          }, {
            loader: 'less-loader',
            options: { sourceMap: true }
          }]
        }),
      ];
    },
    get devtool() {
      if (env === 'production') {
        return 'source-map';
      }
      // BUG:https://github.com/webpack/webpack-dev-server/issues/1090
      // return 'cheap-eval-source-map';
      return 'source-map';
    }
  };
};
