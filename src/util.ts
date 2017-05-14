import * as fs from 'mz/fs'
import * as path from 'path'
import * as crypto from 'crypto'

import { Config } from './config'

export module Util {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  export function isExtensionAllowed(extension: string): boolean {
    return Config.extensionBlacklist.includes(extension) ? false : true
  }

  export async function getRandomFilename(length: number, extension: string, tryCount: number = 0): Promise<string | null> {
    if (tryCount === 10) return null

    let filename = ''
    const bytes = crypto.randomBytes(length)

    for (let i = 0; i < bytes.length; i++) {
      filename += charset[bytes.readUInt8(i) % charset.length]
    }

    filename += extension
    const exists = await fs.exists(path.join(Config.uploadDir, filename))

    if (!exists) {
      return filename
    }
    else {
      return await getRandomFilename(length, extension, ++tryCount)
    }
  }
}
