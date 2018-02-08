const chalk = require("chalk");
const _ = require("lodash");

const buildCmd = require("../tools/build-cmd");

module.exports = {
  build: function BuildAzure(config, argv) {
    console.log(chalk.blue("Building Azure deploy version"));

    // Create prod package.json
    buildCmd
      .copyPackageJson(config)
      .then(() => {
        // Copy the express folder
        if (_.includes(argv, "--express")) {
          return buildCmd.copyServerFiles(config);
        } 
        return;
      })
      .then(() => {
        // Copy appseed.config.js file
        return buildCmd.copyAppseedConfig(config);
      })
      .then(() => {
        // Create .env file
        return buildCmd.createDotEnv(config, null, _.includes(argv, "--local"));
      })
      .then(() => {
        // Create nodejs Webconfig file for azure
        if (_.includes(argv, "--express")) {
          return buildCmd.createWebConfig(config);
        } 
        return;
      })
      .then(() => {
        if (_.includes(argv, "--local")) {
          return buildCmd.runServerAndBrowserLocally(config);
        } else {
          return buildCmd.printAzureInstuctions(config);
        }
      });
  }
}


