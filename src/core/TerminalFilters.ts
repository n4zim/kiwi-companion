
import readline from "readline"
import Table from "cli-table"
import chalk from "chalk"
import { Logger } from "../core/Logger"
import { TerminalMulti } from "./TerminalMulti"

interface Stream {
  filter: number
  text: string
  error: boolean
  displayed: boolean
}

export class TerminalFilters {
  private columns: string[]
  private columnsChars: number
  private streams: Stream[] = []
  private currentColumn = 0
  private multi: TerminalMulti
  private previousLinesToRemove = 0
  private currentLines = 0

  constructor(filters: string[]) {
    // Columns
    this.columns = [ "ALL", ...filters ]
    this.columnsChars = this.columns.join("   ").length + 4

    // Multi terminal for ALL
    this.multi = new TerminalMulti(filters)

    // Inputs
    if(typeof process.stdin.setRawMode !== "undefined") {
      process.stdin.setRawMode(true)
    }
    process.stdin.resume()
    process.stdin.on("data", this.handleChunks.bind(this))

    // Clear
    process.stdout.write("\x1b[H\x1b[2J")

    // Update
    this.update()
  }

  addToStream(filter: number, text: string, error = false) {
    const stream: Stream = { filter, text, error, displayed: false }
    const streamsToDisplay = []

    // ALL or current filter
    if(this.currentColumn === 0 || this.currentColumn === filter + 1) {
      stream.displayed = true
      streamsToDisplay.push(stream)
    }

    this.streams.push(stream)
    this.update(streamsToDisplay)
  }

  private getTable() {
    // process.stdout.write(JSON.stringify(this.streams) + "\n")
    return new Table({
      head: this.columns.map((column, columnIndex) => {
        // Current
        if(columnIndex === this.currentColumn) {
          return chalk.bgBlue(chalk.white(column))
        }

        // Not ALL
        if(columnIndex !== 0) {
          const unseen = this.streams.filter(s => !s.displayed && columnIndex === s.filter + 1)
          if(unseen.filter(s => s.error).length !== 0) { // Unseen errors
            return chalk.red(column)
          }
          if(unseen.length !== 0) { // Unseen new inputs
            return chalk.green(column)
          }
        }

        // Default color
        return chalk.white(column)
      }),
    }).toString()
  }

  private update(streams: Stream[] = []) {
    // No enough columns
    if(typeof process.stdout.columns !== "undefined" && this.columnsChars > process.stdout.columns) {
      Logger.exit(`Too small TTY, a minimum of ${this.columnsChars} columns is needed`)
    }

    // Remove table if needed
    if(this.previousLinesToRemove !== 0) {
      readline.moveCursor(process.stdout, 0, -this.previousLinesToRemove)
      readline.clearLine(process.stdout, 1)
    }

    // Add current lines
      this.currentLines++
    streams.forEach(stream => {
      if(this.currentColumn === 0) { // ALL
        process.stdout.write(this.multi.getLine(stream.text, stream.filter))
      } else { // Filter
        process.stdout.write(this.multi.getLine(stream.text))
      }
    })

    // Generate table
    const table = this.getTable()
    process.stdout.write(table + "\n")
    this.previousLinesToRemove = table.split(/\r\n|\r|\n/).length
  }

  private updateCurrentStream() {
    // Clean only if outputs has been made
    if(this.currentLines !== 0) this.previousLinesToRemove = 0
    this.currentLines = 0

    // Get unseen outputs
    this.update(this.streams.reduce((streams: Stream[], stream, index) => {
      if(!stream.displayed && (this.currentColumn === 0 || stream.filter + 1 === this.currentColumn)) {
        this.streams[index].displayed = true
        streams.push(stream)
      }
      return streams
    }, []))
  }

  private handleChunks(chunk: any) {
    if(chunk[0] === 3 || chunk[0] === 17) {
      if(typeof process.stdin.setRawMode !== "undefined") {
        process.stdin.setRawMode(false)
      }
      process.exit()
    } else if(chunk[0] === 27 && chunk[1] === 91) {
      if(chunk[2] === 67) { // Right
        if(this.currentColumn !== this.columns.length - 1) {
          this.currentColumn++
          this.updateCurrentStream()
        }
      } else if(chunk[2] === 68) { // Left
        if(this.currentColumn !== 0) {
          this.currentColumn--
          this.updateCurrentStream()
        }
      }
    }
  }

}
