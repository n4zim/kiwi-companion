
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
  private callback?: () => string
  private currentColumn = 0
  private previousLinesToRemove = 0
  private hasChanges = false
  private unseen: IndexStream[] = []
  private globalLines: Stream[] = []
  private finished: number[] = []
  private previousError: { [index: string]: boolean } = {}

  constructor(titles: string[], callback?: () => string) {
    this.columns = [ "ALL", ...titles ]
    this.generator = new TerminalLinesGenerator(titles)
    this.barCharsCount = this.columns.join("   ").length + 4
    this.callback = callback

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
      // Add index to finished
      if(typeof index !== "undefined") {
        this.finished.push(index)
      }

      // Callback if present
      if(typeof callback !== "undefined") {
        callback()
      }

      // Final callback
      if(Object.values(this.finished).length + 1 === this.columns.length) {
        if(typeof this.callback !== "undefined") {
          this.globalLines.push({ text: this.callback(), error: false })
        }
        this.writeGlobalLines()
        process.stdin.pause()
      }
    } else if(typeof index === "undefined") {
      this.globalLines.push({ text, error })
      this.update()
    } else {
      const stream: IndexStream = { index, text, error }
      this.previousError[index] = error
      if(this.currentColumn === 0 || this.currentColumn === index + 1) { // ALL or current filter
        this.update([ stream ])
      } else { // Other filters
        this.unseen.push(stream)
        this.update()
      }
    }
  }

  private getTable() {
    return new Table({
      head: this.columns.map((column, columnIndex) => {
        // Current
        if(columnIndex === this.currentColumn) {
          column = chalk.bold(column)
        }

        // Not ALL
        if(columnIndex !== 0) {
          const index = columnIndex - 1



        // Finished
        if(this.finished.indexOf(index) !== -1) {
          // Error
          if(this.previousError[index]) {
            return chalk.bgRed(chalk.white(column))
          }
          // No error
          return chalk.bgGreen(chalk.white(column))
        } else {
          const unseen = this.unseen.filter(s => s.index === index)
          if(unseen.length !== 0) {
            // Has errors
            if(unseen.filter(s => s.error).length !== 0) {
              return chalk.red(column)
            }
            // No errors
            return chalk.green(column)
          }
        }




          /*// Finished
          if(this.finished.indexOf(index) !== -1) {
            return chalk.bgBlue(chalk.white(column))
          }
          // Unseen
          const unseen = this.unseen.filter(s => s.index === index)
          if(unseen.length !== 0) {
            return chalk.blue(column)
          }*/
        }

        // Default color
        return chalk.white(column)
      }),
    }).toString()
  }

  private writeGlobalLines() {
    this.globalLines.forEach(stream => {
      process.stdout.write(this.generator.getLine(stream.text))
    })
  }

  private update(streams: IndexStream[] = [], writeGlobals = false) {
    // No enough columns
    if(typeof process.stdout.columns !== "undefined" && this.barCharsCount > process.stdout.columns) {
      Logger.exit(`Too small TTY, a minimum of ${this.barCharsCount} columns is needed`)
    }

    // Remove table if needed
    if(this.previousLinesToRemove !== 0) {
      readline.moveCursor(process.stdout, 0, -this.previousLinesToRemove)
      readline.clearScreenDown(process.stdout)
    }

    // Write streams
    streams.forEach(stream => {
      if(this.currentColumn === 0) { // ALL
        process.stdout.write(this.generator.getLine(stream.text, stream.index))
      } else { // Filter
        process.stdout.write(this.generator.getLine(stream.text))
      }
    })

    // Write global lines
    if(writeGlobals) {
      this.writeGlobalLines()
    }

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
    let writeGlobals = this.currentColumn === 0

    // Clean only if outputs has been made
    if(this.hasChanges) {
      this.previousLinesToRemove = 0
      // writeGlobals = true
    }
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
    this.update(unseen, writeGlobals)

    // Reset
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
