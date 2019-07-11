import newCommand from "../core/newCommand"
import PackagesCommands from "../core/PackagesCommands"

interface Args {
  packages: string[]
  dev?: boolean
  optional?: boolean
}

newCommand<Args>(this, {
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

  handler: args => {
    PackagesCommands.add(args.packages, args.dev, args.optional)
  },
})
