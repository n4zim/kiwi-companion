import { join } from "path"
import { homedir } from "os"
import fs from "fs"
import { packageJson } from ".."

type ConfigV1Project = { name: string, path: string }

export interface ConfigV1 {
  version: string
  projects: { [name: string]: ConfigV1Project }
  workspaces: { [name: string]: string[] }
}

interface VSCodeWorkspace {
  folders: ConfigV1Project[]
}

export class ConfigsV1 {
  private static dir = join(homedir(), ".kiwi-bundle")
  private static vsCodeDir = "vscode"
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

  static addVSCodeWorkspace(name: string, config: ConfigV1) {
    const vsCodeDir = join(this.dir, this.vsCodeDir)
    if(!fs.existsSync(vsCodeDir)) {
      fs.mkdirSync(vsCodeDir)
    }
    const vsCodeConfig: VSCodeWorkspace = {
      folders: Object.values(config.projects)
    }
    fs.writeFileSync(join(vsCodeDir, `${name}.code-workspace`), JSON.stringify(vsCodeConfig, null, 2))
  }

}
