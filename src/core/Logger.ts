import chalk from "chalk"

class Logger {

  static info(message: string) {
    console.error(chalk.blue(`[INFO] ${message}`))
  }

  static exit(message: string) {
    console.error(chalk.red(`[ERROR] ${message}`))
    process.exit(1)
  }

}

export default Logger
