import { join } from "path"
import { homedir } from "os"
import fs from "fs"
import { ConfigsObject, RepositoryPath, PathType, WorkspacePath } from "./Configs.v1.types"
import { packageJson } from "../.."
import { Logger } from "../../core/Logger"
import KiwiConfigs from "./KiwiConfigs"

export default class ConfigsV1 {
  private static dir = join(homedir(), ".kiwi-bundle")
  private static logsDir = "logs"
  private static file = "config.json"

  static get(): ConfigsObject {
    if(!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir)
    }

    const config = join(this.dir, this.file)
    if(fs.existsSync(config)) {
      return JSON.parse(fs.readFileSync(config, "utf-8"))
    }

    return {
      version: packageJson.version,
      paths: {},
    }
  }

  static set(config: ConfigsObject): ConfigsObject {
    fs.writeFileSync(join(this.dir, this.file), JSON.stringify(config, null, 2))
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
      // ProgramCommands.killBackground(config.paths[path])
      Logger.exit("Removed kiwi.yml, cache was cleaned")
    }

    Logger.exit("Unknown path type, cache was cleaned") // No Repository nor Workspace
    return []
  }

  static getCurrentPaths(path: string, config: ConfigsObject): string[] {
    if(KiwiConfigs.exists(path)) return [ path ] // kiwi.yml found
    return this.getWorkspaceRepositoryPaths(config, path) // No kiwi.yml
  }

  private static getLogsDirectory(name: string): string {
    const logsPath = join(this.dir, this.logsDir)
    if(!fs.existsSync(logsPath)) {
      fs.mkdirSync(logsPath)
    }
    return join(logsPath, name)
  }

  static writeLogs(name: string) {
    return fs.openSync(this.getLogsDirectory(`${name}.log`), "a")
  }

  static writeErrorsLogs(name: string) {
    return fs.openSync(this.getLogsDirectory(`${name}.errors.log`), "a")
  }

}
