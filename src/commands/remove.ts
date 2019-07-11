import newCommand from "../core/newCommand"
import PackagesCommands from "../core/PackagesCommands"

interface Args {
  packages: string[]
  dev?: boolean
  optional?: boolean
}

newCommand<Args>(this, {
  command: "remove [packages..]",
  description: "Remove package(s)",
  handler: args => {
    PackagesCommands.remove(args.packages)
  },
})
