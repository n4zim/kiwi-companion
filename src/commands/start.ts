import newCommand from "../core/newCommand"
import ConfigsV1 from "../core/Configs.v1"
import KiwiConfigs from "../core/KiwiConfigs"
import ProgramCommands from "../core/ProgramCommands"

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
      const repository = ConfigsV1.getRepository(config, repositoryPath)
      config.paths[repositoryPath] = ProgramCommands.start(repository)
    })

    ConfigsV1.set(config)
    process.exit()
  },
})
