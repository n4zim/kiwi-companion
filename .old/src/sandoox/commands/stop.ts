import { wrapper } from "../../core/wrapper"
import ConfigsV1 from "../core/Configs.v1"

interface Args {
  packages: string[]
  dev?: boolean
  optional?: boolean
}

wrapper<Args>(this, {
  command: "stop",
  description: "Stop project(s) processes",
  handler: (args, path) => {
    let config = ConfigsV1.get()

    ConfigsV1.getCurrentPaths(path, config).forEach(repositoryPath => {
      const repository = ConfigsV1.getRepository(config, repositoryPath)
      // ProgramCommands.killBackground(repository)
    })

    ConfigsV1.set(config)
  },
})
