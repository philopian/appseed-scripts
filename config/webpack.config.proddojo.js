process.env.NODE_ENV = "production";
const path = require("path");
const webpack = require("webpack");
const config = require("../config");
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractCSS = new ExtractTextPlugin('code/app.css');

module.exports = {
  // GENERAL STUFF
  target: "web",
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new HtmlWebpackPlugin({
      template: 'www/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
      inject: false
    }),
    new UglifyJSPlugin({ sourceMap: true }),
    extractCSS,
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: ["node_modules", "bower_components"],
    descriptionFiles: ["package.json", "bower.json"],
    alias: {
      BowerComponents: path.resolve(config.paths.appRoot + "/bower_components"),
      NodeModules: path.resolve(config.paths.appRoot + "/node_modules"),
      AppRoot: path.resolve(config.paths.appRoot)
    }
  },
  node: {
    fs: 'empty'
  },
  externals: /^esri/,

  // IN/OUT files
  entry: [
    require.resolve('babel-polyfill'),
    config.paths.webRoot
  ],
  output: {
    path: path.resolve(__dirname, config.paths.deployWwwRoot),
    filename: 'code/bundle.js',
    libraryTarget: 'amd'
  },

  // LOADERS
  module: {
    rules: [ //
      {
        test: /\.html$/,
        use: [{
          loader: require.resolve("html-loader"),
          options: { minimize: true }
        }]
      },
      {
        test: /\.(js|jsx)$/,
        include: config.paths.webRoot,
        loader: require.resolve("babel-loader"),
        options: {
          babelrc: false,
          presets: [
            require("babel-preset-env"),
            require("babel-preset-react"),
            require("babel-preset-stage-2"),
          ]
        }
      },
      {
        test: /\.css$/,
        use: [
          require.resolve("style-loader"),
          {
            loader: require.resolve("css-loader"),
            options: {}
          },
          {
            loader: require.resolve("postcss-loader"),
            options: {
              ident: "postcss",
              plugins: () => [
                require("postcss-flexbugs-fixes"),
                autoprefixer({
                  browsers: [
                    ">1%",
                    "last 4 versions",
                    "Firefox ESR",
                    "not ie < 9" // React doesn't support IE8 anyway
                  ],
                  flexbox: "no-2009"
                })
              ]
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        include: config.paths.webRoot,
        loader: extractCSS.extract(
          Object.assign({
            fallback: require.resolve('style-loader'),
            use: [{
                loader: require.resolve('css-loader'),
                options: {
                  importLoaders: 1,
                  minimize: true,
                  sourceMap: true,
                },
              },
              {
                loader: require.resolve('postcss-loader'),
                options: {
                  ident: 'postcss',
                  plugins: () => [
                    require('postcss-flexbugs-fixes'),
                    autoprefixer({
                      browsers: [
                        '>1%',
                        'last 4 versions',
                        'Firefox ESR',
                        'not ie < 9', // React doesn't support IE8 anyway
                      ],
                      flexbox: 'no-2009',
                    }),
                  ],
                },
              },
              {
                loader: require.resolve('sass-loader'),
              },
            ],
          })
        )
      },


      {
        exclude: [/\.js$/, /\.jsx$/, /\.html$/, /\.json$/, /\.scss$/, /\.css$/, /\.ttf$/],
        loader: require.resolve("file-loader"),
        options: {
          name: "static/media/[name].[hash:8].[ext]"
        }
      }
    ]
  },

  node: {
    fs: 'empty'
  }
};