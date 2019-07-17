import wrapper from "../../../core/wrapper"
import CommandsPackages from "../../../core/CommandsPackages"

wrapper(this, {
  command: "install",
  description: "Install and update packages",
  handler: (args, path) => {
    CommandsPackages.install(path)
  },
})
