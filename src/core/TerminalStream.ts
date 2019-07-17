import { SpawnCallback } from "./execute"
import { TerminalMulti } from "./TerminalMulti"

export class TerminalStream {
	private multi = new TerminalMulti()
	private totalChannels = 0
	private callbacks: (() => void)[] = []
	private totalCompleted = 0

	addChannel(name: string, callback?: () => void) {
		if(typeof callback !== "undefined") {
			this.callbacks.push(callback)
		}
		this.multi.addTitle(name)
		this.totalChannels++
	}

	addCallback(callback: () => void) {
		this.callbacks.push(callback)
	}

	getChannel(index: number): SpawnCallback {
		return (error, data) => {
			if(data !== null) {
				data.split("\n").forEach(line => {
					process.stdout.write(this.multi.getLine(line, index))
				})
			} else if(++this.totalCompleted === this.totalChannels) {
				this.callbacks.forEach(callback => {
					callback()
				})
			}
		}
	}

}
