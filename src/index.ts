#!/usr/bin/env node
import yargs from "yargs"

export const packageJson = require("../package.json")

yargs
  .scriptName("kiwi")
  .usage(`Kiwi Bundle CLI : ${packageJson.description}`)
  .version(packageJson.version)
  .commandDir("commands")
  .demandCommand(1, "")
  .recommendCommands()
  .strict()
  .argv
