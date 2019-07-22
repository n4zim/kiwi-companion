import { join } from "path"
import { mkdir } from "fs"
import { wrapper } from "../core/wrapper"
import { CommandsGit } from "../core/CommandsGit"
import { Logger } from "../core/Logger"
import { Workspaces } from "../recipes/KiwiBundle-workspaces"
import { Terminal } from "../core/Terminal"
import { ConfigsV1 } from "../core/Configs.v1"

interface Args {
  workspace: string
}

wrapper<Args>(this, {
  command: "import [workspace]",
  description: "Import a Workspace from Kiwi Recipes",
  builder: yargs => yargs.demandOption("workspace"),
  handler: (args, path) => {
    CommandsGit.checkIfAvailable()

    Workspaces.getOne({ f: `{"slug":"=${args.workspace}"}` }).then(workspace => {

      Logger.info(`Creating "${workspace.data.name}" directory...`)
      const workspaceDir = join(path, workspace.data.name)
      mkdir(workspaceDir, error => {
        if(error) Logger.exit(error.message)

        // Get config
        const config = ConfigsV1.get()

        const titles = workspace.data.repositories.map(repository => repository.slug)
        const terminal = new Terminal(titles, () => {
          // Update config
          ConfigsV1.set(config)

          // Adding VSCode workspaces
          ConfigsV1.addVSCodeWorkspace(workspace.data.name, config)

          // Final output
          return Logger.successString(`Workspace ${workspace.data.name} imported`)
        })

        // Commands
        workspace.data.repositories.forEach((repository, index) => {
          const title = titles[index]
          const dir = join(workspaceDir, title)
          CommandsGit.clone(repository, dir, (output, error) => {
            terminal.addStream(output, error, index, () => {
              config.projects[`${workspace.data.slug}:${title}`] = {
                name: repository.displayName,
                path: dir,
              }
              if(typeof config.workspaces[workspace.data.slug] === "undefined") {
                config.workspaces[workspace.data.slug] = [ title ]
              } else if(config.workspaces[workspace.data.slug].indexOf(title) === -1) {
                config.workspaces[workspace.data.slug].push(title)
              }
              Logger.success(`Repository ${repository.name} cloned`, (loggerOutput, loggerError) => {
                terminal.addStream(loggerOutput, loggerError)
              })
            })
          })
        })
      })

    }).catch(output => {
      if(typeof output.error !== "undefined") {
        Logger.exit(output.error.message)
      }
    })

  },
})
