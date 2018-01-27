const chalk = require("chalk");
const _ = require("lodash");

module.exports = {
  build: function BuildAzure(config) {
    console.log(chalk.blue("Building Azure deploy version"));

    // Create prod package.json
    buildCmd
      .copyPackageJson(config)
      .then(() => {
        // Create server files
        return buildCmd.copyServerFiles(config);
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
        // Create Webconfig file
        return buildCmd.createWebConfig(config);
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


