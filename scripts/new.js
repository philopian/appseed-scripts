const fs = require("fs");
const path = require("path");
const argv = process.argv.slice(2);
const chalk = require("chalk");
const shell = require("shelljs");

const appDirectory = fs.realpathSync(process.cwd());
const config = require(path.join(appDirectory, "appseed.config.js"));
const newComponent = require("../tools/new-component");
const newContainer = require("../tools/new-container");
const newReducer = require("../tools/new-reducer");

// console.log(
//   "",
//   chalk.bgCyan("Command:"),
//   " $ appseed new\n",
//   chalk.bgCyan("Application Root:"),
//   ` ${appDirectory}\n`,
//   chalk.bgCyan("Argument:"),
//   ` ${argv}\n`
// );
////////////////////////////////////////////////////////////////////////////////////////////////////////////

if (argv.includes("component")) {
  // Show prompt for new component
  newComponent();
} else if (argv.includes("container")) {
  // Show prompt for new container
  newContainer();
} else if (argv.includes("reducer")) {
  // Show prompt for new reducer
  newReducer();
} else if (argv.includes("page")) {
  // newPage();
} else {
  // console.log("NOPE");
}
