import newCommand from "../core/newCommand"
import forever from "forever-monitor"
import KiwiConfigs from "../core/KiwiConfigs";
import ConfigsV1 from "../core/Configs.v1";
import ProgramCommands from "../core/ProgramCommands";

newCommand(this, {
  command: "start",
  description: "Start development mode (daemon)",
  handler: () => {
    const path = process.cwd()
    let config = ConfigsV1.get()

    if(KiwiConfigs.exists(path)) { // kiwi.yml found
      ConfigsV1.getRepository(config, path).forEach(repository => {
        if(typeof repository.pid !== "undefined") {
          ProgramCommands.killProcess(repository.pid)
          delete repository.pid
        }
        config.paths[path] = repository
      })
    } else { // No kiwi.yml
      ConfigsV1.getWorkspaceRepositories(config, path).forEach(repository => {
        if(typeof repository.pid !== "undefined") {
          ProgramCommands.killProcess(repository.pid)
          delete repository.pid
        }
        config.paths[path] = repository
      })
    }

    ConfigsV1.set(config)



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


  },
})
