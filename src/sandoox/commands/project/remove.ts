import { wrapper } from "../../../core/wrapper"
import { CommandsPackages } from "../../../core/CommandsPackages"

interface Args {
  packages: string[]
  dev?: boolean
  optional?: boolean
}

wrapper<Args>(this, {
  command: "[slug] remove [packages..]",
  description: "Remove package(s)",
  handler: (args, path) => {
    CommandsPackages.remove(path, args.packages)
  },
})
