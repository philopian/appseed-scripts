#!/usr/bin/env node

"use strict";

const chalk = require("chalk");
const spawn = require("react-dev-utils/crossSpawn");
const args = process.argv.slice(2);

const scriptIndex = args.findIndex(
  x => x === "dev" || x === "start" || x === "test" || x === "build" || x === "new"
);
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

switch (script) {
  case "dev":
  case "start":
  case "test":
  case "build":
  case "new":
    {
      const result = spawn.sync(
        "node",
        nodeArgs
        .concat(require.resolve("../scripts/" + script))
        .concat(args.slice(scriptIndex + 1)), { stdio: "inherit" }
      );
      if (result.signal) {
        if (result.signal === "SIGKILL") {
          console.log(
            "The build failed because the process exited too early. " +
            "This probably means the system ran out of memory or someone called " +
            "`kill -9` on the process."
          );
        } else if (result.signal === "SIGTERM") {
          console.log(
            "The build failed because the process exited too early. " +
            "Someone might have called `kill` or `killall`, or the system could " +
            "be shutting down."
          );
        }
        process.exit(1);
      }
      process.exit(result.status);
      break;
    }
  default:
    console.log(chalk.red("Unknown script ") + " " + script);
    console.log(chalk.red("Perhaps you need to update appseed-scripts?"));
    break;
}