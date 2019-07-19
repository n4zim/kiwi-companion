import { join } from "path"
import { homedir } from "os"
import fs from "fs"
import { packageJson } from ".."

interface ConfigV1 {
  version: string
  projects: { [name: string]: string }
  workspaces: { [name: string]: string[] }
}

export class ConfigsV1 {
  private static dir = join(homedir(), ".kiwi-bundle")
  private static configFile = "config.json"

  static get(): ConfigV1 {
    if(!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir)
    }

    const config = join(this.dir, this.configFile)
    if(fs.existsSync(config)) {
      return JSON.parse(fs.readFileSync(config, "utf-8"))
    }

    return {
      version: packageJson.version,
      projects: {},
      workspaces: {},
    }
  }

  static set(config: ConfigV1): ConfigV1 {
    fs.writeFileSync(join(this.dir, this.configFile), JSON.stringify(config, null, 2))
    return config
  }

  static update(callback: (config: ConfigV1) => ConfigV1) {
    this.set(callback(this.get()))
  }
}
