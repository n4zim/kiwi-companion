import { wrapper } from "../core/wrapper"
import { CommandsPackages } from "../core/CommandsPackages"
import { Logger } from "../core/Logger"
import { ConfigsV1 } from "../core/Configs.v1"
import { Terminal } from "../core/Terminal"
import { KiwiFiles } from "../core/KiwiFiles"
import { execute, SpawnCallback } from "../core/execute"

interface Args {
  "workspace:project": string
}

wrapper<Args>(this, {
  command: "start [workspace:project]",
  description: "Start development server",
  builder: yargs => yargs.demandOption("workspace:project"),
  handler: (args, currentPath) => {
    const config = ConfigsV1.get()
    const paths = CommandsPackages.getPathsFromString(args["workspace:project"], config)
    const projects = Object.keys(paths).reverse()

    const pathsList = Object.values(paths)
    if(pathsList.length !== 0) {
      Logger.info(`Starting projects : ${projects.join(", ")}`)

      const terminal = new Terminal(projects)

      pathsList.forEach((path, index) => {
        const kiwiFile = KiwiFiles.get(path)

        // Callback
        const callback: SpawnCallback = (output, error) => {
          terminal.addStream(output, error, index, () => {
            // Output
            Logger.success(`Project ${projects[index]} finished`, (loggerOutput, loggerError) => {
              terminal.addStream(loggerOutput, loggerError)
            })
          })
        }

        // Custom command
        if(typeof kiwiFile.scripts !== "undefined" && typeof kiwiFile.scripts.start !== "undefined") {
          execute(kiwiFile.scripts.start.split(" "), callback, path)
        } else { // Default command
          CommandsPackages.start(path, callback)
        }
      })
    }

  },
})
