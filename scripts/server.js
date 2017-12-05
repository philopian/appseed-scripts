process.env.NODE_ENV = "development";
const fs = require("fs");
const path = require("path");
const argv = process.argv.slice(2);
const chalk = require("chalk");
const shell = require('shelljs');

const appDirectory = fs.realpathSync(process.cwd());
const config = require(path.join(appDirectory, 'appseed.config.js'));
// console.log(
//   '',
//   chalk.bgCyan('Command:'),
//   ' $ appseed server\n'
// );
////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Run express server
shell.exec(`nodemon ${path.join(appDirectory, 'server')}`);