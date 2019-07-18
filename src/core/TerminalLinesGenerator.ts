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

export const splitTerminalLines = (text: string) => text.split(/\r\n|\r|\n/)

export class TerminalLinesGenerator {
  private maxTitleLength: number
  private titles: string[] = []

  constructor(titles: string[] = []) {
    // Max length
    this.maxTitleLength = titles.reduce((max, title) => {
      if(title.length > max) return title.length
      return max
    }, 0)

    // Titles
    titles.forEach(title => {
      this.addTitle(title)
    })
  }

  private addTitle(title: string) {
    let whiteSpaces = ""
    if(title.length < this.maxTitleLength) {
      whiteSpaces += " ".repeat(this.maxTitleLength - title.length)
    }

		const color = COLORS[this.titles.length % COLORS.length]

    this.titles.push(`${color(`${whiteSpaces}${title} |`)} `)
  }

  getLine(text: string, index?: number) {
    if(typeof index === "undefined") return chalk(text) + "\n"
    return splitTerminalLines(text).map(line => {
      return this.titles[index] + chalk(line) + "\n"
    }).join("")
  }

}
