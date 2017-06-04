import * as shell from 'shelljs'
import * as path from 'path'

import { TestConfig } from '.'

export module Helper {
  const config = new TestConfig()

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
