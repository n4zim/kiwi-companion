import { spawn, ChildProcess, SpawnOptions } from "child_process"
import { Logger } from "./Logger"

export type SpawnCallback = (output: string|null, error: boolean) => void

export function execute(commands: string[] = [], callback?: SpawnCallback): ChildProcess {
  if(commands.length === 0) Logger.exit("Execute command is empty")

  let options: SpawnOptions = {}

  if(typeof callback === "undefined") {
    options.stdio = [ process.stdin, process.stdout, process.stderr ]
  }

  const command = spawn(commands[0], commands.slice(1), options)

  if(typeof callback !== "undefined") {
    // Out
    if(command.stdout !== null) {
      command.stdout.on("data", (data: any) => {
        callback(data.toString(), false)
      })
    }

    // Errors
    if(command.stderr !== null) {
      command.stderr.on("data", (data: any) => {
        callback(data.toString(), true)
      })
    }

    // Exit callback
    command.on("exit", () => {
      callback(null, false)
    })
  }

  return command
}
