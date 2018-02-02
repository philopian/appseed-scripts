process.env.NODE_ENV = "development";
const fs = require("fs");
const path = require("path");
const argv = process.argv.slice(2);
const chalk = require("chalk");
const shell = require("shelljs");
const _ = require("lodash");
const yarnOrNpm = require('yarn-or-npm');

const appDirectory = fs.realpathSync(process.cwd());
const config = require(path.join(appDirectory, "appseed.config.js"));
// console.log(
//   "",
//   chalk.bgCyan("Command:"),
//   " $ appseed start\n"
// );
////////////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Install bower and npm/yarn dependencies
 */
const cmdInstall = `cd ${appDirectory}  && bower install && ${yarnOrNpm()} install`;
shell.exec(cmdInstall)



/**
 * Add bower css tags into the ./www/index.html (for development add them via html tags)
 */
const bowerTags = require("../tools/bower-tags");
bowerTags.injectTagsIntoHtml(appDirectory);
bowerTags.watch(appDirectory); // Watch the bower.json file for changes and update the css tags



/**
 * Run Webpack
 */
const Webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");

// User provided the "--dojo" argument
let webpackConfig;
if (_.includes(argv, "--dojo")) {
  webpackConfig = require("../config/webpack.config.dojo.js");
} else {
  webpackConfig = require("../config/webpack.config.dev.js");
}
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
  https: config.https !== undefined ? config.https : false,
  historyApiFallback: {
    disableDotRule: true
  }
});
server.listen(config.port, "0.0.0.0", () => {
  console.log(chalk.blue(`[Web Server]: http://localhost:${config.port}`));
  argv.forEach(x => {
    switch (x) {
      case "--open=browser":
        openBrowser(`${(config.https !== undefined && config.https) ? 'https' : 'http'}://localhost:${config.port}`);
        break;
      case "--open=storybook":
        openBrowser(`http://localhost:${config.portStorybook}`);
        break;
      default:
        break;
    }
  });
});