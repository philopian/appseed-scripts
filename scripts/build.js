process.env.NODE_ENV = "production";
const fs = require("fs");
const path = require("path");
const argv = process.argv.slice(2);
const chalk = require("chalk");
const rimraf = require("rimraf");
const _ = require("lodash");

const appDirectory = fs.realpathSync(process.cwd());
const config = require(path.join(appDirectory, "appseed.config.js"));

const buildCmd = require("../tools/build-cmd");
const templates = require("../tools/templates");
const buildAzure = require("../tools/build-azure-node");
const buildDocker = require("../tools/build-docker");
////////////////////////////////////////////////////////////////////////////////////////////////////////////

//--Generate frontend files------
const deployFolder = config.paths.deployRoot;
buildCmd
  .makeFolderIfDoesntExist(deployFolder)
  .then(() => {
    // Make the ./DEPLOY/www/ folder
    const wwwFolder = config.paths.deployWwwRoot;
    return buildCmd.makeFolderIfDoesntExist(wwwFolder);
  })
  .then(() => {
    // Make the ./DEPLOY/www/code/ folder
    const wwwCodeFolder = path.join(config.paths.deployWwwRoot, "code");
    return buildCmd.makeFolderIfDoesntExist(wwwCodeFolder);
  })
  .then(() => {
    // User provided the "dojo" argument
    if (_.includes(argv, "--dojo")) {
      // Webpack DOJO build production version
      return buildCmd.buildWebpack(config, "dojo");
    } else {
      // Webpack DEFAULT build production version
      return buildCmd.buildWebpack(config);
    }
  })
  .then(() => {
    // User provided the "dojo" argument
    if (_.includes(argv, "--dojo")) {
      // Create dojoConfig file in the prod folder
      const dojoConfigFilename = path.join(
        config.paths.deployWwwRoot,
        "dojoConfig.js"
      );
      return buildCmd.createFileFromTemplate(
        dojoConfigFilename,
        templates.dojoProdConfig()
      );
    } else {
      // Next
      return;
    }
  })
  .then(() => {
    // Copy Fonts
    return buildCmd.copyFonts(config);
  })
  .then(() => {
    // Copy Leaflet Images
    return buildCmd.copyLeafletImages(config);
  })
  .then(() => {
    // Copy Assets
    return buildCmd.copyAssets(config);
  })
  .then(() => {
    // User provided the "azure" argument
    if (_.includes(argv, "--azure")) {
      return buildAzure.build(config, argv);
    }
    return;
  })
  .then(() => {
    // User provided the "docker" argument
    if (_.includes(argv, "--docker")) {
      return buildDocker.build(config, argv);
    }
    return;
  })
  .then(() => {
    if (_.includes(argv, "--iis")) {
      return buildCmd.createSPAWebConfig(config);
    }
    return;
  })
  .catch(function(e) {
    console.log(e); // "oh, no!"
  });
