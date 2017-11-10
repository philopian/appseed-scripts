process.env.BABEL_ENV = "test";
process.env.NODE_ENV = "test";
const fs = require("fs");
const path = require("path");
const argv = process.argv.slice(2);
const chalk = require("chalk");
const shell = require('shelljs');

const appDirectory = fs.realpathSync(process.cwd());
const config = require(path.join(appDirectory, 'appseed.config.js'));
console.log(
  '',
  chalk.bgCyan('Command:'),
  ' $ appseed test\n',
  chalk.bgCyan('Application Root:'),
  ` ${appDirectory}\n`,
  chalk.bgCyan('Argument:'),
  ` ${argv}\n`
);
////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Run Jest on the application files (./www/*)
const jest = require('jest');
let jestConfig = require('../config/jest/config');
jestConfig.roots = [appDirectory];
const jestCommand = [
  "--env=jsdom",
  "--watchAll",
  "--config",
  JSON.stringify(jestConfig)
];
jest.run(jestCommand)