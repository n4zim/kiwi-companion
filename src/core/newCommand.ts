import yargs = require("yargs")

interface YargsModule<Args> {
  command: string
  description: string
  builder?: (yargs: yargs.Argv<Args>) => yargs.Argv<Args>
  handler: (args: Args) => void
}

export default function newCommand<Args>(module: any, options: YargsModule<Args>) {

  module.command = options.command
  module.desc = options.description

  if(typeof options.builder !== "undefined") {
    module.builder = options.builder
  }

  module.handler = (argv: Args & { _handled: boolean }) => {
    options.handler(argv)
    argv._handled = true
  }

}
