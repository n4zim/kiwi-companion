import { join } from "path"
import { mkdir } from "fs"
import newCommand from "../../core/newCommand"
import Logger from "../../core/Logger"
import GitCommands from "../../core/GitCommands"
import { TerminalStream } from "../../core/TerminalStream"
import { Workspaces } from "../../recipes/KiwiBundle-workspaces"

interface Args {
  slug: string
}

newCommand<Args>(this, {
  command: "import [slug]",
  description: "Import a Workspace",
  builder: yargs => yargs.demandOption("slug"),
  handler: (args, path) => {
    if(!GitCommands.isGitInstalled) {
      Logger.exit("Git must be installed on your system")
    }

    const filters = `{"slug":"=${args.slug}"}`

    Workspaces.getOne(filters).then(workspace => {

      Logger.info(`Creating "${workspace.data.name}" directory...`)
      const workspaceDir = join(path, workspace.data.name)
      mkdir(workspaceDir, error => {
        if(error) Logger.exit(error.message)

        const terminal = new TerminalStream()
        workspace.data.repositories.forEach((repository, index) => {
          const name = repository.slug || repository.name
          terminal.addChannel(name)
          GitCommands.clone(repository, join(workspaceDir, name), terminal.getChannel(index))
        })
      })

    }).catch(output => {
      if(typeof output.error !== "undefined") {
        Logger.exit(output.error.message)
      }
    })

  },
})
