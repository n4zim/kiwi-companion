import commandExists from "command-exists"
import fs, { stat } from "fs"
import { join } from "path"
import { exec } from "child_process"
import { Logger } from "./Logger"
import { SpawnCallback, execute } from "./execute";

export enum PackagesBinary {
  NPM = "npm",
  YARN = "yarn",
}

type PackageDependencies = { [name: string]: string }

export interface PackagesJson {
  name: string
  version?: string
  dependencies?: PackageDependencies
  devDependencies?: PackageDependencies
  optionalDependencies?: PackageDependencies
}

export class CommandsPackages {
  private static isYarnInstalled = commandExists.sync("yarn")

  static detectPackageJson(path: string): boolean {
    return fs.existsSync(join(path, "package.json"))
  }

  static get(path: string): PackagesJson {
    return JSON.parse(fs.readFileSync(join(path, "package.json"), "utf-8"))
  }

  private static detectBinary(path: string): PackagesBinary {
    if(!this.detectPackageJson(path)) {
      Logger.exit("No package.json found, you must init first")
    }

    if(fs.existsSync(join(path, "yarn.lock"))) {
      Logger.info("Yarn detected")
      if(!this.isYarnInstalled) {
        Logger.exit("Yarn is not installed")
      }
      return PackagesBinary.YARN
    }

    if(fs.existsSync(join(path, "package-lock.json"))) {
      Logger.info("NPM detected")
      return PackagesBinary.NPM
    }

    if(this.isYarnInstalled) {
      Logger.info("Yarn was detected and will be used")
      return PackagesBinary.YARN
    }

    return PackagesBinary.NPM
  }

  static install(path: string, callback?: SpawnCallback) {
    switch(this.detectBinary(path)) {
      case PackagesBinary.NPM:
        execute([ "npm", "install" ], callback, path)
        break
      case PackagesBinary.YARN:
          execute([ "yarn" ], callback, path)
        break
    }
  }

  static add(path: string, packages: string[], isDev: boolean = false, isOptional: boolean = false) {
    if(isDev && isOptional) {
      Logger.exit("You cannot add a dependency to dev and optional in the same time")
    }

    const command: string[] = []

    switch(this.detectBinary(path)) {
      case PackagesBinary.NPM:
        command.push("npm", "install")
        if(isDev) {
          command.push("--save-dev")
        } else if(isOptional) {
          command.push("--save-optional")
        } else {
          command.push("--save-prod")
        }
        break
      case PackagesBinary.YARN:
        command.push("yarn", "add")
        if(isDev) {
          command.push("--dev")
        } else if(isOptional) {
          command.push("--optional")
        }
        break
    }

    execute([ ...command, ...packages ])
  }

  static remove(path: string, packages: string[]) {
    switch(this.detectBinary(path)) {
      case PackagesBinary.NPM:
        execute([ "npm", "remove", "--save", ...packages ])
        break
      case PackagesBinary.YARN:
        execute([ "yarn", "remove", ...packages ])
        break
    }
  }

  static linkCreate(path: string, callback?: SpawnCallback) {
    switch(this.detectBinary(path)) {
      case PackagesBinary.NPM:
        execute([ "npm", "link", "--force" ], callback, path)
        break
      case PackagesBinary.YARN:
        execute([ "yarn", "link", "--overwrite", "--force" ], callback, path)
        break
    }
  }

  static linkPackage(path: string, packageName: string, callback?: SpawnCallback) {
    switch(this.detectBinary(path)) {
      case PackagesBinary.NPM:
        execute([ "npm", "link", packageName ], callback, path)
        break
      case PackagesBinary.YARN:
        execute([ "yarn", "link", packageName ], callback, path)
        break
    }
  }

}
