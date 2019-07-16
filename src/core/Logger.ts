import chalk from "chalk"

class Logger {

  static info(message: string) {
    console.log(chalk.blue(`[INFO] ${message}`))
  }

  static success(message: string) {
    console.log(chalk.green(`[OK] ${message}`))
  }

  static exit(message: string) {
    console.error(chalk.red(`[ERROR] ${message}`))
    process.exit(1)
  }

}

export default Logger
