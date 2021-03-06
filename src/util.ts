import { injectable, inject } from 'inversify'
import * as path from 'path'
import * as crypto from 'crypto'

import { fsExists } from './fs'
import { IConfig } from './interfaces/config'
import { IUtil } from './interfaces/util'

@injectable()
export class Util implements IUtil {
  charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  constructor(@inject('Config') private config: IConfig) { }

  isExtensionAllowed(extension: string): boolean {
    return this.config.extensionBlacklist !== null
      ? !this.config.extensionBlacklist.includes(extension)
      : true
  }

  async getRandomFilename(length: number, filename: string, extension: string, appendFilename: boolean, tryCount: number = 0): Promise<string | null> {
    if (tryCount >= 10) return null

    let generatedFilename = ''
    const bytes = crypto.randomBytes(length)

    for (let i = 0; i < bytes.length; i++) {
      generatedFilename += this.charset[bytes.readUInt8(i) % this.charset.length]
    }

    if (appendFilename) {
      generatedFilename = this.config.randomString.placement == 'start'
        ? generatedFilename + this.config.filename.separator + filename + extension
        : filename + this.config.filename.separator + generatedFilename + extension
    }
    else {
      generatedFilename += extension
    }

    const fileExists = await fsExists(path.join(this.config.uploadDir, generatedFilename))

    if (!fileExists) {
      return generatedFilename
    }
    else {
      return await this.getRandomFilename(length, filename, extension, appendFilename, ++tryCount)
    }
  }
}
