process.env.NODE_ENV = "development";
const path = require("path");
const webpack = require("webpack");
const config = require("../config");
const autoprefixer = require("autoprefixer");

module.exports = {
  // GENERAL STUFF
  target: "web",
  devtool: "cheap-module-eval-source-map",
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': `"development"`
      }
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: ["node_modules", "bower_components"],
    descriptionFiles: ["package.json", "bower.json"],
    alias: {
      bower_components: "../../bower_components"
    }
  },
  externals: /^esri/,

  // IN/OUT files
  entry: [
    require.resolve("babel-polyfill"),
    require.resolve("react-dev-utils/webpackHotDevClient"),
    config.paths.webRoot
  ],
  output: {
    path: config.paths.webRoot,
    publicPath: "/",
    filename: "bundle.js",
    library: "app/bundle",
    libraryTarget: "amd"
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
        test: /\.js$/,
        include: config.paths.webRoot,
        loader: require.resolve("babel-loader"),
        options: {
          babelrc: false,
          presets: [
            require("babel-preset-env"),
            require("babel-preset-stage-2")
          ]
        }
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
          },
          {
            loader: require.resolve("sass-loader"),
            options: {}
          }
        ]
      },


      {
        exclude: [/\.js$/, /\.jsx$/, /\.html$/, /\.json$/, /\.scss$/, /\.css$/, /\.ttf$/],
        loader: require.resolve("file-loader"),
        options: {
          name: "static/media/[name].[hash:8].[ext]"
        }
      }
    ]
  }
};