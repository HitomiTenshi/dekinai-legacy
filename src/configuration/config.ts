import { injectable } from 'inversify'
import * as fs from 'fs'

import { IConfig } from '../interfaces'

@injectable()
export class Config implements IConfig {
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

  constructor() {
    if (!fs.existsSync('config.json')) {
      throw Error('Configuration file "config.json" not found. Please check the template folder for an example configuration file.')
    }

    const config: IConfig = JSON.parse(fs.readFileSync('config.json').toString())

    if (config.port === undefined) throw Error('"port" is not defined in the configuration file.')
    if (config.uploadUrl === undefined) throw Error('"uploadUrl" is not defined in the configuration file.')
    if (config.uploadDir === undefined) throw Error('"uploadDir" is not defined in the configuration file.')
    if (config.tempDir === undefined) throw Error('"tempDir" is not defined in the configuration file.')
    if (config.strict === undefined) throw Error('"strict" is not defined in the configuration file.')
    if (config.temporaryStorage === undefined) throw Error('"temporaryStorage" is not defined in the configuration file.')
    if (config.temporaryStorage.forceDefaultEnabled === undefined) throw Error('"temporaryStorage.forceDefaultEnabled" is not defined in the configuration file.')
    if (config.temporaryStorage.forceDefaultTTL === undefined) throw Error('"temporaryStorage.forceDefaultTTL" is not defined in the configuration file.')
    if (config.temporaryStorage.defaultEnabled === undefined) throw Error('"temporaryStorage.defaultEnabled" is not defined in the configuration file.')
    if (config.temporaryStorage.maxTTL === undefined) throw Error('"temporaryStorage.maxTTL" is not defined in the configuration file.')
    if (config.temporaryStorage.minTTL === undefined) throw Error('"temporaryStorage.minTTL" is not defined in the configuration file.')
    if (config.temporaryStorage.defaultTTL === undefined) throw Error('"temporaryStorage.defaultTTL" is not defined in the configuration file.')
    if (config.backend === undefined) throw Error('"backend" is not defined in the configuration file.')
    if (config.backend.adapter === undefined) throw Error('"backend.adapter" is not defined in the configuration file.')
    if (config.watchdog === undefined) throw Error('"watchdog" is not defined in the configuration file.')
    if (config.watchdog.scanInterval === undefined) throw Error('"watchdog.scanInterval" is not defined in the configuration file.')
    if (config.filename === undefined) throw Error('"filename" is not defined in the configuration file.')
    if (config.filename.forceDefaultAppendFilename === undefined) throw Error('"filename.forceDefaultAppendFilename" is not defined in the configuration file.')
    if (config.filename.defaultAppendFilename === undefined) throw Error('"filename.defaultAppendFilename" is not defined in the configuration file.')
    if (config.filename.separator === undefined) throw Error('"filename.separator" is not defined in the configuration file.')
    if (config.randomString === undefined) throw Error('"randomString" is not defined in the configuration file.')
    if (config.randomString.forceDefaultLength === undefined) throw Error('"randomString.forceDefaultLength" is not defined in the configuration file.')
    if (config.randomString.maxLength === undefined) throw Error('"randomString.maxLength" is not defined in the configuration file.')
    if (config.randomString.minLength === undefined) throw Error('"randomString.minLength" is not defined in the configuration file.')
    if (config.randomString.defaultLength === undefined) throw Error('"randomString.defaultLength" is not defined in the configuration file.')
    if (config.extensionBlacklist === undefined) throw Error('"extensionBlacklist" is not defined in the configuration file.')

    if (typeof config.uploadUrl !== 'string') throw Error('"uploadUrl" is not a string.')
    if (typeof config.uploadDir !== 'string') throw Error('"uploadDir" is not a string.')
    if (typeof config.filename.separator !== 'string') throw Error('"filename.separator" is not a string.')

    if (typeof config.strict !== 'boolean') throw Error('"strict" is not a boolean.')
    if (typeof config.temporaryStorage.forceDefaultEnabled !== 'boolean') throw Error('"temporaryStorage.forceDefaultEnabled" is not a boolean.')
    if (typeof config.temporaryStorage.forceDefaultTTL !== 'boolean') throw Error('"temporaryStorage.forceDefaultTTL" is not a boolean.')
    if (typeof config.temporaryStorage.defaultEnabled !== 'boolean') throw Error('"temporaryStorage.defaultEnabled" is not a boolean.')
    if (typeof config.filename.forceDefaultAppendFilename !== 'boolean') throw Error('"filename.forceDefaultAppendFilename" is not a boolean.')
    if (typeof config.filename.defaultAppendFilename !== 'boolean') throw Error('"filename.defaultAppendFilename" is not a boolean.')
    if (typeof config.randomString.forceDefaultLength !== 'boolean') throw Error('"randomString.forceDefaultLength" is not a boolean.')

    if (!Array.isArray(config.extensionBlacklist)) throw Error('"extensionBlacklist" is not an array.')

    for (const item of config.extensionBlacklist) {
      if (typeof item !== 'string') throw Error('"extensionBlacklist" contains values that are not strings.')
    }

    if (!Number.isInteger(config.port)) throw Error('"port" is not an integer.')
    if (!Number.isInteger(config.temporaryStorage.maxTTL)) throw Error('"temporaryStorage.maxTTL" is not an integer.')
    if (!Number.isInteger(config.temporaryStorage.minTTL)) throw Error('"temporaryStorage.minTTL" is not an integer.')
    if (!Number.isInteger(config.temporaryStorage.defaultTTL)) throw Error('"temporaryStorage.defaultTTL" is not an integer.')
    if (!Number.isInteger(config.watchdog.scanInterval)) throw Error('"watchdog.scanInterval" is not an integer.')
    if (!Number.isInteger(config.randomString.maxLength)) throw Error('"randomString.maxLength" is not an integer.')
    if (!Number.isInteger(config.randomString.minLength)) throw Error('"randomString.minLength" is not an integer.')
    if (!Number.isInteger(config.randomString.defaultLength)) throw Error('"randomString.defaultLength" is not an integer.')

    if (config.backend.adapter !== 'sqlite') throw Error('"backend.adapter" can only be "sqlite".')

    if (config.temporaryStorage.maxTTL < 0) throw Error('"temporaryStorage.maxTTL" must be equal or greater than 0.')
    if (config.temporaryStorage.minTTL < 0) throw Error('"temporaryStorage.minTTL" must be equal or greater than 0.')
    if (config.temporaryStorage.defaultTTL < 0) throw Error('"temporaryStorage.defaultTTL" must be equal or greater than 0.')
    if (config.watchdog.scanInterval < 0) throw Error('"watchdog.scanInterval" must be equal or greater than 0.')
    if (config.randomString.maxLength < 1) throw Error('"randomString.maxLength" must be equal or greater than 1.')
    if (config.randomString.minLength < 1) throw Error('"randomString.minLength" must be equal or greater than 1.')
    if (config.randomString.defaultLength < 1) throw Error('"randomString.defaultLength" must be equal or greater than 1.')

    if (!config.temporaryStorage.forceDefaultTTL) {
      if (config.temporaryStorage.maxTTL < config.temporaryStorage.minTTL) throw Error('"temporaryStorage.maxTTL" cannot be smaller than "config.temporaryStorage.minTTL".')
      if (config.temporaryStorage.minTTL > config.temporaryStorage.maxTTL) throw Error('"temporaryStorage.minTTL" cannot be greater than "config.temporaryStorage.maxTTL".')
      if (config.temporaryStorage.defaultTTL < config.temporaryStorage.minTTL) throw Error('"temporaryStorage.defaultTTL" cannot be smaller than "config.temporaryStorage.minTTL".')
      if (config.temporaryStorage.defaultTTL > config.temporaryStorage.maxTTL) throw Error('"temporaryStorage.defaultTTL" cannot be greater than "config.temporaryStorage.maxTTL".')
    }

    if (!config.randomString.forceDefaultLength) {
      if (config.randomString.maxLength < config.randomString.minLength) throw Error('"randomString.maxLength" cannot be smaller than "config.randomString.minLength".')
      if (config.randomString.minLength > config.randomString.maxLength) throw Error('"randomString.minLength" cannot be greater than "config.randomString.maxLength".')
      if (config.randomString.defaultLength < config.randomString.minLength) throw Error('"randomString.defaultLength" cannot be smaller than "config.randomString.minLength".')
      if (config.randomString.defaultLength > config.randomString.maxLength) throw Error('"randomString.defaultLength" cannot be greater than "config.randomString.maxLength".')
    }

    try { fs.accessSync(config.uploadDir, fs.constants.W_OK) }
    catch (error) { throw Error(`The path defined in "uploadDir" does not exist or does not have write permissions. ${error}`) }

    if (config.tempDir !== null) {
      if (typeof config.tempDir !== 'string') throw Error('"tempDir" is not a string.')

      try { fs.accessSync(config.tempDir as string, fs.constants.W_OK) }
      catch (error) { throw Error(`The path defined in "tempDir" does not exist or does not have write permissions. ${error}`) }
    }

    this.port = config.port
    this.uploadUrl = config.uploadUrl
    this.uploadDir = config.uploadDir
    this.tempDir = config.tempDir
    this.strict = config.strict
    this.temporaryStorage = config.temporaryStorage
    this.backend = config.backend
    this.watchdog = config.watchdog
    this.filename = config.filename
    this.randomString = config.randomString
    this.extensionBlacklist = config.extensionBlacklist.map(value => !value.startsWith('.') ? `.${value}` : value)
  }
}
