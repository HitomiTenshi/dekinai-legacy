import { IConfig } from '../../src/interfaces'

export class TestConfig implements IConfig {
  port: number
  uploadUrl: string
  uploadDir: string
  tempDir: string | null
  strict: boolean

  temporaryStorage: {
    forceDefaultEnabled: boolean
    forceDefaultTTL: boolean
    defaultEnabled: boolean
    maxTTL: number
    minTTL: number
    defaultTTL: number
  }

  backend: {
    adapter: 'sqlite'
  }

  watchdog: {
    scanInterval: number
  }

  filename: {
    forceDefaultAppendFilename: boolean
    defaultAppendFilename: boolean
    separator: string
  }

  randomString: {
    forceDefaultLength: boolean
    maxLength: number
    minLength: number
    defaultLength: number
  }

  extensionBlacklist: string[] | null
}
