import yargs from "yargs"

interface YargsModule<Args> {
  command: string
  description: string
  builder?: (yargs: yargs.Argv<Args>) => yargs.Argv<Args>
  handler: (args: Args, path: string) => void
}

export default function newCommand<Args>(module: any, options: YargsModule<Args>) {

  module.command = options.command
  module.desc = options.description

  if(typeof options.builder !== "undefined") {
    module.builder = options.builder
  }

  module.handler = (argv: Args & { _handled: boolean }) => {
    const path = process.cwd()
    options.handler(argv, path)
    argv._handled = true
  }

}
