
import readline from "readline"
import Table from "cli-table"
import chalk from "chalk"
import { Logger } from "./Logger"
import { TerminalLinesGenerator, splitTerminalLines } from "./TerminalLinesGenerator"

interface Stream {
  text: string
  error: boolean
}

interface IndexStream extends Stream {
  index: number
}

export class Terminal {
  private columns: string[]
  private generator: TerminalLinesGenerator
  private barCharsCount = 0
  private currentColumn = 0
  private previousLinesToRemove = 0
  private hasChanges = false
  private unseen: IndexStream[] = []
  private callbacks: (() => void)[] = []
  private finished = 0

  constructor(titles: string[]) {
    this.columns = [ "ALL", ...titles ]
    this.generator = new TerminalLinesGenerator(titles)
    this.barCharsCount = this.columns.join("   ").length + 4

    // Inputs
    this.setRawMode(true)
    process.stdin.on("data", this.handleInput.bind(this))

    // Clear
    // process.stdout.write("\x1b[H\x1b[2J")

    // Update
    this.update()
  }

  addStream(text: string | null, error = false, index?: number, callback?: () => void) {
    if(text === null) {
      this.currentColumn = 0
      if(typeof callback !== "undefined") {
        callback()
      }
      if(++this.finished === this.columns.length - 1) {
        process.stdin.pause()
        if(this.callbacks.length !== 0) {
          this.callbacks.forEach(finishCallback => {
            finishCallback()
          })
          this.clearTable()
        }
      }
    } else if(typeof index === "undefined") {
      this.update([], [ { text, error } ])
    } else {
      const stream: IndexStream = { index, text, error }
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

  private clearTable() {
    if(this.previousLinesToRemove !== 0) {
      readline.moveCursor(process.stdout, 0, -this.previousLinesToRemove)
      readline.clearScreenDown(process.stdout)
    }
  }

  private update(streams: IndexStream[] = [], externalStreams: Stream[] = []) {
    // No enough columns
    if(typeof process.stdout.columns !== "undefined" && this.barCharsCount > process.stdout.columns) {
      Logger.exit(`Too small TTY, a minimum of ${this.barCharsCount} columns is needed`)
    }

    // Remove table if needed
    this.clearTable()

    // Write streams
    streams.forEach(stream => {
      if(this.currentColumn === 0) { // ALL
        process.stdout.write(this.generator.getLine(stream.text, stream.index))
      } else { // Filter
        process.stdout.write(this.generator.getLine(stream.text))
      }
    })

    // Write external streams
    externalStreams.forEach(stream => {
      process.stdout.write(this.generator.getLine(stream.text))
    })

    // Generate table
    const table = this.getTable()
    this.previousLinesToRemove = splitTerminalLines(table).length
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
    const unseen: IndexStream[] = []
    this.unseen = this.unseen.reduce((streams, stream) => {
      if(this.currentColumn === 0 || stream.index + 1 === this.currentColumn) {
        unseen.push(stream)
      } else {
        streams.push(stream)
      }
      return streams
    }, [] as IndexStream[])

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
