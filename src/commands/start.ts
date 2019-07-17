import newCommand from "../core/newCommand"
import { TerminalFilters } from "../core/TerminalFilters";

newCommand(this, {
  command: "start",
  description: "DEBUG",
  handler: (args, path) => {

    const projects = [ "recipes-ts", "api", "ui", "kiwi", "cli", "kiwi-cli" ]

    const terminal = new TerminalFilters(projects)

    let counts = [ 0, 0, 0, 0, 0, 0 ]
    setInterval(() => {
      projects.forEach((project, index) => {
        terminal.addToStream(index, project + "\t" + counts[index]++)
      })
    }, 1000)

  },
})
