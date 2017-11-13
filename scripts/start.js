process.env.NODE_ENV = "development";
const fs = require("fs");
const path = require("path");
const argv = process.argv.slice(2);
const chalk = require("chalk");
const shell = require("shelljs");

const appDirectory = fs.realpathSync(process.cwd());
const config = require(path.join(appDirectory, "appseed.config.js"));
console.log(
  "",
  chalk.bgCyan("Command:"),
  " $ appseed start\n",
  chalk.bgCyan("Application Root:"),
  ` ${appDirectory}\n`,
  chalk.bgCyan("Argument:"),
  ` ${argv}\n`
);
////////////////////////////////////////////////////////////////////////////////////////////////////////////

//*
// Add bower css tags into the ./www/index.html (for development add them via html tags)
const bowerTags = require("../tools/bower-tags");
bowerTags.injectTagsIntoHtml(appDirectory);

// Watch the bower.json file for changes and update the css tags
bowerTags.watch(appDirectory);
//*/

// Run Webpack
const Webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const webpackConfig = require("../config/webpack.config.dev.js");
const openBrowser = require("react-dev-utils/openBrowser");
const compiler = Webpack(webpackConfig);
var server = new WebpackDevServer(compiler, {
  contentBase: config.paths.webRoot,
  watchContentBase: true,
  compress: true,
  hot: true,
  quiet: true,
  watchOptions: {
    ignored: /node_modules/
  },
  https: false,
  historyApiFallback: {
    disableDotRule: true
  }
});
server.listen(config.port, "127.0.0.1", () => {
  console.log(chalk.blue(`[Web Server]: http://localhost:${config.port}`));
  argv.forEach(x => {
    switch (x) {
      case "--open=browser":
        openBrowser(`http://localhost:${config.port}`);
        break;
      case "--open=storybook":
        openBrowser(`http://localhost:${config.portStorybook}`);
        break;
      default:
        break;
    }
  });
});