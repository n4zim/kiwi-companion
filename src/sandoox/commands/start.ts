import { wrapper } from "../../core/wrapper"
import { Terminal } from "../../core/Terminal";

wrapper(this, {
  command: "start",
  description: "DEBUG",
  handler: (args, path) => {

    /*const projects = [ "recipes-ts", "api", "ui", "kiwi", "cli", "kiwi-cli" ]

    const terminal = new Terminal(projects)

    let counts = [ 0, 0, 0, 0, 0, 0 ]
    setInterval(() => {
      projects.forEach((project, index) => {
        terminal.addStream(index, ""+counts[index]++)
      })
    }, 2000)*/

  },
})
