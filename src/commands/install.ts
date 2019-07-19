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
  command: "install [workspace:project]",
  description: "Install and update packages",
  builder: yargs => yargs.demandOption("workspace:project"),
  handler: (args, currentPath) => {
    const split = args["workspace:project"].split(":")
    if(split.length > 2) {
      Logger.exit("Wrong selector format")
    }

    const config = ConfigsV1.get()

    const paths: { [project: string]: string } = {}

    // READ CONFIG
    if(split.length === 1) { // Workspace
      const projects = config.workspaces[split[0]]
      if(typeof projects === "undefined") {
        Logger.exit(`Unknown workspace "${split[0]}"`)
      }
      projects.forEach(projectName => {
        const project = `${split[0]}:${projectName}`
        const path = config.projects[project]
        if(typeof path === "undefined") {
          Logger.exit(`Unknown project "${project}"`)
        }
        if(CommandsPackages.detectPackageJson(path)) {
          paths[projectName] = path
        } else {
          Logger.info(`Skipping "${projectName}"`)
        }
      })
    } else { // Project
      const project = args["workspace:project"]
      const path = config.projects[project]
      if(typeof path === "undefined") {
        Logger.exit(`Unknown project "${project}"`)
      }
      if(CommandsPackages.detectPackageJson(path)) {
        paths[project] = path
      } else {
        Logger.exit(`Skipping "${project}"`)
      }
    }

    const projects = Object.keys(paths).reverse()

    // RUN INSTALLS
    const pathsList = Object.values(paths)
    if(pathsList.length !== 0) {
      const terminal = new Terminal(projects)

      pathsList.forEach((path, index) => {
        const kiwiFile = KiwiFiles.get(path)

        // Callback
        const callback: SpawnCallback = (output, error) => {
          terminal.addStream(output, error, index, () => {
            // Output
            Logger.success(`Project ${projects[index]} installed`, (loggerOutput, loggerError) => {
              terminal.addStream(loggerOutput, loggerError)
            })
          })
        }

        // Custom command
        if(typeof kiwiFile.scripts !== "undefined" && typeof kiwiFile.scripts.install !== "undefined") {
          execute(kiwiFile.scripts.install.split(" "), callback, path)
        } else { // Default command
          CommandsPackages.install(path, callback)
        }
      })
    }

  },
})
