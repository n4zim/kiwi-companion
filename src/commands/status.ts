import newCommand from "../core/newCommand"
import Table from "cli-table"
import chalk from "chalk"

newCommand(this, {
  command: "status",
  description: "Current project(s) statuses",
  handler: (args, path) => {
    const table = new Table({ head: [ "Name", "Version", "Enhancements", "Server" ] })
    const projects = [
      [ "DROP'in UI", "1.0.0", [ "test1", "test2" ], chalk.green("Started on port 8042") ]
    ]
    table.push(...projects)
    console.log(table.toString())
  },
})
