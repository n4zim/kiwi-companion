
import readline from "readline"
import Table from "cli-table"
import chalk from "chalk"
import Logger from "../core/Logger"

export class TerminalFilters {
  private columns: string[]
  private columnsChars: number
  private currentColumn = 0
  private previousLinesToRemove = 0
  private streams: { filter: number, text: string }[] = []

  constructor(filters: string[]) {
    this.columns = [ "ALL", ...filters ]

    this.columnsChars = this.columns.join("---").length + 4
    this.checkColumnsCount()

    if(typeof process.stdin.setRawMode !== "undefined") {
      process.stdin.setRawMode(true)
    }

    process.stdin.resume()

    process.stdin.on("data", this.handleChunks.bind(this))

    process.stdout.write("\x1b[H\x1b[2J") // Clear

    this.update()
  }

  addToStream(filterIndex: number, text: string) {
    this.streams.push({ filter: filterIndex, text })
    if(this.currentColumn === 0 || this.currentColumn === filterIndex + 1) { // ALL or current filter
      this.update(text)
    }
  }

  private update(text?: string | string[]) {
    this.checkColumnsCount()

    if(this.previousLinesToRemove !== 0) {
      readline.moveCursor(process.stdout, 0, -this.previousLinesToRemove)
      readline.clearLine(process.stdout, 0)
    }

    if(typeof text !== "undefined") {
      if(Array.isArray(text)) {
        text.forEach(currentText => {
          process.stdout.write(currentText + "\n")
        })
      } else {
        process.stdout.write(text + "\n")
      }
    }

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
    // Current lines
    let linesToClean = this.previousLinesToRemove
    if(previous === 0) { // Was previously at ALL
      linesToClean += this.streams.length
    } else { // Was previously a filter
      linesToClean += this.streams.filter(s => s.filter === previous - 1).length
    }

    // Clear
    readline.clearLine(process.stdout, 0) // Current line
    for(let line = linesToClean - 1; line >= 0; line--) {
      readline.moveCursor(process.stdout, 0, -1)
      readline.clearLine(process.stdout, 0) // Previous lines
    }

    // Cancel update clear
    this.previousLinesToRemove = 0

    // New text
    if(this.currentColumn === 0) { // ALL
      this.update(this.streams.map(s => s.text))
    } else { // Active filter
      this.update(this.streams.filter(s => s.filter === this.currentColumn - 1).map(s => s.text))
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

}
