import { readFileSync } from "fs"
import ConfigsV1 from "../../core/Configs.v1"
import { wrapper } from "../../../core/wrapper"
import { join } from "path"
import { Logger } from "../../../core/Logger"

wrapper(this, {
  command: "[slug] start",
  description: "Start development mode",
  handler: (args, path) => {
    let config = ConfigsV1.get()

    ConfigsV1.getCurrentPaths(path, config).forEach(repositoryPath => {
      const packageJson = JSON.parse(readFileSync(join(path, "package.json"), "utf-8"))

      if(typeof packageJson.scripts === "undefined") {
        Logger.exit(`No scripts inside package.json`)
      }

      if(typeof packageJson.scripts.start === "undefined") {
        Logger.exit(`No start script inside package.json`)
      }

      const repository = ConfigsV1.getRepository(config, repositoryPath)
      // const program = PackagesCommands.detectBinary(path)
      // config.paths[repositoryPath] = ProgramCommands.start(repository, [ program, "start" ])
    })

    ConfigsV1.set(config)
  },
})
