process.env.NODE_ENV = "development";
const path = require("path");
const webpack = require("webpack");
const config = require(path.join(__dirname, "../config"));
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
    modules: ["node_modules"],
    descriptionFiles: ["package.json"],
    alias: {
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
        // include: config.paths.appRoot,
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
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        loader: 'file-loader?name=fonts/[name].[ext]'
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