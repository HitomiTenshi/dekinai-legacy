import * as fs from 'mz/fs'
import * as path from 'path'
import * as crypto from 'crypto'

import { Config } from './config'

export module Util {
  export function isExtensionAllowed(extension: string): boolean {
    return Config.extensionBlacklist.includes(extension) ? false : true
  }

  export async function getRandomFilename(extension: string): Promise<string> {
    const filename =
      crypto.randomBytes(Math.ceil(Config.filenameLength / 2)).toString('hex').slice(0, Config.filenameLength)
      + extension

    const exists = await fs.exists(path.join(Config.uploadDir + filename))

    if (!exists) {
      return filename
    }
    else {
      return await getRandomFilename(extension)
    }
  }
}
