import newCommand from "../core/newCommand"
import readline from "readline"
import Table from "cli-table"
import chalk from "chalk"
import Logger from "../core/Logger";

let previousTableLines = 0

const projects = [ "ALL", "recipes-ts", "api", "ui", "kiwi", "cli", "kiwi-cli" ]
const totalChars = projects.join("---").length + 4

const write = (index: number, text?: string) => {
  if(typeof process.stdout.columns !== "undefined" && totalChars > process.stdout.columns) {
    Logger.exit(`Too small TTY, a minimum of ${totalChars} columns is required`)
  }

  if(previousTableLines !== 0) {
    readline.moveCursor(process.stdout, 0, -previousTableLines)
    readline.clearLine(process.stdout, 1)
  } else {
    process.stdout.write("\x1b[H\x1b[2J")
  }

  if(typeof text !== "undefined") {
    process.stdout.write(text)
  }

  const table = new Table({
    head: projects.map((project, current) => {
      if(current === index) return chalk.blue(project)
      return chalk.white(project)
    }),
  }).toString()

  process.stdout.write(table + "\n")
  previousTableLines = table.split(/\r\n|\r|\n/).length
}

newCommand(this, {
  command: "start",
  description: "DEBUG",
  handler: (args, path) => {

    let index = 0
    let count = 0

    write(index)
    setInterval(() => {
      write(index, count++ + "\n")
    }, 1000)

    if(typeof process.stdin.setRawMode !== "undefined") {
      process.stdin.setRawMode(true)
    }

    process.stdin.resume()

    process.stdin.on("data", chunk => {
      if(chunk[0] === 3 || chunk[0] === 17) {
        if(typeof process.stdin.setRawMode !== "undefined") {
          process.stdin.setRawMode(false)
        }
        process.exit()
      } else if(chunk[0] === 27 && chunk[1] === 91) {
        if(chunk[2] === 67) { // Right
          if(index === projects.length - 1) {
            index = 0
            write(index)
          } else {
            write(++index)
          }
        } else if(chunk[2] === 68) { // Left
          if(index === 0) {
            index = projects.length - 1
            write(index)
          } else {
            write(--index)
          }
        }
      }
    })

  },
})
