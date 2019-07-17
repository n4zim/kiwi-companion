import chalk from "chalk"

const COLORS = [
	chalk.red,
	chalk.green,
	chalk.yellow,
	chalk.blue,
	chalk.magenta,
	chalk.cyan,
	chalk.redBright,
	chalk.greenBright,
	chalk.yellowBright,
	chalk.blueBright,
	chalk.magentaBright,
	chalk.cyanBright,
	chalk.white,
]

export class TerminalMulti {
  private titles: string[] = []
  private maxTitleLength = 0

  constructor(titles: string[] = []) {
    titles.forEach(title => {
      this.addTitle(title)
    })
  }

  addTitle(title: string) {
    if(title.length > this.maxTitleLength) {
      this.maxTitleLength = title.length
    }

    let whiteSpaces = ""
    if(title.length < this.maxTitleLength) {
      whiteSpaces += " ".repeat(this.maxTitleLength - title.length)
    }

		const color = COLORS[this.titles.length % COLORS.length]

    this.titles.push(`${color(`${whiteSpaces}${title} |`)} `)
  }

  getLine(text: string, index?: number) {
    if(typeof index === "undefined") return chalk(text) + "\n"
    return this.titles[index] + chalk(text) + "\n"
  }

}
