import { join } from "path"
import newCommand from "../core/newCommand"
import Logger from "../core/Logger"
import GitCommands from "../core/GitCommands"
import { TerminalStream } from "../core/TerminalStream"
import { Workspaces } from "../recipes/KiwiBundle-workspaces"

interface Args {
  workspace: string
}

newCommand<Args>(this, {
  command: "import [workspace]",
  description: "Import a Workspace",
  builder: yargs => yargs.demandOption("workspace"),
  handler: (args, path) => {
    if(!GitCommands.isGitInstalled) {
      Logger.exit("Git must be installed on your system")
    }

    const filters = `{"slug":"=${args.workspace}"}`

    Workspaces.getOne(filters).then(workspace => {

      // Logger.info(`Creating "${workspace.data.name}" directory...`)
      const workspaceDir = join(path, workspace.data.name)
      /*mkdir(workspaceDir, error => {
        if(error) Logger.exit(error.message)*/

        const terminal = new TerminalStream()
        workspace.data.repositories.forEach((repository, index) => {
          terminal.addChannel(repository.name)
          GitCommands.clone(repository, join(workspaceDir, repository.name), terminal.getChannel(index))
        })

      // })

    }).catch(output => {
      if(typeof output.error !== "undefined") {
        Logger.exit(output.error.message)
      }
    })

  },
})
