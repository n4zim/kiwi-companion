import { RepositoryPath } from "./Configs.v1.types"
import { spawn, ChildProcess } from "child_process"
import Logger from "./Logger"
import ConfigsV1 from "./Configs.v1"
import { writeFileSync } from "fs";

export default class ProgramCommands {

  private static spawnBackground(commands: string[] = [], name: string): ChildProcess {
    if(commands.length === 0) Logger.exit("Start script is empty")
    return spawn(commands[0], commands.slice(1), {
      detached: true,
      stdio: [ "ignore", ConfigsV1.writeLogs(name), ConfigsV1.writeErrorsLogs(name) ],
    })
  }

  private static spawn(commands: string[] = []): ChildProcess {
    if(commands.length === 0) Logger.exit("Start script is empty")
    return spawn(commands[0], commands.slice(1), {
      stdio: [ process.stdin, process.stdout, process.stderr ]
    })
  }

  static start(path: RepositoryPath, commands: string[]): RepositoryPath {
    const script = this.spawn(commands)
    path.pid = script.pid
    return path
  }

  static startBackground(path: RepositoryPath, command: string, name: string): RepositoryPath {
    path = this.killBackground(path)
    const script = this.spawnBackground(command.split(" "), name)
    path.pid = script.pid
    script.unref()
    return path
  }

  static killBackground(path: RepositoryPath): RepositoryPath {
    if(typeof path.pid !== "undefined") {
      Logger.info(`Killing process ${path.pid}`)
      try {
        process.kill(path.pid)
      } catch(e) {
        Logger.info(`Error during process kill : ${e}`)
      }
      delete path.pid
    }
    return path
  }

}
