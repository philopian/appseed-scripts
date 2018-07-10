process.env.NODE_ENV = "production";
const path = require("path");
const config = require("../config");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const extractSASS = new ExtractTextPlugin("code/app.css");

const autoprefixer = require("autoprefixer");
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
    modules: ["node_modules", "bower_components"],
    descriptionFiles: ["package.json", "bower.json"],
    alias: {
      BowerComponents: path.resolve(config.paths.appRoot + "/bower_components"),
      NodeModules: path.resolve(config.paths.appRoot + "/node_modules"),
      AppRoot: path.resolve(config.paths.appRoot)
    }
  },
  devtool: "source-map",
  target: "web",

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
      inject: false
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
        test: /\.css$/,
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
          })
        )
      },
      {
        test: /\.scss$/,
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
        loader: "file-loader?name=fonts/[name].[ext]"
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
