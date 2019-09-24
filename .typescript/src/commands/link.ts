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
    const config = ConfigsV1.get()
    const paths = CommandsPackages.getPathsFromString(args["workspace:project"], config)
    const projects = Object.keys(paths).reverse()

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

    const originsKeys =  Object.keys(linksOrigins)
    const linksKeys = Object.keys(links)
    let count = originsKeys.length + linksKeys.length

    const setLinks = () => linksKeys.forEach(link => {
      links[link].forEach(originLink => {
        CommandsPackages.linkPackage(paths[link], [ originLink ], (output, error) => {
          const index = projects.indexOf(link)
          terminal.addStream(output, error, index, () => {
            Logger.success(`Link for ${originLink} created in ${link}`, (loggerOutput, loggerError) => {
              terminal.addStream(loggerOutput, loggerError)
              if(--count === 0) {
                terminal.close()
              }
            })
          })
        })
      })
    })

    originsKeys.forEach(packageName => {
      const project = linksOrigins[packageName]
      const path = paths[project]
      const index = projects.indexOf(project)
      CommandsPackages.linkCreate(path, (output, error) => {
        terminal.addStream(output, error, index, () => {
          Logger.success(`Link for ${project} created`, (loggerOutput, loggerError) => {
            terminal.addStream(loggerOutput, loggerError)
            if(--count === linksKeys.length) {
              setLinks()
            }
          })
        })
      })
    })

  },
})
