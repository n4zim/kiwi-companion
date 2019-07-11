import fs from "fs"
import { homedir } from "os"
import { join, dirname } from "path"
import { packageJson } from ".."
import Logger from "./logger"
import forever from "forever-monitor"

export default class ProgramCommands {



  static startProcess(path: string): number {
    return 123
  }

  static killProcess(path: PathRepository): PathRepository {
    Logger.info(`Killing PID ${path.pid}`)
    if(typeof path.pid !== "undefined") {
      forever.kill(path.pid)
      delete path.pid
      return path
    }
    Logger.info(`PID ${path.pid} was not found, ignoring...`)
    return { type: PathType.REPOSITORY, workspaces: [] }
  }

  static start(path: string) {

  }

}
