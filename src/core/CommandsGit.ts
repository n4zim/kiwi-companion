import commandExists from "command-exists"
import { Logger } from "./Logger"
import { Repository } from "../recipes/KiwiBundle-workspaces"
import { SpawnCallback } from "./execute"
import { execute } from "./execute"

export class CommandsGit {
  private static isGitInstalled = commandExists.sync("git")

  static checkIfAvailable() {
    if(!this.isGitInstalled) {
      Logger.exit("Git must be installed on your system")
    }
  }

  static clone(repository: Repository, path: string, callback?: SpawnCallback) {
    execute([
      "git",
      "clone",
      "--progress",
      `git@${repository.host}:${repository.owner}/${repository.name}.git`,
      path,
    ], callback)
  }
}
