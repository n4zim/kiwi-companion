import { RepositoryPath } from "./Configs.v1.types"
import { spawn, ChildProcess } from "child_process"
import Logger from "./Logger"
import ConfigsV1 from "./Configs.v1"

export default class ProgramCommands {

  private static spawn(commands: string[] = [], name: string): ChildProcess {
    if(commands.length === 0) Logger.exit("Start script is empty")
    return spawn(commands[0], commands.slice(1), {
      detached: true,
      stdio: [ "ignore", ConfigsV1.writeLogs(name), ConfigsV1.writeErrorsLogs(name) ],
    })
  }

  static start(path: RepositoryPath, command: string, name: string): RepositoryPath {
    path = this.kill(path)
    path.pid = this.spawn(command.split(" "), name).pid
    return path
  }

  static kill(path: RepositoryPath): RepositoryPath {
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
