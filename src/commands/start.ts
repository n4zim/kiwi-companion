import newCommand from "../core/newCommand"
import ConfigsV1 from "../core/Configs.v1"
import KiwiConfigs from "../core/KiwiConfigs"
import { readFileSync } from "fs"
import { join } from "path"
import ProgramCommands from "../core/ProgramCommands"
import Logger from "../core/Logger"

newCommand(this, {
  command: "start",
  description: "Start development mode (daemon)",
  handler: (args, path) => {
    let config = ConfigsV1.get()
    let paths: string[]

    if(KiwiConfigs.exists(path)) { // kiwi.yml found
      paths = [ path ]
    } else { // No kiwi.yml
      paths = ConfigsV1.getWorkspaceRepositoryPaths(config, path)
    }

    paths.forEach(repositoryPath => {
      const packageJson = JSON.parse(readFileSync(join(path, "package.json"), "utf-8"))
      if(typeof packageJson.scripts === "undefined") {
        Logger.exit(`No scripts inside package.json`)
      }
      if(typeof packageJson.scripts.start === "undefined") {
        Logger.exit(`No start script inside package.json`)
      }
      const repository = ConfigsV1.getRepository(config, repositoryPath)
      config.paths[repositoryPath] = ProgramCommands.start(repository, packageJson.scripts.start, packageJson.name)
    })

    ConfigsV1.set(config)
    process.exit()
  },
})
