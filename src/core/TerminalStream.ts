import chalk from "chalk"
import { SpawnCallback } from "./ProgramCommands"

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

interface TerminalMulti {
  name: string
  commands: string[]
}

export class TerminalStream {
	private channels: string[] = []
	private maxNameLength = 0

	addChannel(name: string) {
		this.channels.push(name)
		if(name.length > this.maxNameLength) {
			this.maxNameLength = name.length
		}
	}

	getChannel(index: number): SpawnCallback {
		const channel = this.channels[index]
		const color = COLORS[index % COLORS.length]
		return (error, data) => {

			// Title
			let title = `${channel}`
			if(channel.length < this.maxNameLength) {
				title += " ".repeat(this.maxNameLength - channel.length)
			}
			title = `${color(`${title} |`)} `

			// Output
			const output = data.split("\n")
			output.forEach(line => {
				process.stdout.write(title + chalk(line) + "\n")
			})
		}
	}

}
