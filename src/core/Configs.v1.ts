import { join } from "path"
import { homedir } from "os"
import { ConfigsObject, RepositoryPath, PathType, WorkspacePath } from "./Configs.v1.types"
import fs from "fs"
import { packageJson } from ".."
import Logger from "./Logger"
import ProgramCommands from "./ProgramCommands"

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

  static getRepository(config: ConfigsObject, path: string): RepositoryPath {
    if(typeof config.paths[path] !== "undefined") { // From cache
      if(config.paths[path].type === PathType.REPOSITORY) { // Refreshing old one
        return config.paths[path]
      } // Others path types will be replaced
    }
    return { // Fresh one
      type: PathType.REPOSITORY,
      workspaces: [],
    }
  }

  static getWorkspaceRepositoryPaths(config: ConfigsObject, path: string): string[] {
    if(typeof config.paths[path] === "undefined") {
      Logger.exit("Missing kiwi.yml and directory is not a workspace")
    }

    if(config.paths[path].type === PathType.WORKSPACE) { // Workspace from cache
      const pathData: WorkspacePath = config.paths[path]
      if(typeof pathData.repositories !== "undefined") {
        return pathData.repositories
      }
      return []
    }

    delete config.paths[path]
    ConfigsV1.set(config)

    if(config.paths[path].type === PathType.REPOSITORY) { // Path was previously a Repository
      ProgramCommands.kill(config.paths[path])
      Logger.exit("Removed kiwi.yml, cache was cleaned")
    }

    Logger.exit("Unknown path type, cache was cleaned") // No Repository nor Workspace
    return []
  }

}
