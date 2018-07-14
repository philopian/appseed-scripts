process.env.NODE_ENV = 'development';
const path = require('path');
const webpack = require('webpack');
const config = require("../config");


module.exports = {
  mode: "development",
  
  // IN/OUT files
  entry: [
    require.resolve('babel-polyfill'),
    require.resolve('react-dev-utils/webpackHotDevClient'),
    config.paths.webRoot
  ],
  output: {
    publicPath: '/',
    path: config.paths.appRoot,
    publicPath: 'www/',
    filename: 'bundle.js'
  },

  // GENERAL STUFF
  resolve: {
    modules: ['node_modules'],
    descriptionFiles: ['package.json'],
    alias: {
      NodeModules: path.resolve(config.paths.appRoot + "/node_modules"),
      AppRoot: path.resolve(config.paths.appRoot)
    }
  },
  devtool: 'cheap-module-eval-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
  node: {
    fs: 'empty'
  },

  // LOADERS
  module: {
    rules: [
      { test: /\.html$/, use: [{ loader: require.resolve('html-loader'), options: { minimize: true }, }], },
      { test: /\.(css|scss)$/, use: [require.resolve('style-loader'), require.resolve('css-loader'),require.resolve('sass-loader')], },
      { test: /\.(js|jsx)$/,include: config.fileNames.webRoot,loader: require.resolve("babel-loader"),options: {babelrc: false,presets: [require("babel-preset-env"),require("babel-preset-react"),require("babel-preset-stage-0")]}},
      { test: /\.(jpg|jpeg|png|svg|gif)$/, loader: 'file-loader?name=[path][name].[ext]' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: [{ loader: require.resolve('file-loader') }] },
      { test: /\.(woff|woff2)$/, use: [{ loader: 'url-loader?prefix=font/&limit=5000' }] },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: [{ loader: 'url-loader?limit=10000&mimetype=application/octet-stream' }] },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: [{ loader: 'url-loader?limit=10000&mimetype=image/svg+xml' }] }
    ]
  },

  // WEBPACK-DEV-SERVER
  devServer: {
    contentBase: path.join(__dirname, 'www'),
    hot: true,
    inline: true,
    quiet: true,
    port: process.env.PORT  || config.port,
    historyApiFallback: {
      index: '/index.html'
    }
  }
}
