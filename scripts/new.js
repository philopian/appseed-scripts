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
  ' $ appseed new\n',
  chalk.bgCyan('Application Root:'),
  ` ${appDirectory}\n`,
  chalk.bgCyan('Argument:'),
  ` ${argv}\n`
);
////////////////////////////////////////////////////////////////////////////////////////////////////////////



// $ appseed new component
// TODO: check to see if there is a ./www/react/components folder
// TODO: check to see if there isn't a folder with that user provided container name
// TODO: build the files base on template

// $ appseed new container
// $ appseed new page