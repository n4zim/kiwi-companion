#!/usr/bin/env node
import yargs from "yargs"
import { Request } from "dropin-recipes"

if(typeof process.env.KIWI_COMPANION_LOCAL_PORT !== "undefined") {
  Request.enableLocalMode(parseInt(process.env.KIWI_COMPANION_LOCAL_PORT))
}


export const packageJson = require("../package.json")

yargs
  .scriptName("kiwi")
  .usage(`Kiwi Companion : ${packageJson.description}`)
  .version(packageJson.version)
  .commandDir("commands")
  .demandCommand(1, "")
  .recommendCommands()
  .strict()
  .argv
