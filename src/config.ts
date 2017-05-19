import * as fs from 'fs'

class Configuration {
  readonly port: number
  readonly uploadUrl: string
  readonly uploadDir: string
  readonly tempDir: string | null
  readonly strict: boolean

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

    if (config.port === undefined) throw Error('"port" is not defined in configuration file.')
    if (config.uploadUrl === undefined) throw Error('"uploadUrl" is not defined in configuration file.')
    if (config.uploadDir === undefined) throw Error('"uploadDir" is not defined in configuration file.')
    if (config.tempDir === undefined) throw Error('"tempDir" is not defined in configuration file.')
    if (config.strict === undefined) throw Error('"strict" is not defined in configuration file.')
    if (config.filename === undefined) throw Error('"filename" is not defined in configuration file.')
    if (config.filename.forceAppendFilename === undefined) throw Error('"filename.forceAppendFilename" is not defined in configuration file.')
    if (config.filename.appendFilename === undefined) throw Error('"filename.appendFilename" is not defined in configuration file.')
    if (config.filename.separator === undefined) throw Error('"filename.separator" is not defined in configuration file.')
    if (config.randomString === undefined) throw Error('"randomString" is not defined in configuration file.')
    if (config.randomString.forceDefaultLength === undefined) throw Error('"randomString.forceDefaultLength" is not defined in configuration file.')
    if (config.randomString.maxLength === undefined) throw Error('"randomString.maxLength" is not defined in configuration file.')
    if (config.randomString.minLength === undefined) throw Error('"randomString.minLength" is not defined in configuration file.')
    if (config.randomString.defaultLength === undefined) throw Error('"randomString.defaultLength" is not defined in configuration file.')
    if (config.extensionBlacklist === undefined) throw Error('"extensionBlacklist" is not defined in configuration file.')

    if (!Number.isInteger(config.port)) throw Error('"port" is not an integer.')
    if (!Number.isInteger(config.randomString.maxLength)) throw Error('"randomString.maxLength" is not an integer.')
    if (!Number.isInteger(config.randomString.minLength)) throw Error('"randomString.minLength" is not an integer.')
    if (!Number.isInteger(config.randomString.defaultLength)) throw Error('"randomString.defaultLength" is not an integer.')

    if (config.randomString.maxLength < 1) throw Error('"randomString.maxLength" must be equal or greater than 1.')
    if (config.randomString.minLength < 1) throw Error('"randomString.minLength" must be equal or greater than 1.')
    if (config.randomString.defaultLength < 1) throw Error('"randomString.defaultLength" must be equal or greater than 1.')

    if (!config.randomString.forceDefaultLength) {
      if (config.randomString.maxLength < config.randomString.minLength) throw Error('"randomString.maxLength" cannot be smaller than "config.randomString.minLength".')
      if (config.randomString.minLength > config.randomString.maxLength) throw Error('"randomString.minLength" cannot be greater than "config.randomString.maxLength".')
      if (config.randomString.defaultLength < config.randomString.minLength) throw Error('"randomString.defaultLength" cannot be smaller than "config.randomString.minLength".')
      if (config.randomString.defaultLength > config.randomString.maxLength) throw Error('"randomString.defaultLength" cannot be greater than "config.randomString.maxLength".')
    }

    try { fs.accessSync(config.uploadDir, fs.constants.W_OK) }
    catch (error) { throw Error(`The path defined in "uploadDir" does not exist or does not have write permissions. ${error}`) }

    if (config.tempDir !== null) {
      try { fs.accessSync(config.tempDir as string, fs.constants.W_OK) }
      catch (error) { throw Error(`The path defined in "tempDir" does not exist or does not have write permissions. ${error}`) }
    }

    this.port = config.port
    this.uploadUrl = config.uploadUrl
    this.uploadDir = config.uploadDir
    this.tempDir = config.tempDir
    this.strict = config.strict
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
