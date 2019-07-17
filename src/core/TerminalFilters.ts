
import readline from "readline"
import Table from "cli-table"
import chalk from "chalk"
import Logger from "../core/Logger"

export class TerminalFilters {
  private columns: string[]
  private columnsChars: number
  private currentFilter = 0
  private previousLinesToRemove = 0
  private streams: { filter: number, data: string | number }[] = []

  constructor(filters: string[]) {
    this.columns = [ "ALL", ...filters ]

    this.columnsChars = this.columns.join("---").length + 4
    this.checkColumnsCount()

    if(typeof process.stdin.setRawMode !== "undefined") {
      process.stdin.setRawMode(true)
    }

    process.stdin.resume()

    process.stdin.on("data", this.handleChunks.bind(this))

    this.update()
  }

  addToStream(index: number, text: string | number) {
    this.streams.push({ filter: index, data: text })
    this.update()
  }

  private update(text?: string | number) {
    this.checkColumnsCount()

    if(this.previousLinesToRemove !== 0) {
      readline.moveCursor(process.stdout, 0, -this.previousLinesToRemove)
      readline.clearLine(process.stdout, 1)
    } else {
      process.stdout.write("\x1b[H\x1b[2J")
    }

    if(typeof text !== "undefined") {
      process.stdout.write(text + "\n")
    }

    const table = new Table({
      head: this.columns.map((project, current) => {
        if(current === this.currentFilter) return chalk.blue(project)
        return chalk.white(project)
      }),
    }).toString()

    process.stdout.write(table + "\n")
    this.previousLinesToRemove = table.split(/\r\n|\r|\n/).length
  }

  private checkColumnsCount() {
    if(typeof process.stdout.columns !== "undefined" && this.columnsChars > process.stdout.columns) {
      Logger.exit(`Too small TTY, a minimum of ${this.columnsChars} columns is required`)
    }
  }

  private handleChunks(chunk: any) {
    if(chunk[0] === 3 || chunk[0] === 17) {
      if(typeof process.stdin.setRawMode !== "undefined") {
        process.stdin.setRawMode(false)
      }
      process.exit()
    } else if(chunk[0] === 27 && chunk[1] === 91) {
      if(chunk[2] === 67) { // Right
        if(this.currentFilter === this.columns.length - 1) {
          this.currentFilter = 0
        } else {
          this.currentFilter++
        }
        this.update()
      } else if(chunk[2] === 68) { // Left
        if(this.currentFilter === 0) {
          this.currentFilter = this.columns.length - 1
        } else {
          this.currentFilter--
        }
        this.update()
      }
    }
  }

}
