import fs from "fs"
import { homedir } from "os"
import { join, dirname } from "path"
import { packageJson } from ".."
import Logger from "./logger"
import forever from "forever-monitor"

export default class ConfigsV1 {
  private static file = join(homedir(), ".kiwi-bundle")

  static get(): ConfigsObject {
    if(fs.existsSync(this.file)) {
      return JSON.parse(fs.readFileSync(this.file, "utf-8"))
    }
    return {
      version: packageJson.version,
      paths: {},
    }
  }

  static set(config: ConfigsObject): ConfigsObject {
    fs.writeFileSync(this.file, JSON.stringify(config, null, 2))
    return config
  }

  static getRepositories(config: ConfigsObject, path: string): RepositoryPath[] {
    if(typeof config.paths[path] !== "undefined") { // From cache
      if(config.paths[path].type === PathType.REPOSITORY) { // Refreshing old one
        return [ config.paths[path] ]
      }
    }
    return [ { // Fresh one
      type: PathType.REPOSITORY,
      workspaces: [],
    } ]
  }

  static setPID() {}

}
