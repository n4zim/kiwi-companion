
import readline from "readline"
import Table from "cli-table"
import chalk from "chalk"
import Logger from "../core/Logger"
import { TerminalMulti } from "./TerminalMulti";

interface Stream {
  filter: number
  text: string
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
    this.checkColumnsCount()

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

  addToStream(filterIndex: number, text: string) {
    const stream: Stream = { filter: filterIndex, text, displayed: false }
    if(this.currentColumn === 0 || this.currentColumn === filterIndex + 1) { // ALL or current filter
      stream.displayed = true
      this.update([ stream ])
    }
    this.streams.push(stream)
  }

  private getLine(stream: Stream) {
    if(this.currentColumn === 0) { // ALL
      return this.multi.getLine(stream.text, stream.filter)
    }
    return this.multi.getLine(stream.text) // Another filter
  }

  private update(streams: Stream[] = []) {
    this.checkColumnsCount()

    if(this.previousLinesToRemove !== 0) {
      readline.moveCursor(process.stdout, 0, -this.previousLinesToRemove)
      readline.clearLine(process.stdout, 1)
    }

    streams.forEach(stream => {
      process.stdout.write(this.getLine(stream))
      this.currentLines++
    })

    const table = new Table({
      head: this.columns.map((project, current) => {
        if(current === this.currentColumn) return chalk.blue(project)
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

  private updateCurrentStream(previous: number) {
    // Clean only if outputs has been made
    if(this.currentLines !== 0) this.previousLinesToRemove = 0
    this.currentLines = 0

    // Get unseen outputs
    this.update(this.streams.reduce((streams: Stream[], stream, index) => {
      if(!stream.displayed && (this.currentColumn === 0 || stream.filter === this.currentColumn - 1)) {
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
          this.updateCurrentStream(this.currentColumn - 1)
        }
      } else if(chunk[2] === 68) { // Left
        if(this.currentColumn !== 0) {
          this.currentColumn--
          this.updateCurrentStream(this.currentColumn + 1)
        }
      }
    }
  }

  private clearAll(previous: number) {
    // Clear
    readline.cursorTo(process.stdout, 0, 0)
    readline.clearScreenDown(process.stdout)
    this.previousLinesToRemove = 0 // Cancel update clear

    // Old text
    if(this.currentColumn === 0) { // ALL
      this.update(this.streams)
    } else { // Active filter
      this.update(this.streams.filter(s => s.filter === this.currentColumn - 1))
    }
  }

}
