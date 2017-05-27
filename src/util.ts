import { injectable, inject } from 'inversify'
import * as fs from 'mz/fs'
import * as path from 'path'
import * as crypto from 'crypto'

import { IConfig, IUtil } from './interfaces'

@injectable()
export class Util implements IUtil {
  private charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  constructor(@inject('Config') private config: IConfig) { }

  isExtensionAllowed(extension: string): boolean {
    return this.config.extensionBlacklist.includes(extension) ? false : true
  }

  async getRandomFilename(length: number, extension: string, tryCount: number = 0): Promise<string | null> {
    if (tryCount === 10) return null

    let filename = ''
    const bytes = crypto.randomBytes(length)

    for (let i = 0; i < bytes.length; i++) {
      filename += this.charset[bytes.readUInt8(i) % this.charset.length]
    }

    filename += extension
    const exists = await fs.exists(path.join(this.config.uploadDir, filename))

    if (!exists) {
      return filename
    }
    else {
      return await this.getRandomFilename(length, extension, ++tryCount)
    }
  }
}
