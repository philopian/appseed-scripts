const fs = require("fs");
const path = require("path");
const ROOT = fs.realpathSync(process.cwd());
const DEPLOY = "DEPLOY";
module.exports = {
  // port: 8080,
  // portApi: 9090,
  fileNames: {
    // webRoot: 'www',
    webRoot: path.join(ROOT, "./www"),
  },
  paths: {
    // appRoot: ROOT,
    webRoot: path.join(ROOT, "./www"),
    deployRoot: path.join(ROOT, DEPLOY),
    deployWwwRoot: path.join(ROOT, DEPLOY, 'www'),
    // bower: path.join(ROOT, "./bower_components")
  }
};