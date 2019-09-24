import Table from "cli-table"
import chalk from "chalk"
import { wrapper } from "../../../core/wrapper"

wrapper(this, {
  command: "[slug] status",
  description: "Current project status",
  handler: (args, path) => {
    const table = new Table({ head: [ "Name", "Version", "Enhancements", "Server" ] })
    const projects = [
      [ "DROP'in UI", "1.0.0", [ "test1", "test2" ], chalk.green("Started on port 8042") ]
    ]
    table.push(...projects)
    console.log(table.toString())
  },
})
