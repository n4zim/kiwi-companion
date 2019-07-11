import fs from "fs"
import { homedir } from "os"
import { join, dirname } from "path"
import { packageJson } from ".."
import Logger from "./logger"
import forever from "forever-monitor"

export default class Configs {
  private static file = join(homedir(), ".kiwi-bundle")

  static read(): ConfigsType {
    if(fs.existsSync(this.file)) {
      return JSON.parse(fs.readFileSync(this.file, "utf-8"))
    }
    return {
      version: packageJson.version,
      paths: {},
    }
  }

  static write(config: ConfigsType): ConfigsType {
    fs.writeFileSync(this.file, JSON.stringify(config, null, 2))
    return config
  }

  static getPath(config: ConfigsType, path: string): RepositoryPath {
    if(typeof config.paths[path] !== "undefined") {
      return config.paths[path]
    }
    return null
  }

}
