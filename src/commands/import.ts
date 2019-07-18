import { join } from "path"
import { mkdir } from "fs"
import { wrapper } from "../core/wrapper"
import { CommandsGit } from "../core/CommandsGit"
import { Logger } from "../core/Logger"
import { Workspaces } from "../recipes/KiwiBundle-workspaces"
import { Terminal } from "../core/Terminal"

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

        const titles = workspace.data.repositories.map(repository => repository.slug || repository.name)

        const terminal = new Terminal(titles)

        terminal.addCallback(() => {
          Logger.success(`Workspace ${workspace.data.name} imported`)
        })

        workspace.data.repositories.forEach((repository, index) => {
          CommandsGit.clone(repository, join(workspaceDir, titles[index]), (output, error) => {
            terminal.addStream(index, output, error, () => {
              Logger.success(`Repository ${repository.name} cloned`)
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
