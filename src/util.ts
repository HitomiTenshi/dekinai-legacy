import { injectable, inject } from 'inversify'
import * as fs from 'fs'
import * as util from 'util'
import * as path from 'path'
import * as crypto from 'crypto'

import { IConfig, IUtil } from './interfaces'

const exists = util.promisify(fs.exists) as (path: string | Buffer) => Promise<boolean>

@injectable()
export class Util implements IUtil {
  charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  constructor(@inject('Config') private config: IConfig) { }

  isExtensionAllowed(extension: string): boolean {
    return this.config.extensionBlacklist !== null
      ? !this.config.extensionBlacklist.includes(extension)
      : true
  }

  async getRandomFilename(length: number, extension: string, tryCount: number = 0): Promise<string | null> {
    if (tryCount >= 10) return null

    let filename = ''
    const bytes = crypto.randomBytes(length)

    for (let i = 0; i < bytes.length; i++) {
      filename += this.charset[bytes.readUInt8(i) % this.charset.length]
    }

    filename += extension
    const fileExists = await exists(path.join(this.config.uploadDir, filename))

    if (!fileExists) {
      return filename
    }
    else {
      return await this.getRandomFilename(length, extension, ++tryCount)
    }
  }
}
