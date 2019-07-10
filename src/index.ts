#!/usr/bin/env node
import program, { Command } from "commander"
import chalk from "chalk"

const packageJson = require("../../package.json")

program
  .name("kiwi")
  .version(packageJson.version)
  .description(packageJson.description)

program
  .command("install")
  .description("sets up project dependencies")
