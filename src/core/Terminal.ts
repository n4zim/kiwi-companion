
import readline from "readline"
import Table from "cli-table"
import chalk from "chalk"
import { Logger } from "./Logger"
import { TerminalLinesGenerator, splitTerminalLines } from "./TerminalLinesGenerator"

interface Stream {
  index: number
  text: string
  error: boolean
}

export class Terminal {
  private columns: string[]
  private generator: TerminalLinesGenerator
  private barCharsCount: number = 0
  private unseen: Stream[] = []
  private currentColumn = 0
  private previousLinesToRemove = 0
  private hasChanges = false
  private callbacks: (() => void)[] = []
  private finished = 0

  constructor(titles: string[]) {
    this.columns = [ "ALL", ...titles ]
    this.generator = new TerminalLinesGenerator(titles)

    // Inputs
    this.setRawMode(true)
    process.stdin.on("data", this.handleInput.bind(this))

    // Clear
    // process.stdout.write("\x1b[H\x1b[2J")

    // Update
    this.update()
  }

  addStream(index: number, text: string | null, error = false, callback?: () => void) {
    if(text === null) {
      if(typeof callback !== "undefined") {
        callback()
      }
      if(++this.finished === this.columns.length - 1) {
        process.stdin.pause()
        this.callbacks.forEach(finishCallback => {
          finishCallback()
        })
      }
    } else {
      const stream: Stream = { index, text, error }
      if(this.currentColumn === 0 || this.currentColumn === index + 1) { // ALL or current filter
        this.update([ stream ])
      } else { // Other filters
        this.unseen.push(stream)
        this.update()
      }
    }
  }

  addCallback(callback: () => void) {
    this.callbacks.push(callback)
  }

  private getTable() {
    return new Table({
      head: this.columns.map((column, columnIndex) => {
        // Current
        if(columnIndex === this.currentColumn) {
          return chalk.bgBlue(chalk.white(column))
        }

        // Not ALL
        if(columnIndex !== 0) {
          const unseen = this.unseen.filter(s => columnIndex === s.index + 1)
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
    if(typeof process.stdout.columns !== "undefined" && this.barCharsCount > process.stdout.columns) {
      Logger.exit(`Too small TTY, a minimum of ${this.barCharsCount} columns is needed`)
    }

    // Remove table if needed
    if(this.previousLinesToRemove !== 0) {
      readline.moveCursor(process.stdout, 0, -this.previousLinesToRemove)
      readline.clearScreenDown(process.stdout)
    }

    // Generate table
    const table = this.getTable()
    this.previousLinesToRemove = splitTerminalLines(table).length

    // Write
    streams.forEach(stream => {
      if(this.currentColumn === 0) { // ALL
        process.stdout.write(this.generator.getLine(stream.text, stream.index))
      } else { // Filter
        process.stdout.write(this.generator.getLine(stream.text))
      }
    })
    process.stdout.write(table + "\n")

    // Set changes state
    if(!this.hasChanges) {
      this.hasChanges = streams.length !== 0
    }
  }

  private updateCurrentStream() {
    // Clean only if outputs has been made
    if(this.hasChanges) this.previousLinesToRemove = 0
    this.hasChanges = false

    // Filter unseen streams
    const unseen: Stream[] = []
    this.unseen = this.unseen.reduce((streams, stream) => {
      if(this.currentColumn === 0 || stream.index + 1 === this.currentColumn) {
        unseen.push(stream)
      } else {
        streams.push(stream)
      }
      return streams
    }, [] as Stream[])

    // Get unseen outputs
    this.update(unseen)
  }

  private handleInput(chunk: any) {
    if(chunk[0] === 3 || chunk[0] === 17) {
      this.setRawMode(false)
      process.exit()
    } else if(chunk[0] === 27 && chunk[1] === 91) {
      if(chunk[2] === 67) { // Right
        if(this.currentColumn  !== this.columns.length - 1) {
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

  private setRawMode(mode: boolean) {
    if(typeof process.stdin.setRawMode !== "undefined") {
      process.stdin.setRawMode(mode)
    }
  }

}
