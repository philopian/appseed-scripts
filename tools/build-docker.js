const path = require("path");
const chalk = require("chalk");
const _ = require("lodash");

const buildCmd = require(path.join(__dirname,"../tools/build-cmd"));

module.exports = {
  build: function BuildDocker(config, argv) {
    console.log(chalk.blue("Building Docker deploy version"));
  
    // Create prod package.json
    const nodejsPath = path.join(config.paths.deployRoot, "nodejs");
    buildCmd
    // Make the ./DEPLOY/nodejs/ folder
      .makeFolderIfDoesntExist(nodejsPath)
      .then(() => {
        // Copy & clean the packageJson file
        return buildCmd.copyPackageJson(config, "nodejs");
      })
      .then(() => {
        // Copy the server files to ./DEPLOY/nodejs/server/
        return buildCmd.copyServerFiles(config, "nodejs");
      })
      .then(() => {
        // Copy appseed.config.js file
        return buildCmd.copyAppseedConfig(config, "nodejs");
      })
      .then(() => {
        // Create .env file
        return buildCmd.createDotEnv(config, "nodejs", _.includes(argv, "--local"));
      })
      .then(() => {
        // Copy the ./templates-folders/docker/ansible to ./DEPLOY/ansible
        return buildCmd.createAnsibleFiles(config);
      })
      .then(() => {
        // TODO: Copy the ./templates-folders/docker/nginx to ./DEPLOY/nginx
        return buildCmd.createNginxFiles(config);
      })
      .then(() => {
        // Create Dockerfile
        return buildCmd.createDockerFiles(config);
      })
      .then(() => {
        // TODO: Copy the ./templates-folders/docker/nginx to ./DEPLOY/nginx
        return buildCmd.copyTemplateFiles(config);
      })
      .then(() => {
        // Copy the ./www/ to ./nginx/www/
        return buildCmd.copyWwwToNginx(config);
      })
      .then(() => {
        return buildCmd.printDockerInstuctions(config);
      });
  }
  

}