import * as fs from 'fs'

interface IConfiguration {
  port: number
  uploadUrl: string
  uploadDir: string
  filenameLength: number
  extensionBlacklist: string[]
}

class Configuration implements IConfiguration {
  readonly port: number
  readonly uploadUrl: string
  readonly uploadDir: string
  readonly filenameLength: number
  readonly extensionBlacklist: string[]

  constructor() {
    if (!fs.existsSync('config.json')) {
      throw Error('Configuration file "config.json" not found. Please check the template folder for an example configuration file.')
    }

    const config: IConfiguration = JSON.parse(fs.readFileSync('config.json').toString())

    if (!config.port) throw Error('"port" not defined in configuration file.')
    if (!config.uploadUrl) throw Error('"uploadUrl" not defined in configuration file.')
    if (!config.uploadDir) throw Error('"uploadDir" not defined in configuration file.')
    if (!config.filenameLength) throw Error('"filenameLength" not defined in configuration file.')
    if (!config.extensionBlacklist) throw Error('"extensionBlacklist" not defined in configuration file.')

    try {
      fs.accessSync(config.uploadDir, fs.constants.W_OK)
    }
    catch (error) {
      throw Error(`The path defined in "uploadDir" does not exist or does not have write permissions. ${error}`)
    }

    this.port = config.port
    this.uploadUrl = config.uploadUrl
    this.uploadDir = config.uploadDir
    this.filenameLength = config.filenameLength
    this.extensionBlacklist = config.extensionBlacklist
  }
}

export const Config = new Configuration()
