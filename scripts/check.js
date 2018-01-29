const fs = require("fs");
const path = require("path");
const argv = process.argv.slice(2);
const chalk = require("chalk");
const shell = require('shelljs');

// const nspReporterChecker = require("../tools/nsp-reporter-checker");

const appDirectory = fs.realpathSync(process.cwd());
const config = require(path.join(appDirectory, 'appseed.config.js'));
// console.log(
//   '',
//   chalk.bgCyan('Command:'),
//   ' $ appseed server\n'
// );

////////////////////////////////////////////////////////////////////////////////////////////////////////////

function printProdError(){
  shell.echo(chalk.bgRed(`\n***********************************************************************************************************
    [Vulnerability found] some of your packages may have some vulnerabilities                              
                                                                                                           
    please fix the potential vulnerabilities before building the production version of the application     
***********************************************************************************************************`),
`

`
);  
shell.exit(1);
}

function printDevError(){
  shell.echo(chalk.bgRed('[Vulnerability found] some of your packages may have some vulnerabilities'));
}

function printAllGood(){
  shell.echo(chalk.bgGreen('[Success]'));
}

/**
 *  NSP exit codes
 * 
 * 0: command ran with success
 * 1: command run was 'check', was successful, but returned vulnerabilities outside of the threshold or filter
 * 2: command received a server error (5xx)
 * 3: unknown error
 * 4: there was an error in the output reporter
 * 
 * 
 */
// const runNspCheck = `${appDirectory}/node_modules/.bin/nsp check`;
const runNspCheck = `${appDirectory}/node_modules/.bin/nsp check --reporter summary`;

if (shell.exec(runNspCheck).code !== 0) {
  if (process.env.NODE_ENV === 'production') {
    printProdError(); // Break the build process if NODE_ENV is production
  } else {
    printDevError(); // Warn but don't break the development process
  }
} else {
  // printAllGood();
}