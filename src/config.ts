import * as fs from 'fs'

class Configuration {
  readonly port: number
  readonly uploadUrl: string
  readonly uploadDir: string

  readonly filename: {
    forceAppendFilename: boolean
    appendFilename: boolean
    separator: string
  }

  readonly randomString: {
    forceDefaultLength: boolean
    maxLength: number
    minLength: number
    defaultLength: number
  }

  readonly extensionBlacklist: string[]

  constructor() {
    if (!fs.existsSync('config.json')) {
      throw Error('Configuration file "config.json" not found. Please check the template folder for an example configuration file.')
    }

    const config: Configuration = JSON.parse(fs.readFileSync('config.json').toString())

    if (config.port === undefined) throw Error('"port" not defined in configuration file.')
    if (config.uploadUrl === undefined) throw Error('"uploadUrl" not defined in configuration file.')
    if (config.uploadDir === undefined) throw Error('"uploadDir" not defined in configuration file.')
    if (config.filename === undefined) throw Error('"filename" not defined in configuration file.')
    if (config.filename.forceAppendFilename === undefined) throw Error('"filename.forceAppendFilename" not defined in configuration file.')
    if (config.filename.appendFilename === undefined) throw Error('"filename.appendFilename" not defined in configuration file.')
    if (config.filename.separator === undefined) throw Error('"filename.separator" not defined in configuration file.')
    if (config.randomString === undefined) throw Error('"randomString" not defined in configuration file.')
    if (config.randomString.forceDefaultLength === undefined) throw Error('"randomString.forceDefaultLength" not defined in configuration file.')
    if (config.randomString.maxLength === undefined) throw Error('"randomString.maxLength" not defined in configuration file.')
    if (config.randomString.minLength === undefined) throw Error('"randomString.minLength" not defined in configuration file.')
    if (config.randomString.defaultLength === undefined) throw Error('"randomString.defaultLength" not defined in configuration file.')
    if (config.extensionBlacklist === undefined) throw Error('"extensionBlacklist" not defined in configuration file.')

    if (!config.randomString.forceDefaultLength) {
      if (config.randomString.maxLength < config.randomString.minLength) throw Error('"randomString.maxLength" cannot be smaller than "config.randomString.minLength".')
      if (config.randomString.defaultLength < config.randomString.minLength) throw Error('"randomString.defaultLength" cannot be smaller than "config.randomString.minLength".')
    }

    try {
      fs.accessSync(config.uploadDir, fs.constants.W_OK)
    }
    catch (error) {
      throw Error(`The path defined in "uploadDir" does not exist or does not have write permissions. ${error}`)
    }

    this.port = config.port
    this.uploadUrl = config.uploadUrl
    this.uploadDir = config.uploadDir
    this.filename = config.filename
    this.filename.forceAppendFilename = config.filename.forceAppendFilename
    this.filename.appendFilename = config.filename.appendFilename
    this.filename.separator = config.filename.separator
    this.randomString = config.randomString
    this.randomString.forceDefaultLength = config.randomString.forceDefaultLength
    this.randomString.maxLength = config.randomString.maxLength
    this.randomString.minLength = config.randomString.minLength
    this.randomString.defaultLength = config.randomString.defaultLength
    this.extensionBlacklist = config.extensionBlacklist
  }
}

export const Config = new Configuration()
