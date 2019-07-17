import newCommand from "../../../core/wrapper"
import PackagesCommands from "../../../core/CommandsPackages"

interface Args {
  packages: string[]
  dev?: boolean
  optional?: boolean
}

newCommand<Args>(this, {
  command: "[slug] remove [packages..]",
  description: "Remove package(s)",
  handler: (args, path) => {
    PackagesCommands.remove(path, args.packages)
  },
})
