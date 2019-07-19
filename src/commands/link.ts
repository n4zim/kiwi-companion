import { wrapper } from "../core/wrapper"
import { CommandsPackages } from "../core/CommandsPackages"
import { Logger } from "../core/Logger"
import { ConfigsV1 } from "../core/Configs.v1"
import { Terminal } from "../core/Terminal"

interface Args {
  "workspace:project": string
}

wrapper<Args>(this, {
  command: "link [workspace:project]",
  description: "Link packages",
  builder: yargs => yargs.demandOption("workspace:project"),
  handler: (args, currentPath) => {
    const split = args["workspace:project"].split(":")
    if(split.length > 2) {
      Logger.exit("Wrong selector format")
    }

    const config = ConfigsV1.get()

    const paths: { [project: string]: string } = {}

    // READ CONFIg
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


    // GETTING JSON PACKAGES
    let projectPackagesNames: { [packageName: string]: string } = {}
    const dependencies = projects.map(project => {
      const packageJson = CommandsPackages.get(paths[project])
      projectPackagesNames[project] = packageJson.name
      let dependencies: string[] = []
      if(typeof packageJson.dependencies !== "undefined") {
        dependencies = Object.keys(packageJson.dependencies)
      }
      if(typeof packageJson.devDependencies !== "undefined") {
        dependencies = dependencies.concat(Object.keys(packageJson.devDependencies))
      }
      if(typeof packageJson.optionalDependencies !== "undefined") {
        dependencies = dependencies.concat(Object.keys(packageJson.optionalDependencies))
      }
      return dependencies
    }, [] as string[][])



    // PREPARE LINKS
    const linksOrigins: { [packageName: string]: string } = {}
    const links: { [project: string]: string[] } = {}
    dependencies.forEach((packages, index) => {
      const project = projects[index]
      projects.forEach(currentProject => {
        if(currentProject !== project) {
          const currentPackage = projectPackagesNames[currentProject]
          if(packages.indexOf(currentPackage) !== -1) {
            if(typeof linksOrigins[currentPackage] === "undefined") {
              linksOrigins[currentPackage] = currentProject
            }
            if(typeof links[project] === "undefined") {
              links[project] = []
            }
            links[project].push(currentPackage)
          }
        }
      })
    })

    const terminal = new Terminal(projects)
    terminal.enableManualClose()

    // RUN CREATE LINKS
    Object.keys(linksOrigins).forEach(packageName => {
      const project = linksOrigins[packageName]
      const path = paths[project]
      const index = projects.indexOf(project)
      console.log(project, path, index)
      CommandsPackages.linkCreate(path, (output, error) => {
        terminal.addStream(output, error, index, () => {
          Logger.success(`Link for ${project} created`, (loggerOutput, loggerError) => {
            terminal.addStream(loggerOutput, loggerError)
          })
        })
      })
    })

    // RUN INSTALLS
    /*const pathsList = Object.values(paths)
    if(pathsList.length !== 0) {
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
    }*/

  },
})
