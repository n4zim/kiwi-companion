import { join } from "path"
import { existsSync, readFileSync } from "fs"
import jsYaml from "js-yaml"

interface KiwiFilesScripts {
  install?: string
}

interface KiwiFile {
  version: string
  includes?: string[]
  scripts?: KiwiFilesScripts
}

export class KiwiFiles {
  private static fileName = "kiwi.yml"

  static get(path: string): KiwiFile {
    const kiwiPath = join(path, this.fileName)
    if(!existsSync(kiwiPath)) {
      return { version: "1" }
    }
    return jsYaml.load(readFileSync(kiwiPath, "utf-8"))
  }

}
