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

  constructor() {
    const config = this.loadConfigFile()

    // Validate the config file
    this.ensureParameters(config)
    this.typeCheckParameters(config)
    this.validateParameters(config)

    // Assign values
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

    // Ensure that extensions start with a dot
    this.extensionBlacklist = config.extensionBlacklist !== null
      ? config.extensionBlacklist.map(value => !value.startsWith('.') ? `.${value}` : value)
      : config.extensionBlacklist
  }

  private loadConfigFile(): IConfig {
    // Ensure that the config file exists
    if (!fs.existsSync('config.json')) {
      throw Error('Configuration file "config.json" not found. Please check the template folder for an example configuration file.')
    }

    // Parse the config file
    try {
      return JSON.parse(fs.readFileSync('config.json').toString())
    }
    catch (error) {
      throw Error(`Configuration file "config.json" contains invalid JSON. ${error}`)
    }
  }

  private ensureParameters(config: IConfig): void {
    const errors: string[] = []

    if (config.port === undefined) errors.push('"port" is not defined in the configuration file.')
    if (config.uploadUrl === undefined) errors.push('"uploadUrl" is not defined in the configuration file.')
    if (config.uploadDir === undefined) errors.push('"uploadDir" is not defined in the configuration file.')
    if (config.tempDir === undefined) errors.push('"tempDir" is not defined in the configuration file.')
    if (config.strict === undefined) errors.push('"strict" is not defined in the configuration file.')
    if (config.extensionBlacklist === undefined) errors.push('"extensionBlacklist" is not defined in the configuration file.')

    if (config.temporaryStorage === undefined) {
      errors.push('"temporaryStorage" is not defined in the configuration file.')
    }
    else if (config.temporaryStorage === null || typeof config.temporaryStorage !== 'object') {
      errors.push('"temporaryStorage" is not an object.')
    }
    else {
      if (config.temporaryStorage.forceDefaultEnabled === undefined) errors.push('"temporaryStorage.forceDefaultEnabled" is not defined in the configuration file.')
      if (config.temporaryStorage.forceDefaultTTL === undefined) errors.push('"temporaryStorage.forceDefaultTTL" is not defined in the configuration file.')
      if (config.temporaryStorage.defaultEnabled === undefined) errors.push('"temporaryStorage.defaultEnabled" is not defined in the configuration file.')
      if (config.temporaryStorage.maxTTL === undefined) errors.push('"temporaryStorage.maxTTL" is not defined in the configuration file.')
      if (config.temporaryStorage.minTTL === undefined) errors.push('"temporaryStorage.minTTL" is not defined in the configuration file.')
      if (config.temporaryStorage.defaultTTL === undefined) errors.push('"temporaryStorage.defaultTTL" is not defined in the configuration file.')
    }

    if (config.backend === undefined) {
      errors.push('"backend" is not defined in the configuration file.')
    }
    else if (config.backend === null || typeof config.backend !== 'object') {
      errors.push('"backend" is not an object.')
    }
    else {
      if (config.backend.adapter === undefined) errors.push('"backend.adapter" is not defined in the configuration file.')
    }

    if (config.watchdog === undefined) {
      errors.push('"watchdog" is not defined in the configuration file.')
    }
    else if (config.watchdog === null || typeof config.watchdog !== 'object') {
      errors.push('"watchdog" is not an object.')
    }
    else {
      if (config.watchdog.scanInterval === undefined) errors.push('"watchdog.scanInterval" is not defined in the configuration file.')
    }

    if (config.filename === undefined) {
      errors.push('"filename" is not defined in the configuration file.')
    }
    else if (config.filename === null || typeof config.filename !== 'object') {
      errors.push('"filename" is not an object.')
    }
    else {
      if (config.filename.forceDefaultAppendFilename === undefined) errors.push('"filename.forceDefaultAppendFilename" is not defined in the configuration file.')
      if (config.filename.defaultAppendFilename === undefined) errors.push('"filename.defaultAppendFilename" is not defined in the configuration file.')
      if (config.filename.separator === undefined) errors.push('"filename.separator" is not defined in the configuration file.')
    }

    if (config.randomString === undefined) {
      errors.push('"randomString" is not defined in the configuration file.')
    }
    else if (config.randomString === null || typeof config.randomString !== 'object') {
      errors.push('"randomString" is not an object.')
    }
    else {
      if (config.randomString.forceDefaultLength === undefined) errors.push('"randomString.forceDefaultLength" is not defined in the configuration file.')
      if (config.randomString.maxLength === undefined) errors.push('"randomString.maxLength" is not defined in the configuration file.')
      if (config.randomString.minLength === undefined) errors.push('"randomString.minLength" is not defined in the configuration file.')
      if (config.randomString.defaultLength === undefined) errors.push('"randomString.defaultLength" is not defined in the configuration file.')
    }

    // Throw if parameters are missing
    this.throwErrors(errors)
  }

  private typeCheckParameters(config: IConfig) {
    const errors: string[] = []

    // String type checks
    if (typeof config.uploadUrl !== 'string') errors.push('"uploadUrl" is not a string.')
    if (typeof config.uploadDir !== 'string') errors.push('"uploadDir" is not a string.')
    if (typeof config.backend.adapter !== 'string') errors.push('"backend.adapter" is not a string.')

    if (config.filename.separator !== null) {
      if (typeof config.filename.separator !== 'string') errors.push('"filename.separator" is not a string.')
    }

    if (config.tempDir !== null) {
      if (typeof config.tempDir !== 'string') errors.push('"tempDir" is not a string.')
    }

    // Boolean type checks
    if (typeof config.strict !== 'boolean') errors.push('"strict" is not a boolean.')
    if (typeof config.temporaryStorage.forceDefaultEnabled !== 'boolean') errors.push('"temporaryStorage.forceDefaultEnabled" is not a boolean.')
    if (typeof config.temporaryStorage.forceDefaultTTL !== 'boolean') errors.push('"temporaryStorage.forceDefaultTTL" is not a boolean.')
    if (typeof config.temporaryStorage.defaultEnabled !== 'boolean') errors.push('"temporaryStorage.defaultEnabled" is not a boolean.')
    if (typeof config.filename.forceDefaultAppendFilename !== 'boolean') errors.push('"filename.forceDefaultAppendFilename" is not a boolean.')
    if (typeof config.filename.defaultAppendFilename !== 'boolean') errors.push('"filename.defaultAppendFilename" is not a boolean.')
    if (typeof config.randomString.forceDefaultLength !== 'boolean') errors.push('"randomString.forceDefaultLength" is not a boolean.')

    // Array type checks
    if (config.extensionBlacklist !== null) {
      if (!Array.isArray(config.extensionBlacklist)) {
        errors.push('"extensionBlacklist" is not an array.')
      }
      else {
        // Ensure extensionBlacklist's items are of type string
        for (const item of config.extensionBlacklist) {
          if (typeof item !== 'string') {
            errors.push('"extensionBlacklist" contains values that are not strings.')
            break
          }
        }
      }
    }

    // Number type checks
    if (!Number.isInteger(config.port)) errors.push('"port" is not an integer.')
    if (!Number.isInteger(config.temporaryStorage.maxTTL)) errors.push('"temporaryStorage.maxTTL" is not an integer.')
    if (!Number.isInteger(config.temporaryStorage.minTTL)) errors.push('"temporaryStorage.minTTL" is not an integer.')
    if (!Number.isInteger(config.temporaryStorage.defaultTTL)) errors.push('"temporaryStorage.defaultTTL" is not an integer.')
    if (!Number.isInteger(config.watchdog.scanInterval)) errors.push('"watchdog.scanInterval" is not an integer.')
    if (!Number.isInteger(config.randomString.maxLength)) errors.push('"randomString.maxLength" is not an integer.')
    if (!Number.isInteger(config.randomString.minLength)) errors.push('"randomString.minLength" is not an integer.')
    if (!Number.isInteger(config.randomString.defaultLength)) errors.push('"randomString.defaultLength" is not an integer.')

    // Throw if parameters have the wrong types
    this.throwErrors(errors)
  }

  private validateParameters(config: IConfig) {
    const errors: string[] = []

    if (config.backend.adapter !== 'sqlite') errors.push('"backend.adapter" can only be "sqlite".')

    if (config.temporaryStorage.defaultTTL < 0) errors.push('"temporaryStorage.defaultTTL" must be equal or greater than 0.')
    if (config.watchdog.scanInterval < 0) errors.push('"watchdog.scanInterval" must be equal or greater than 0.')
    if (config.randomString.defaultLength < 1) errors.push('"randomString.defaultLength" must be equal or greater than 1.')

    if (!config.temporaryStorage.forceDefaultTTL) {
      if (config.temporaryStorage.maxTTL < 0) errors.push('"temporaryStorage.maxTTL" must be equal or greater than 0.')
      if (config.temporaryStorage.minTTL < 0) errors.push('"temporaryStorage.minTTL" must be equal or greater than 0.')
      if (config.temporaryStorage.maxTTL < config.temporaryStorage.minTTL) errors.push('"temporaryStorage.maxTTL" cannot be smaller than "temporaryStorage.minTTL".')
      if (config.temporaryStorage.minTTL > config.temporaryStorage.maxTTL) errors.push('"temporaryStorage.minTTL" cannot be greater than "temporaryStorage.maxTTL".')
      if (config.temporaryStorage.defaultTTL < config.temporaryStorage.minTTL) errors.push('"temporaryStorage.defaultTTL" cannot be smaller than "temporaryStorage.minTTL".')
      if (config.temporaryStorage.defaultTTL > config.temporaryStorage.maxTTL) errors.push('"temporaryStorage.defaultTTL" cannot be greater than "temporaryStorage.maxTTL".')
    }

    if (!config.randomString.forceDefaultLength) {
      if (config.randomString.maxLength < 1) errors.push('"randomString.maxLength" must be equal or greater than 1.')
      if (config.randomString.minLength < 1) errors.push('"randomString.minLength" must be equal or greater than 1.')
      if (config.randomString.maxLength < config.randomString.minLength) errors.push('"randomString.maxLength" cannot be smaller than "randomString.minLength".')
      if (config.randomString.minLength > config.randomString.maxLength) errors.push('"randomString.minLength" cannot be greater than "randomString.maxLength".')
      if (config.randomString.defaultLength < config.randomString.minLength) errors.push('"randomString.defaultLength" cannot be smaller than "randomString.minLength".')
      if (config.randomString.defaultLength > config.randomString.maxLength) errors.push('"randomString.defaultLength" cannot be greater than "randomString.maxLength".')
    }

    try {
      fs.accessSync(config.uploadDir, fs.constants.W_OK)
    }
    catch (error) {
      errors.push(`The path defined in "uploadDir" does not exist or does not have write permissions. ${error}`)
    }

    if (config.tempDir !== null) {
      try {
        fs.accessSync(config.tempDir as string, fs.constants.W_OK)
      }
      catch (error) {
        errors.push(`The path defined in "tempDir" does not exist or does not have write permissions. ${error}`)
      }
    }

    // Throw if parameters have invalid values
    this.throwErrors(errors)
  }

  private throwErrors(errors: string[]): void {
    if (errors.length > 0) {
      throw new Error(errors.join('\n'))
    }
  }
}
