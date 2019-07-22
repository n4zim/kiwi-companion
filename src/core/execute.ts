import { spawn, ChildProcess, SpawnOptions } from "child_process"
import { Logger } from "./Logger"

export type SpawnCallback = (output: string|null, error: boolean) => void

// TODO : Format errors for commands

export function execute(commands: string[] = [], callback?: SpawnCallback, dir?: string): ChildProcess {
  if(commands.length === 0) Logger.exit("Execute command is empty")

  let options: SpawnOptions = {}

  if(commands[0] === "git") {
    options.env = {
      GIT_SSH_COMMAND: "ssh -o StrictHostKeyChecking=no",
    }
  }

  if(typeof callback === "undefined") {
    options.stdio = [ process.stdin, process.stdout, process.stderr ]
  }

  if(typeof dir !== "undefined") {
    options.cwd = dir
  }

  const command = spawn(commands[0], commands.slice(1), options)

  if(typeof callback !== "undefined") {
    // Standard output
    if(command.stdout !== null) {
      command.stdout.on("data", (data: any) => {
        callback(data.toString(), false)
      })
      command.stdout.on("error", (data: any) => {
        callback(data.toString(), true)
      })
    }

    // Errors output
    if(command.stderr !== null) {
      command.stderr.on("data", (data: any) => {
        callback(data.toString(), false)
      })
      command.stderr.on("error", (data: any) => {
        callback(data.toString(), true)
      })
    }

    // Exit callback
    command.on("close", () => {
      callback(null, false)
    })
  }

  return command
}
