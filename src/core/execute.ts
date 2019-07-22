import { spawn, ChildProcess, SpawnOptions } from "child_process"
import { Logger } from "./Logger"
import { appendFileSync } from "fs";

export type SpawnCallback = (output: string|null, error: boolean) => void

// TODO : Format errors for commands

const dataToString = (data: string) => data.toString().replace(/\033c/g, "")

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
      command.stdout.on("data", (data: string) => {
        // appendFileSync("/tmp/out.txt", data.toString())
        callback(dataToString(data), false)
      })
      command.stdout.on("error", (data: string) => {
        callback(dataToString(data), true)
      })
    }

    // Errors output
    if(command.stderr !== null) {
      command.stderr.on("data", (data: string) => {
        callback(dataToString(data), false)
      })
      command.stderr.on("error", (data: string) => {
        callback(dataToString(data), true)
      })
    }

    // Exit callback
    command.on("close", () => {
      callback(null, false)
    })
  }

  return command
}
