import commandExists from "command-exists"
import fs from "fs"
import path from "path"
import logger from "./logger"
import { exec } from "child_process"

enum PackagesBinary {
  NPM,
  YARN,
}

export default class PackagesCommands {
  private static directory = process.cwd()
  private static isYarnInstalled = commandExists.sync("yarn")

  private static detectBinary(): PackagesBinary {
    if(!fs.existsSync(path.join(this.directory, "package.json"))) {
      logger.exit("No package.json found, you must init first")
    }

    if(fs.existsSync(path.join(this.directory, "yarn.lock"))) {
      logger.info("Yarn detected")
      if(!this.isYarnInstalled) {
        logger.exit("Yarn is not installed")
      }
      return PackagesBinary.YARN
    }

    if(fs.existsSync(path.join(this.directory, "package-lock.json"))) {
      logger.info("NPM detected")
      return PackagesBinary.NPM
    }

    if(this.isYarnInstalled) {
      logger.info("Yarn was detected and will be used")
      return PackagesBinary.YARN
    }

    return PackagesBinary.NPM
  }

  private static execute(command: string|string[]) {
    if(Array.isArray(command)) command = command.join(" ")
    exec(command, (error, stdout) => {
      if(error !== null) {
        logger.exit(error.message)
      }
      console.log(stdout)
    })
  }

  static install() {
    switch(this.detectBinary()) {
      case PackagesBinary.NPM:
        this.execute("npm install")
        break
      case PackagesBinary.YARN:
        this.execute("yarn")
        break
    }
  }

  static add(packages: string[], isDev: boolean = false, isOptional: boolean = false) {
    if(isDev && isOptional) {
      logger.exit("You cannot add a dependency to dev and optional in the same time")
    }

    const command: string[] = []

    switch(this.detectBinary()) {

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

  static remove(packages: string[]) {
    switch(this.detectBinary()) {

      case PackagesBinary.NPM:
        this.execute([ "yarn remove", ...packages ])
        break

      case PackagesBinary.YARN:
        this.execute([ "npm remove --save", ...packages ])
        break

    }
  }

}
