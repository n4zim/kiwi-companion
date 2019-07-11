#!/usr/bin/env node
import yargs from "yargs"

yargs
  .scriptName("kiwi")
  .commandDir("commands")
  .usage('$0 <command> [args]')
  .demandCommand(1, "")
  .recommendCommands()
  .strict()
  .argv
