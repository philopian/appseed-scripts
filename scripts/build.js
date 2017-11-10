process.env.NODE_ENV = "production";
const fs = require("fs");
const path = require("path");
const argv = process.argv.slice(2);
const chalk = require("chalk");
const rimraf = require("rimraf");
const _ = require("lodash");

const appDirectory = fs.realpathSync(process.cwd());
const config = require(path.join(appDirectory, "appseed.config.js"));
console.log(
  "",
  chalk.bgCyan("Command:"),
  " $ appseed build\n",
  chalk.bgCyan("Application Root:"),
  ` ${appDirectory}\n`,
  chalk.bgCyan("Argument:"),
  ` ${argv}\n`
);

const bowerTags = require("../tools/bower-tags");
const buildCmd = require("../tools/build-cmd");
////////////////////////////////////////////////////////////////////////////////////////////////////////////

//-- Functions-----
function BuildAzure(config) {
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
      return buildCmd.createDotEnv(config);
    })
    .then(() => {
      // Create Webconfig file
      return buildCmd.createWebConfig(config);
    })
    .then(() => {
      // DONE!
      console.log(
        "\n\n\n",
        "******************************************************************************\n",
        "\n",
        "      Production build is complete! \n",
        "      To run your application locally follow these commands:\n",
        "      $ cd " + config.fileNames.distRoot + " \n",
        "      $ node server \n",
        "\n",
        "      You can now view your website at http://localhost:" +
        config.port +
        "\n",
        "\n",
        "*************************************************************************\n\n\n"
      );
    });
}

function BuildDocker(config) {
  console.log(chalk.blue("Building Docker deploy version"));

  // Create prod package.json
  const packageJsonOutPath = path.join(config.paths.deployRoot, "nodejs");
  buildCmd
  // Make the ./DEPLOY/nodejs/ folder
    .makeFolderIfDoesntExist(packageJsonOutPath)
    .then(() => {
      // Copy & clean the packageJson file
      return buildCmd.copyPackageJson(config, "nodejs");
    })
    .then(() => {
      // Copy the server files to ./DEPLOY/nodejs/server/
      return buildCmd.copyServerFiles(config, "nodejs");
    })
    .then(() => {
      // TODO: create dockerfile for nodejs from template
      return;
    })
    .then(() => {
      // Copy appseed.config.js file
      return buildCmd.copyAppseedConfig(config, "nodejs");
    })
    .then(() => {
      // Create .env file
      return buildCmd.createDotEnv(config, "nodejs");
    })
    .then(() => {
      // TODO: Copy the ./templates-folders/docker/ansible to ./DEPLOY/ansible
      return buildCmd.createAnsibleFiles(config);
    })
    .then(() => {
      // TODO: Copy the ./templates-folders/docker/nginx to ./DEPLOY/nginx
      return;
    })
    .then(() => {
      // TODO: Copy the ./templates-folders/docker/nodejs to ./DEPLOY/nodejs
      return;
    })
    .then(() => {
      // Copy the docker-copose files and scripts
      // TODO: Copy the ./templates-folders/docker/up.sh to ./DEPLOY/up.sh
      // TODO: Copy the ./templates-folders/docker/down.sh to ./DEPLOY/down.sh
      // TODO: Copy the ./templates-folders/docker/README.sh to ./DEPLOY/README.sh
      return;
    })
    .then(() => {
      // DONE!
      console.log(
        "\n\n\n",
        "******************************************************************************\n",
        "\n",
        "      Production build is complete! \n",
        "      To run your application locally with docker, follow these commands:\n",
        "      $ cd " + config.fileNames.distRoot + " \n",
        "      $ ./up.sh \n",
        "\n",
        "      You can now view your website at http://localhost:" +
        config.port +
        "\n",
        "\n",
        "*************************************************************************\n\n\n"
      );
    });
}

//--Generate frontend files------
const deployFolder = config.paths.deployRoot;
buildCmd
  .makeFolderIfDoesntExist(deployFolder)
  .then(() => {
    // Make the ./DEPLOY/www/ folder
    const wwwFolder = config.paths.deployWwwRoot;
    return buildCmd.makeFolderIfDoesntExist(wwwFolder);
  })
  // .then(() => {
  //   // Make the ./DEPLOY/www/code/ folder
  //   const wwwCodeFolder = path.join(config.paths.deployWwwRoot, "code");
  //   return buildCmd.makeFolderIfDoesntExist(wwwCodeFolder);
  // })
  // .then(() => {
  //   // Cleanup bower tags from ./www/index.html file
  //   return bowerTags.addVendorCssTag(appDirectory);
  // })
  // .then(() => {
  //   // Webpack build production version
  //   return buildCmd.buildWebpack(config);
  // })
  // .then(() => {
  //   // Build bower vendor files
  //   const outCssFile = path.join(
  //     config.paths.deployWwwRoot,
  //     "code/vendor.min.css"
  //   );
  //   return bowerTags.concatBowerFiles(appDirectory, outCssFile);
  // })
  // .then(() => {
  //   // Clean up all the tags in the index.html
  //   return bowerTags.defaultTags(appDirectory);
  // })
  // .then(() => {
  //   // Copy Fonts
  //   return buildCmd.copyFonts(config);
  // })
  // .then(() => {
  //   // Copy Leaflet Images
  //   return buildCmd.copyLeafletImages(config);
  // })
  // .then(() => {
  //   // Copy Assets
  //   return buildCmd.copyAssets(config);
  // })
  .then(() => {
    // User provided the "azure" argument
    if (_.includes(argv, "azure")) {
      BuildAzure(config);
    }

    // User provided the "docker" argument
    if (_.includes(argv, "docker")) {
      BuildDocker(config);
    }
  });