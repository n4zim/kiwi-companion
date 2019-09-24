import { wrapper } from "../../../core/wrapper"
import { CommandsPackages } from "../../../core/CommandsPackages"

interface Args {
  packages: string[]
  dev?: boolean
  optional?: boolean
}

wrapper<Args>(this, {
  command: "add [packages..]",
  description: "Add new package(s)",

  builder: yargs => {
    return yargs
      .demandOption("packages")
      .option("dev", {
        type: "boolean",
        alias: "D",
        describe: "Add to devDependencies",
      })
      .option("optional", {
        type: "boolean",
        alias: "O",
        describe: "Add to optionalDependencies",
      })
  },

  handler: (args, path) => {
    CommandsPackages.add(path, args.packages, args.dev, args.optional)
  },
})
