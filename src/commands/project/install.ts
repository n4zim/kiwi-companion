import newCommand from "../../core/newCommand"
import PackagesCommands from "../../core/PackagesCommands"

newCommand(this, {
  command: "install",
  description: "Install and update packages",
  handler: (args, path) => {
    PackagesCommands.install(path)
  },
})
