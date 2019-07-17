import fs from "fs"
import { join } from "path"

export default class KiwiConfigs {

  static exists(path: string): boolean {
    return fs.existsSync(join(path, "kiwi.yml"))
  }

}
