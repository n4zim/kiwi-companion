import commandExists from "command-exists"
import fs from "fs"
import { join } from "path"
import { exec } from "child_process"
import logger from "./Logger"

export enum PackagesBinary {
  NPM = "npm",
  YARN = "yarn",
}

export default class CommandsPackages {
  private static isYarnInstalled = commandExists.sync("yarn")

  private static execute(command: string|string[]) {
    if(Array.isArray(command)) command = command.join(" ")
    exec(command, (error, stdout) => {
      if(error !== null) {
        logger.exit(error.message)
      }
      console.log(stdout)
    })
  }

  private static detectBinary(path: string): PackagesBinary {
    if(!fs.existsSync(join(path, "package.json"))) {
      logger.exit("No package.json found, you must init first")
    }

    if(fs.existsSync(join(path, "yarn.lock"))) {
      logger.info("Yarn detected")
      if(!this.isYarnInstalled) {
        logger.exit("Yarn is not installed")
      }
      return PackagesBinary.YARN
    }

    if(fs.existsSync(join(path, "package-lock.json"))) {
      logger.info("NPM detected")
      return PackagesBinary.NPM
    }

    if(this.isYarnInstalled) {
      logger.info("Yarn was detected and will be used")
      return PackagesBinary.YARN
    }

    return PackagesBinary.NPM
  }

  static install(path: string) {
    switch(this.detectBinary(path)) {
      case PackagesBinary.NPM:
        this.execute("npm install")
        break
      case PackagesBinary.YARN:
        this.execute("yarn")
        break
    }
  }

  static add(path: string, packages: string[], isDev: boolean = false, isOptional: boolean = false) {
    if(isDev && isOptional) {
      logger.exit("You cannot add a dependency to dev and optional in the same time")
    }

    const command: string[] = []

    switch(this.detectBinary(path)) {

      case PackagesBinary.NPM:
        command.push("npm install")
        if(isDev) {
          command.push("--save-dev")
        } else if(isOptional) {
          command.push("--save-optional")
        } else {
          command.push("--save-prod")
        }
        break

      case PackagesBinary.YARN:
        command.push("yarn add")
        if(isDev) {
          command.push("--dev")
        } else if(isOptional) {
          command.push("--optional")
        }
        break

    }

    this.execute([ ...command, ...packages ])
  }

  static remove(path: string, packages: string[]) {
    switch(this.detectBinary(path)) {

      case PackagesBinary.NPM:
        this.execute([ "yarn remove", ...packages ])
        break

      case PackagesBinary.YARN:
        this.execute([ "npm remove --save", ...packages ])
        break

    }
  }

}
