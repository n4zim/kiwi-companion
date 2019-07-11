import newCommand from "../core/newCommand"
import forever from "forever-monitor"
import KiwiConfigs from "../core/KiwiConfigs";
import ConfigsV1 from "../core/Configs.v1";
import ProgramCommands from "../core/ProgramCommands";

newCommand(this, {
  command: "start",
  description: "Start development mode (daemon)",
  handler: (args, path) => {
    let config = ConfigsV1.get()

    if(KiwiConfigs.exists(path)) { // kiwi.yml found
      const repository = ConfigsV1.getRepository(config, path)
      config.paths[path] = ProgramCommands.start(repository)
    } else { // No kiwi.yml
      ConfigsV1.getWorkspaceRepositoryPaths(config, path).forEach(repositoryPath => {
        const repository = ConfigsV1.getRepository(config, repositoryPath)
        config.paths[repositoryPath] = ProgramCommands.start(repository)
      })
    }

    ConfigsV1.set(config)
  },
})
