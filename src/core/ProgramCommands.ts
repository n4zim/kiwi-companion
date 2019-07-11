import fs from "fs"
import { homedir } from "os"
import { join, dirname } from "path"
import { packageJson } from ".."
import Logger from "./logger"
import forever from "forever-monitor"

export default class ProgramCommands {
  private static configFile = join(homedir(), ".kiwi-bundle")

  private static saveGlobalConfig(config: Config): Config {
    fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2))
    return config
  }

  private static getGlobalConfig(): Config {
    if(fs.existsSync(this.configFile)) {
      return JSON.parse(fs.readFileSync(this.configFile, "utf-8"))
    }
    return this.saveGlobalConfig({
      version: packageJson.version,
      paths: {},
    })
  }

  private static getPath(config: Config, path: string): PathRepository|PathWorkspace|null {
    if(typeof config.paths[path] !== "undefined") {
      return config.paths[path]
    }
    return null
  }

  private static getPathType(path: string): PathType {
    if(fs.existsSync(join(path, "kiwi.yml"))) {
      return PathType.REPOSITORY
    }
    return PathType.WORKSPACE
  }

  static startProcess(path: string): number {
    return 123
  }

  static killProcess(path: PathRepository): PathRepository {
    Logger.info(`Killing PID ${path.pid}`)
    if(typeof path.pid !== "undefined") {
      forever.kill(path.pid)
      delete path.pid
      return path
    }
    Logger.info(`PID ${path.pid} was not found, ignoring...`)
    return { type: PathType.REPOSITORY, workspaces: [] }
  }

  static start(path: string) {
    const type = this.getPathType(path)
    const globalConfig = this.getGlobalConfig()
    const pathData = this.getPath(globalConfig, path)

    let error = null
    let paths: string[] = []

    if(type === PathType.WORKSPACE) { // No kiwi.yml

      if(pathData === null) { // No cache
        Logger.exit("Missing kiwi.yml and directory is not a workspace")

      } else if(pathData.type === PathType.WORKSPACE) { // Workspace from cache
        paths = pathData.repositories

      } else if(pathData.type === PathType.REPOSITORY) { // Path was previously a Repository
        globalConfig.paths[path] = this.killProcess(pathData)
        error = "Removed kiwi.yml, cache was cleaned"

      } else { // No Repository nor Workspace
        delete globalConfig.paths[path]
        error = "Unknown path type, cache was cleaned"

      }

    } else { // Found a kiwi.yml

      paths = [ path ]

      if(pathData === null || pathData.type !== PathType.REPOSITORY) { // No cache or other types of cache
        globalConfig.paths[path] = { type: PathType.REPOSITORY, workspaces: [] }
      } else { // Existing Repository cache
        globalConfig.paths[path] = this.killProcess(pathData)
      }

    }

    const PID = paths.map(currentPath => {
      const currentPID = this.startProcess(currentPath)
      if(typeof globalConfig.paths[currentPath] === "undefied") {
        globalConfig.paths[currentPath] = {
          
        }
      }
      if(typeof globalConfig.paths[currentPath].type === "undefied") {
        globalConfig.paths[currentPath].pid
      }
      return currentPID
    })

    this.saveGlobalConfig(globalConfig)

    if(error !== null) {
      Logger.exit(error)
    }

    return PID
  }

}
