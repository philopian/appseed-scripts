const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const chokidar = require('chokidar');
const camelCase = require('camel-case');
const mainBowerFiles = require('main-bower-files');
const concat = require('concat-files');
const cssnano = require('cssnano');

const injectTagsIntoHtml = (appDir) => {
  // Get a list of all the bower main files
  var files = mainBowerFiles({
    paths: appDir
  });

  // Get all the main files from the bower.json file
  let cssTags = '<!-- bower:css -->\n';
  files.forEach((d) => {
    let tagPath = d;
    tagPath = tagPath.replace(appDir + '/www', ''); // get relative path
    tagPath = tagPath.replace('www/', '');
    tagPath = tagPath.replace('www\\', ''); // windows paths
    tagPath = tagPath.replace(/\\/g, '/');

    let fileType = path.extname(d);
    if (fileType == '.css') {
      cssTags += `    <link rel="stylesheet" type="" href="${tagPath}">\n`
    }
  });
  cssTags += '    <!-- endinject -->';

  // Regex 
  var regexInjectCss = /<!-- bower:css -->([\s\S]*?)<!-- endinject -->/g;

  fs.readFile(path.join(appDir, 'www/index.html'), 'utf8', (err, html) => {
    if (err) {
      return console.log(err);
    }
    // Replace tags
    html = html.replace(regexInjectCss, cssTags);

    // Write changes to index.html file
    fs.writeFile(path.join(appDir, 'www/index.html'), html, 'utf8', function(err) {
      if (err) {
        return console.log(err);
      }
      console.log(chalk.blue('Bower tags injected into /www/index.html'));
    });
  });
}

const injectTagsIntoJs = (appDir) => {
  return new Promise((resolve, reject) => {
    const FILE_TO_INJECT_TAGS = path.join(appDir, 'www/index.js');

    // Get a list of all the bower main files
    var files = mainBowerFiles({
      paths: appDir
    });

    // Get all the main files from the bower.json file
    let cssTags = '//--bower:css (DO NOT DELETE)------------\n';
    files.forEach((d) => {
      let tagPath = d;
      tagPath = tagPath.replace(appDir + '/www', ''); // get relative path
      tagPath = tagPath.replace('www/', '');
      tagPath = tagPath.replace('www\\', ''); // windows paths
      tagPath = tagPath.replace(/\\/g, '/');

      let fileType = path.extname(d);
      if (fileType == '.css') {
        cssTags += `import ".${tagPath}";\n`
      }
    });
    cssTags += '//--bower:endinject (DO NOT DELETE)-------';

    // Regex 
    var regexInjectCss = /\/\/--bower:css \(DO NOT DELETE\)------------([\s\S]*?)\/\/--bower:endinject \(DO NOT DELETE\)-------/g;
    fs.readFile(FILE_TO_INJECT_TAGS, 'utf8', (err, jsImports) => {
      if (err) {
        return console.log(err);
      }
      // Replace tags
      jsImports = jsImports.replace(regexInjectCss, cssTags);

      // Write changes to index.html file
      fs.writeFile(FILE_TO_INJECT_TAGS, jsImports, 'utf8', function(err) {
        if (err) {
          return console.log(err);
        }
        console.log(chalk.blue('Bower tags injected into /www/index.js'));
        resolve();
      });
    });
  });
}

const concatBowerFiles = (appDir, outCssFile) => {
  return new Promise((resolve, reject) => {
    // Get a list of all the bower main files
    var files = mainBowerFiles({
      paths: appDir
    });

    // Filter all the bower files for css files
    let cssFilePaths = [];
    files.forEach((d) => {
      let fileType = path.extname(d);
      if (fileType == '.css') {
        cssFilePaths.push(d);
      }
    });

    // Concat all the files
    concat(cssFilePaths, outCssFile, function(err) {
      if (err) throw err

      // Minify the CSS
      fs.readFile(outCssFile, 'utf8', (err, str) => {
        if (err) {
          return console.log(err);
        }
        cssnano.process(str)
          .then(function(result) {
            fs.writeFileSync(outCssFile, result);
            console.log(chalk.blue('Bower vendor css minified'));
            resolve();
          });
      });
    });

  });
}

const addVendorCssTag = (appDir) => {
  return new Promise((resolve, reject) => {
    // Regex 
    var regexBowerTags = /<!-- bower:css -->([\s\S]*?)<!-- endinject -->/g;
    var cleanBowerTags = `<!-- bower:css -->
    <!-- endinject -->`;
    var regexBundleCss = /<!-- bundle:css -->([\s\S]*?)<!-- endinject -->/g;
    const vendorCssTag = `    <!-- bundle:css -->
    <link rel="stylesheet" type="" href="code/vendor.min.css">
    <link rel="stylesheet" href="code/app.css">
    <!-- endinject -->`;
    const bundleScript = '<script src="bundle.js"></script>';
    const bundleScriptUpdate = '<script src="code/bundle.js"></script>';

    fs.readFile(path.join(appDir, 'www/index.html'), 'utf8', (err, html) => {
      if (err) {
        return console.log(err);
      }
      // Replace tags
      html = html.replace(regexBowerTags, cleanBowerTags);
      html = html.replace(regexBundleCss, vendorCssTag);
      html = html.replace(bundleScript, bundleScriptUpdate);

      // Write changes to index.html file
      fs.writeFile(path.join(appDir, 'www/index.html'), html, 'utf8', function(err) {
        if (err) {
          return console.log(err);
        }
        console.log(chalk.blue('Bower tags injected into /www/index.html'));
        resolve();
      });
    });
  });
}

const defaultTags = (appDir) => {
  return new Promise((resolve, reject) => {
    // Regex 
    var regexBowerTags = /<!-- bower:css -->([\s\S]*?)<!-- endinject -->/g;
    var cleanBowerTags = `<!-- bower:css -->
    <!-- endinject -->`;
    var regexBundleCss = /<!-- bundle:css -->([\s\S]*?)<!-- endinject -->/g;
    const vendorCssTag = `<!-- bundle:css -->
    <!-- endinject -->`;
    const bundleScript = '<script src="code/bundle.js"></script>';
    const bundleScriptUpdate = '<script src="bundle.js"></script>';

    fs.readFile(path.join(appDir, 'www/index.html'), 'utf8', (err, html) => {
      if (err) {
        return console.log(err);
      }
      // Replace tags
      html = html.replace(regexBowerTags, cleanBowerTags);
      html = html.replace(regexBundleCss, vendorCssTag);
      html = html.replace(bundleScript, bundleScriptUpdate);

      // Write changes to index.html file
      fs.writeFile(path.join(appDir, 'www/index.html'), html, 'utf8', function(err) {
        if (err) {
          return console.log(err);
        }
        console.log(chalk.blue('Index.html tags are set back to defaults'));
        resolve();
      });
    });
  });
}


module.exports = {
  watch: (appDir) => {
    chokidar.watch(path.join(appDir, 'bower.json'), {
        persistent: true
      })
      .on('change', (path, stats) => {
        console.log('.......[bower.json change]');
        injectTagsIntoHtml(appDir);
      });
  },
  injectTagsIntoHtml: injectTagsIntoHtml,
  injectTagsIntoJs: injectTagsIntoJs,
  concatBowerFiles: concatBowerFiles,
  addVendorCssTag: addVendorCssTag,
  defaultTags: defaultTags,
}