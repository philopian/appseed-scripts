process.env.NODE_ENV = 'production';
const fs = require("fs");
const path = require("path");
const argv = process.argv.slice(2);
const chalk = require("chalk");
const rimraf = require('rimraf');
const _ = require("lodash");

const appDirectory = fs.realpathSync(process.cwd());
const config = require(path.join(appDirectory, 'appseed.config.js'));
console.log(
  '',
  chalk.bgCyan('Command:'),
  ' $ appseed build\n',
  chalk.bgCyan('Application Root:'),
  ` ${appDirectory}\n`,
  chalk.bgCyan('Argument:'),
  ` ${argv}\n`
);

const bowerTags = require('../tools/bower-tags');
const buildCmd = require('../tools/build-cmd');
////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Generate frontend files
const deployFolder = config.paths.deployRoot;
buildCmd.makeFolderIfDoesntExist(deployFolder)
  .then(() => {
    // Make the ./DEPLOY/www/ folder
    const wwwFolder = config.paths.deployWwwRoot;
    return buildCmd.makeFolderIfDoesntExist(wwwFolder);
  })
  .then(() => {
    // Make the ./DEPLOY/www/code/ folder
    const wwwCodeFolder = path.join(config.paths.deployWwwRoot, 'code');
    return buildCmd.makeFolderIfDoesntExist(wwwCodeFolder);
  })
  .then(() => {
    // Cleanup bower tags from ./www/index.html file
    return bowerTags.addVendorCssTag(appDirectory);
  })
  .then(() => {
    // Webpack build production version
    return buildCmd.buildWebpack(config);
  })
  .then(() => {
    // Build bower vendor files
    const outCssFile = path.join(config.paths.deployWwwRoot, 'code/vendor.min.css');
    return bowerTags.concatBowerFiles(appDirectory, outCssFile);
  })
  .then(() => {
    // Clean up all the tags in the index.html
    return bowerTags.defaultTags(appDirectory);
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
    if (_.includes(argv, 'azure')) {
      console.log(chalk.blue('Building Azure deploy version'));

      // Create prod package.json
      buildCmd.copyPackageJson(config)
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
          return buildCmd.createDotEnv(config);
        })
        .then(() => {
          // Create Webconfig file
          return buildCmd.createWebConfig(config);
        })
        .then(() => {
          // DONE!
          console.log(
            '\n\n\n',
            '******************************************************************************\n',
            '\n',
            '      Production build is complete! \n',
            '      To run your application locally follow these commands:',
            '      $ cd ' + config.fileNames.distRoot + ' \n',
            '      $ node server \n',
            '\n',
            '      You can now view your website at http://localhost:' + config.port + '\n',
            '\n',
            '*************************************************************************\n\n\n'
          );
        });

    }








  });