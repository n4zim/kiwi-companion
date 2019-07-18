import chalk from "chalk"

export class Logger {

  static info(message: string) {
    process.stdout.write(chalk.blue(`[INFO] ${message}`) + "\n")
  }

  static success(message: string) {
    process.stdout.write(chalk.green(`[OK] ${message}`) + "\n")
  }

  static exit(message: string) {
    process.stderr.write(chalk.red(`[ERROR] ${message}`) + "\n")
    process.exit(1)
  }

}
