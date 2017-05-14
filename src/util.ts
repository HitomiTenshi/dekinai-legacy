import * as fs from 'mz/fs'
import * as path from 'path'
import * as crypto from 'crypto'

import { Config } from './config'

export module Util {
  export function isExtensionAllowed(extension: string): boolean {
    return Config.extensionBlacklist.includes(extension) ? false : true
  }

  export async function getRandomFilename(length: number, extension: string, tryCount: number = 0): Promise<string | null> {
    if (tryCount === 10) return null

    const filename = crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length)
      + extension

    const exists = await fs.exists(path.join(Config.uploadDir + filename))

    if (!exists) {
      return filename
    }
    else {
      return await getRandomFilename(length, extension, ++tryCount)
    }
  }
}
