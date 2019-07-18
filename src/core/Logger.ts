import chalk from "chalk"
import { SpawnCallback } from "./execute"

export class Logger {

  private static log(message: string, wrapper?: SpawnCallback, error = false) {
    if(typeof wrapper !== "undefined") {
      wrapper(message, error)
    } else if(error) {
      process.stderr.write(message + "\n")
    } else {
      process.stdout.write(message + "\n")
    }
  }

  static infoString(message: string) {
    return chalk.blue(`[INFO] ${message}`)
  }

  static successString(message: string) {
    return chalk.green(`[OK] ${message}`)
  }

  static exitString(message: string) {
    return chalk.red(`[ERROR] ${message}`)
  }

  static info(message: string, wrapper?: SpawnCallback) {
    this.log(this.infoString(message), wrapper)
  }

  static success(message: string, wrapper?: SpawnCallback) {
    this.log(this.successString(message), wrapper)
  }

  static exit(message: string, wrapper?: SpawnCallback) {
    this.log(this.exitString(message), wrapper, true)
    process.exit(1)
  }

}
