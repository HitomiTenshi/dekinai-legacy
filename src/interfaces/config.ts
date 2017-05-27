export interface IConfig {
  readonly port: number
  readonly uploadUrl: string
  readonly uploadDir: string
  readonly tempDir: string | null
  readonly strict: boolean

  readonly temporaryStorage: {
    forceDefaultEnabled: boolean
    forceDefaultTTL: boolean
    defaultEnabled: boolean
    maxTTL: number
    minTTL: number
    defaultTTL: number
  }

  readonly backend: {
    adapter: 'sqlite'
  }

  readonly watchdog: {
    scanInterval: number
  }

  readonly filename: {
    forceDefaultAppendFilename: boolean
    defaultAppendFilename: boolean
    separator: string
  }

  readonly randomString: {
    forceDefaultLength: boolean
    maxLength: number
    minLength: number
    defaultLength: number
  }

  readonly extensionBlacklist: string[]
}
