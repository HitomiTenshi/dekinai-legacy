import * as shell from 'shelljs'
import * as path from 'path'
import * as fs from 'fs'
import * as url from 'url'
import * as util from 'util'

import { TestConfig } from '.'

const exists = util.promisify(fs.exists) as (path: string | Buffer) => Promise<boolean>

export module Helper {
  const config = new TestConfig()

  export async function checkFile(responseUrl: string): Promise<boolean> {
    const response = url.parse(responseUrl)
    return await exists(path.join(config.uploadDir, response.pathname as string))
  }

  export function simulateMaxTryCount(charset: string, extension: string): void {
    for (let char of charset) {
      shell.touch(path.join(config.uploadDir, char + extension))
    }
  }

  export function cleanUploads(): void {
    shell.rm('-rf', config.uploadDir)
    shell.mkdir(config.uploadDir)
  }
}
