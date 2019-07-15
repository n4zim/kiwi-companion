import commandExists from "command-exists"
import { Repository } from "../recipes/KiwiBundle-workspaces"
import ProgramCommands, { SpawnCallback } from "./ProgramCommands"

export default class GitCommands {
  static isGitInstalled = commandExists.sync("git")

  static clone(repository: Repository, path: string, callback?: SpawnCallback) {
    ProgramCommands.spawn([
      /*"git",
      "clone",
      `git@${repository.host}:${repository.owner}/${repository.name}.git`,
      path,*/
      "ls",
      "-la",
    ], callback)
  }

}
