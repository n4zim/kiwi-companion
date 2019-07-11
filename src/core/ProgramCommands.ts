import fs from "fs"
import { homedir } from "os"
import { join, dirname } from "path"
import { packageJson } from ".."
import Logger from "./logger"
import forever from "forever-monitor"

export default class ProgramCommands {

  static start(path: RepositoryPath): RepositoryPath {
    path = this.kill(path)
    console.log(forever.start("ping dropin.link"))
    path.pid = 2
    return path
  }

  static kill(path: RepositoryPath): RepositoryPath {
    if(typeof path.pid !== "undefined") {
      Logger.info(`Killing PID ${path.pid}`)
      forever.kill(path.pid)
      delete path.pid
    }
    return path
  }

}
