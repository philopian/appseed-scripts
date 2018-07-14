process.env.NODE_ENV = "production";
const path = require("path");
const config = require("../config");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractCSS = new ExtractTextPlugin("code/app.css");

module.exports = {
  mode: "production",

  // IN/OUT files
  entry: [require.resolve("babel-polyfill"), config.paths.webRoot],
  output: {
    path: config.paths.deployWwwRoot,
    filename: "code/bundle.js"
  },

  resolve: {
    extensions: [".js", ".jsx"],
    modules: ["node_modules"],
    descriptionFiles: ["package.json"],
    alias: {
      NodeModules: path.resolve(config.paths.appRoot + "/node_modules"),
      AppRoot: path.resolve(config.paths.appRoot)
    }
  },
  devtool: "source-map",
  target: "web",
  node: {
    fs: 'empty'
  },

  // PLUGINS
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new HtmlWebpackPlugin({
      template: "www/index.html",
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
        minifyURLs: true
      },
      inject: true
    }),
    extractCSS
  ],

  // LOADERS
  module: {
    rules: [
      //
      {
        test: /\.html$/,
        use: [
          {
            loader: require.resolve("html-loader"),
            options: { minimize: true }
          }
        ]
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
            require("babel-preset-stage-2")
          ]
        }
      },
      {
        test: /\.(css|scss)$/,
        // include: config.paths.appRoot,
        loader: extractCSS.extract(
          Object.assign({
            fallback: require.resolve("style-loader"),
            use: [
              {
                loader: require.resolve("css-loader"),
                options: {
                  importLoaders: 1,
                  minimize: true,
                  sourceMap: true
                }
              },
              {
                loader: require.resolve("sass-loader")
              }
            ]
          })
        )
      },

      {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: require.resolve("file-loader"),
        options:{
          name: "fonts/[name].[ext]"
        }
      },

      {
        exclude: [
          /\.js$/,
          /\.jsx$/,
          /\.html$/,
          /\.json$/,
          /\.scss$/,
          /\.css$/,
          /\.ttf$/
        ],
        loader: require.resolve("file-loader"),
        options: {
          name: "static/media/[name].[hash:8].[ext]"
        }
      }
    ]
  }
  //
};
