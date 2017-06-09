import { Container } from 'inversify'
import * as shell from 'shelljs'

import { createContainer } from '../../src/configuration'
import { IConfig } from '../../src/interfaces'
import { Config } from '../../src/configuration'

export class TestConfig implements IConfig {
  private container?: Container

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

  constructor() {
    this.reset()
  }

  reset(): void {
    // Restore the default config file
    shell.cp('../template/config.json', '.')

    // Create a new temporary config instance
    const config = new Config()

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
    this.extensionBlacklist = config.extensionBlacklist
    this.container = undefined
  }

  getContainerType<T>(identifier: string, fromNewContainer = false): T {
    if (this.container === undefined || fromNewContainer) {
      this.container = createContainer(this)
    }

    return this.container.get<T>(identifier)
  }
}
