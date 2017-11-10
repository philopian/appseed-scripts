const fs = require("fs");
const fsExtra = require("node-fs-extra");
const path = require("path");
const chalk = require("chalk");
const shell = require('shelljs');
const rimraf = require('rimraf');
const ora = require('ora');
const webpack = require('webpack');
const webpackConfig = require('../config/webpack.config.prod');
const templates = require('./templates');

module.exports = {

  makeFolderIfDoesntExist: (folderName) => {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(folderName)) {
        rimraf(folderName, () => {
          fs.mkdirSync(folderName);
          resolve();
        });
      } else {
        fs.mkdirSync(folderName);
        resolve();
      }
    });
  },

  buildWebpack: (config) => {
    return new Promise((resolve, reject) => {
      var spinner = ora(chalk.blue('Generating minified bundle for production.')).start();
      webpack(webpackConfig).run((err, stats) => {
        spinner.stop();
        if (err) {
          console.log(chalk.red(err));
          return 1;
        }
        const jsonStats = stats.toJson();

        if (jsonStats.hasErrors) {
          return jsonStats.errors.map(error => console.log(chalk.red(error)));
        }

        if (jsonStats.hasWarnings) {
          console.log(chalk.yellow('Webpack generated the following warnings: '));
          jsonStats.warnings.map(warning => console.log(chalk.yellow(warning)));
        }

        console.log(`Webpack stats: ${stats}`);
        console.log(chalk.blue(`Your app has been built for production and written to ./${config.fileNames.distRoot}`));
        // return 0;
        resolve();
      });
    });
  },

  copyFonts: (config) => {
    return new Promise((resolve, reject) => {
      /*********************************************
       * FontAwesome
       *********************************************/
      const fontAwesomeDir = path.join(config.paths.bower, 'font-awesome/fonts');
      const fontAwesomeBuildDir = path.join(config.paths.deployWwwRoot, 'fonts');

      if (fs.existsSync(path.join(fontAwesomeDir, 'fontawesome-webfont.ttf'))) {
        fsExtra.copy(fontAwesomeDir, fontAwesomeBuildDir, err => {
          if (err) return console.error(err)
          console.log(chalk.blue('FontAwesome fonts copied to DEPLOY'));
          resolve();
        });
      }
    });
  },

  copyLeafletImages: (config) => {
    return new Promise((resolve, reject) => {
      /*********************************************
       * Leaflet
       *********************************************/
      const leafletAssets = path.join(config.paths.bower, 'leaflet/dist/images');
      const leafletAssetsDist = path.join(config.paths.deployWwwRoot, 'code/images');
      if (fs.existsSync(path.join(leafletAssets, 'marker-icon.png'))) {
        fsExtra.copy(leafletAssets, leafletAssetsDist, err => {
          if (err) return console.error(err)
          console.log(chalk.blue('Leaflet assets copied to DEPLOY'));
          resolve();
        });
      }
    });
  },

  copyAssets: (config) => {
    return new Promise((resolve, reject) => {
      /*********************************************
       * Copy the Assets folder
       *********************************************/
      var sourceAssets = path.join(config.paths.webRoot, 'assets');
      var destinationAssets = path.join(config.paths.deployWwwRoot, 'assets');
      fsExtra.copy(sourceAssets, destinationAssets, function(err) {
        if (err) {
          console.error(err);
        } else {
          console.log(chalk.blue('Assets files have been copied to the dist folder!'));
          resolve();
        }
      });
    });
  },



  copyAppseedConfig: (config) => {
    return new Promise((resolve, reject) => {
      /*********************************************
       * Copy appseed.config.js
       *********************************************/
      var sourceAppSeedconfig = path.join(config.paths.appRoot, 'appseed.config.js');
      var destinationAppSeedconfig = path.join(config.paths.deployRoot, 'appseed.config.js');
      if (fs.existsSync(sourceAppSeedconfig)) {
        fsExtra.copy(sourceAppSeedconfig, destinationAppSeedconfig, err => {
          if (err) return console.error(err)
          console.log(chalk.blue('appseed.config.js has been copied'));
          resolve();
        });
      }
    });
  },



  createDotEnv: (config) => {
    return new Promise((resolve, reject) => {
      /*********************************************
       * Create .env file
       *********************************************/
      const dotEnvFile = path.join(config.paths.deployRoot, '.env');
      const dotEnvContents = `NODE_ENV=production
PORT=8080
      `;
      fs.writeFile(dotEnvFile, dotEnvContents, 'utf8', (err) => {
        if (err) return console.error(err)
        console.log(chalk.blue('Created .env file'));
        resolve();
      });
    });
  },



  createWebConfig: (config) => {
    return new Promise((resolve, reject) => {
      /*********************************************
       * Create web.config file
       *********************************************/
      const webConfigFileName = path.join(config.paths.deployRoot, 'web.config');
      const webConfigContents = templates.webConfig();
      fs.writeFile(webConfigFileName, webConfigContents, 'utf8', function(err) {
        if (err) {
          return console.log(err);
        }
        console.log(chalk.blue('Created web.config file'));
        resolve();
      });
    });
  },


  copyServerFiles: (config) => {
    return new Promise((resolve, reject) => {
      /*********************************************
       * Copy the server files
       *********************************************/
      var sourceServer = path.join(config.paths.appRoot, 'server');
      var destinationServer = path.join(config.paths.deployRoot, 'server');
      if (fs.existsSync(sourceServer)) {
        fsExtra.copy(sourceServer, destinationServer, err => {
          if (err) return console.error(err)
          console.log(chalk.blue('Copied the server files to production folder'));
          resolve();
        });
      }
    });
  },



  copyPackageJson: (config) => {
    return new Promise((resolve, reject) => {
      /*********************************************
       * Copy the server files
       *********************************************/
      // Copy the package.json and remove all the devDependencies
      const packageJsonFileIn = path.join(config.paths.appRoot, 'package.json');
      const packageJsonFileOut = path.join(config.paths.deployRoot, 'package.json');
      fs.readFile(packageJsonFileIn, 'utf8', (err, packageJson) => {
        if (err) return console.error(err)

        // Cleanup the devDependencies
        const regexRemoveDevDependencies = /,\n  "devDependencies": {([\s\S]*?)}/g;
        packageJson = packageJson.replace(regexRemoveDevDependencies, "");

        // Cleanup the scripts list
        const regexRemoveNpmScripts = /"scripts": {([\s\S]*?)},\n /g;
        const prodScripts = `"scripts": {
    "prestart": "npm i",
    "start": "node_modules/.bin/nodemon server"
  },
 `;
        packageJson = packageJson.replace(regexRemoveNpmScripts, prodScripts);

        // Remove author
        const regexRemoveAuthor = /"author": "([\s\S]*?)",\n  /g;
        packageJson = packageJson.replace(regexRemoveAuthor, "");

        // Write changes to index.html file
        fs.writeFile(packageJsonFileOut, packageJson, 'utf8', (err) => {
          if (err) return console.error(err)
          console.log(chalk.blue('Copied the package.json files to production folder'));
          resolve();
        });
      });





    });

  }





}