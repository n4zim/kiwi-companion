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

  static info(message: string, wrapper?: SpawnCallback) {
    this.log(chalk.blue(`[INFO] ${message}`), wrapper)
  }

  static success(message: string, wrapper?: SpawnCallback) {
    this.log(chalk.green(`[OK] ${message}`), wrapper)
  }

  static exit(message: string, wrapper?: SpawnCallback) {
    this.log(chalk.red(`[ERROR] ${message}`), wrapper, true)
    process.exit(1)
  }

}
