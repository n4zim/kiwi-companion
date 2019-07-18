import { join } from "path"
import { mkdir } from "fs"
import { wrapper } from "../../core/wrapper"
import { CommandsGit } from "../../core/CommandsGit"
import { Logger } from "../../core/Logger"
import { Workspaces } from "../../recipes/KiwiBundle-workspaces"
import { TerminalStream } from "../core/TerminalStream"

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

        const terminal = new TerminalStream()

        terminal.addCallback(() => {
          Logger.success(`Workspace ${workspace.data.name} imported`)
        })

        workspace.data.repositories.forEach((repository, index) => {
          const name = repository.slug || repository.name
          terminal.addChannel(name)
          // CommandsGit.clone(repository, join(workspaceDir, name), terminal.getChannel(index))
        })
      })

    }).catch(output => {
      if(typeof output.error !== "undefined") {
        Logger.exit(output.error.message)
      }
    })

  },
})
