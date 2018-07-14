const fs = require("fs");
const fsExtra = require("node-fs-extra");
const _ = require("lodash");
const path = require("path");
const chalk = require("chalk");
const shell = require("shelljs");
const rimraf = require("rimraf");
const ora = require("ora");
const webpack = require("webpack");
const templates = require("./templates");
const chmod = require("chmod");
const openBrowser = require("react-dev-utils/openBrowser");

function checkIfUndefined(item) {
  if (item == undefined) {
    return "";
  } else {
    return item;
  }
}

module.exports = {
  makeFolderIfDoesntExist: folderName => {
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

  createFileFromTemplate: (filename, templateStr) => {
    return new Promise((resolve, reject) => {
      fs.writeFileSync(filename, templateStr, "utf-8");
      resolve();
    });
  },

  buildWebpack: (config, buildType) => {
    buildType = checkIfUndefined(buildType);
    return new Promise((resolve, reject) => {
      var spinner = ora(
        chalk.blue("Generating minified bundle for production.")
      ).start();

      // Check to see if use passed in the dojo flag
      let webpackConfig;
      if (buildType == "dojo") {
        webpackConfig = require("../config/webpack.config.proddojo");
      } else {
        webpackConfig = require("../config/webpack.config.prod");
      }
      webpack(webpackConfig).run((err, stats) => {
        spinner.stop();
        if (err) {
          console.log(chalk.red(err));
          return 1;
        }
        /**
         *
         * jsonStats keys
         *
         * errors/warnings/version/hash/time/builtAt/publicPath/outputPath
         * assetsByChunkNames/assetsfilteredAssets/entrypoints/namedChunkGroups
         * chunks/modules/filteredModules/children
         *
         */
        const jsonStats = stats.toJson();
        if (jsonStats.hasErrors) {
          return jsonStats.errors.map(error => console.log(chalk.red(error)));
        }

        if (jsonStats.hasWarnings) {
          console.log(
            chalk.yellow("[Webpack generated the following warnings: ]")
          );
          jsonStats.warnings.map(warning =>
            console.log(chalk.yellow([warning]))
          );
        }

        console.log(
          chalk.blue(
            `Your app has been built for production and written to ./${
              config.fileNames.distRoot
            }`
          )
        );
        resolve();
      });
    });
  },

  copyAssets: config => {
    return new Promise((resolve, reject) => {
      /*********************************************
       * Copy the Assets folder
       *********************************************/
      var sourceAssets = path.join(config.paths.webRoot, "assets");
      var destinationAssets = path.join(config.paths.deployWwwRoot, "assets");
      fsExtra.copy(sourceAssets, destinationAssets, function(err) {
        if (err) {
          console.error(err);
        } else {
          console.log(
            chalk.blue("Assets files have been copied to the dist folder!")
          );
          resolve();
        }
      });
    });
  },

  copyAppseedConfig: (config, folderName) => {
    folderName = checkIfUndefined(folderName);
    return new Promise((resolve, reject) => {
      /*********************************************
       * Copy appseed.config.js
       *********************************************/
      var sourceAppSeedconfig = path.join(
        config.paths.appRoot,
        "appseed.config.js"
      );
      var destinationAppSeedconfig = path.join(
        config.paths.deployRoot,
        folderName,
        "appseed.config.js"
      );
      if (fs.existsSync(sourceAppSeedconfig)) {
        fsExtra.copy(sourceAppSeedconfig, destinationAppSeedconfig, err => {
          if (err) return console.error(err);
          console.log(chalk.blue("appseed.config.js has been copied"));
          resolve();
        });
      }
    });
  },

  createDotEnv: (config, folderName, copyEnvFile) => {
    folderName = checkIfUndefined(folderName);
    return new Promise((resolve, reject) => {
      /*********************************************
       * Create/update .env file
       *********************************************/
      const dotEnvDestinationFile = path.join(
        config.paths.deployRoot,
        folderName,
        ".env"
      );
      let dotEnvContents;
      if (copyEnvFile) {
        const dotEnvFile = path.join(config.paths.appRoot, ".env");
        dotEnvContents = fs.readFileSync(dotEnvFile, "utf8");

        // Switch the development to production for the node environment
        dotEnvContents = dotEnvContents.replace(
          "NODE_ENV=development",
          "NODE_ENV=production"
        );
        dotEnvContents = dotEnvContents.replace("PORT=9090", "PORT=8080");
      } else {
        dotEnvContents = `NODE_ENV=production
PORT=8080
`;
      }

      fs.writeFile(dotEnvDestinationFile, dotEnvContents, "utf8", err => {
        if (err) return console.error(err);
        console.log(chalk.blue("Created .env file"));
        resolve();
      });
    });
  },

  createWebConfig: config => {
    return new Promise((resolve, reject) => {
      /*********************************************
       * Create web.config file
       *********************************************/
      const webConfigFileName = path.join(
        config.paths.deployRoot,
        "web.config"
      );
      const webConfigContents = templates.webConfig();
      fs.writeFile(webConfigFileName, webConfigContents, "utf8", function(err) {
        if (err) {
          return console.log(err);
        }
        console.log(chalk.blue("Created web.config file"));
        resolve();
      });
    });
  },

  removeDevBundleScript: config => {
    return new Promise((resolve, reject) => {
      const deployIndexHtml = path.join(
        config.paths.deployRoot,
        "www/index.html"
      );

      fs.readFile(deployIndexHtml, "utf8", function(err, data) {
        if (err) {
          console.log(err);
          return resolve();
        }
        var result = data.replace('<script src="bundle.js"></script>', "");
        fs.writeFile(deployIndexHtml, result, "utf8", err => {
          resolve();
        });
      });
    });
  },

  copyServerFiles: (config, folderName) => {
    folderName = checkIfUndefined(folderName);
    return new Promise((resolve, reject) => {
      /*********************************************
       * Copy the server files
       *********************************************/
      var sourceServer = path.join(config.paths.appRoot, "server");
      var destinationServer = path.join(
        config.paths.deployRoot,
        folderName,
        "server"
      );
      if (fs.existsSync(sourceServer)) {
        fsExtra.copy(sourceServer, destinationServer, err => {
          if (err) return console.error(err);
          console.log(
            chalk.blue("Copied the server files to production folder")
          );
          resolve();
        });
      } else {
        resolve();
      }
    });
  },

  copyPackageJson: (config, folderName) => {
    folderName = checkIfUndefined(folderName);
    return new Promise((resolve, reject) => {
      /*********************************************
       * Copy the server files
       *********************************************/
      // Copy the package.json and remove all the devDependencies
      const packageJsonFileIn = path.join(config.paths.appRoot, "package.json");
      const packageJsonFileOut = path.join(
        config.paths.deployRoot,
        folderName,
        "package.json"
      );
      fs.readFile(packageJsonFileIn, "utf8", (err, packageJson) => {
        if (err) return console.error(err);

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
        fs.writeFile(packageJsonFileOut, packageJson, "utf8", err => {
          if (err) return console.error(err);
          console.log(
            chalk.blue("Copied the package.json files to production folder")
          );
          resolve();
        });
      });
    });
  },

  createSPAWebConfig: config => {
    // Generate Dockerfile files
    return new Promise((resolve, reject) => {
      // Generate SPA webconfig
      const webconfigFilename = path.join(
        config.paths.deployRoot,
        "www",
        "web.config"
      );
      const webconfigContents = templates.spaWebConfig();
      fs.writeFileSync(webconfigFilename, webconfigContents, "utf-8");
      resolve();
    });
  },

  createAnsibleFiles: config => {
    return new Promise((resolve, reject) => {
      // Generate Ansible files
      const source = path.join(
        __dirname,
        "../templates-folders/docker/ansible"
      );
      const destination = path.join(config.paths.deployRoot, "ansible");
      fsExtra.copy(source, destination, err => {
        if (err) return console.error(err);
        console.log(chalk.blue("Ansible files created in ./DEPLOY"));
        resolve();
      });
    });
  },

  createNginxFiles: config => {
    return new Promise((resolve, reject) => {
      // Generate Nginx files
      const source = path.join(__dirname, "../templates-folders/docker/nginx");
      const destination = path.join(config.paths.deployRoot, "nginx");
      fsExtra.copy(source, destination, err => {
        if (err) return console.error(err);
        console.log(chalk.blue("Nginx files created in ./DEPLOY"));
        resolve();
      });
    });
  },

  createDockerFiles: config => {
    // Generate Dockerfile files
    return new Promise((resolve, reject) => {
      // Generate Nginx Dockerfile
      const dockerfileNginxFilename = path.join(
        config.paths.deployRoot,
        "nginx",
        "Dockerfile"
      );
      const dockerfileNginxContents = templates.dockerfileNginx();
      fs.writeFileSync(
        dockerfileNginxFilename,
        dockerfileNginxContents,
        "utf-8"
      );

      // Generate Nginx Dockerfile
      const dockerfileNodejsFilename = path.join(
        config.paths.deployRoot,
        "nodejs",
        "Dockerfile"
      );
      const dockerfileNodejsContents = templates.dockerfileNodejs();
      fs.writeFileSync(
        dockerfileNodejsFilename,
        dockerfileNodejsContents,
        "utf-8"
      );

      resolve();
    });
  },

  copyTemplateFiles: config => {
    // Copy ./up.sh & ./down.sh files
    return new Promise((resolve, reject) => {
      fsExtra.copySync(
        path.join(__dirname, "../templates-folders/docker/up.sh"),
        path.join(config.paths.deployRoot, "up.sh")
      );
      fsExtra.copySync(
        path.join(__dirname, "../templates-folders/docker/down.sh"),
        path.join(config.paths.deployRoot, "down.sh")
      );
      fsExtra.copySync(
        path.join(__dirname, "../templates-folders/docker/README.md"),
        path.join(config.paths.deployRoot, "README.md")
      );
      fsExtra.copySync(
        path.join(__dirname, "../templates-folders/docker/docker-compose.yml"),
        path.join(config.paths.deployRoot, "docker-compose.yml")
      );

      chmod(path.join(config.paths.deployRoot, "up.sh"), 751);
      chmod(path.join(config.paths.deployRoot, "down.sh"), 751);

      resolve();
    });
  },

  copyWwwToNginx: config => {
    return new Promise((resolve, reject) => {
      // Copy ./www/ to Nginx/www/ files
      const source = path.join(config.paths.deployRoot, "www");
      const destination = path.join(config.paths.deployRoot, "nginx", "www");
      fsExtra.copy(source, destination, err => {
        if (err) return console.error(err);
        console.log(chalk.blue("WWW files copied to ./nginx/www"));
        resolve();
      });
    });
  },

  printAzureInstuctions: config => {
    return new Promise((resolve, reject) => {
      console.log(chalk.blue(`
******************************************************************************
      Production build is complete!                                           
      To run your application locally follow these commands:                  
      $ cd ${config.fileNames.distRoot}                                       
      $ node server                                                           
      You can now view your website at http://localhost:${config.port}        
******************************************************************************
`));
      resolve();
    });
  },

  printDockerInstuctions: config => {
    return new Promise((resolve, reject) => {
      console.log(chalk.blue(`
******************************************************************************
      Production build is complete!
      To run your application locally with docker, follow these commands:                  
      $ cd ${config.fileNames.distRoot}                                      
      $ ./up.sh
      You can now view your website at http://localhost:80
******************************************************************************
`));
      resolve();
    });
  },

  runServerAndBrowserLocally: config => {
    console.log(chalk.blue(`
******************************************************************************
      Production build is complete!
      Your application is running locally at: http://localhost:8080

      To quit the server press [ctlr]+[C] in the terminal
******************************************************************************
`));

    // Open browser
    openBrowser(`http://localhost:${config.port}`);

    // Run local production server
    process.env.NODE_ENV = "production";
    process.env.PORT = 8080;
    const cmd = `cd ${config.paths.deployRoot} && node server`;
    shell.exec(cmd);
  }
};
