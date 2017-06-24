export interface IConfig {
  readonly port: number
  readonly uploadUrl: string
  readonly uploadDir: string
  readonly tempDir: string | null
  readonly strict: boolean
  readonly extensionBlacklist: string[] | null

  readonly temporaryStorage: {
    readonly forceDefaultEnabled: boolean
    readonly forceDefaultTTL: boolean
    readonly defaultEnabled: boolean
    readonly maxTTL: number
    readonly minTTL: number
    readonly defaultTTL: number
  }

  readonly backend: {
    readonly adapter: 'sqlite'
  }

  readonly watchdog: {
    readonly scanInterval: number
  }

  readonly filename: {
    readonly forceDefaultAppendFilename: boolean
    readonly defaultAppendFilename: boolean
    readonly separator: string | null
  }

  readonly randomString: {
    readonly forceDefaultLength: boolean
    readonly maxLength: number
    readonly minLength: number
    readonly defaultLength: number
  }
}
