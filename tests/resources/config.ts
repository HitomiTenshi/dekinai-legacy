import { Container } from 'inversify'
import * as shell from 'shelljs'

import { createContainer } from '../../src/configuration'
import { IConfig } from '../../src/interfaces'
import { Config } from '../../src/configuration'

export class TestConfig implements IConfig {
  private container: Container

  port: number
  uploadUrl: string
  uploadDir: string
  dekinaiDir: string
  strict: boolean
  extensionBlacklist: string[] | null

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
    separator: string | null
  }

  randomString: {
    forceDefaultLength: boolean
    maxLength: number
    minLength: number
    defaultLength: number
    placement: 'start' | 'end'
  }

  constructor() {
    this.reset()
    this.container = createContainer(this)
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
    this.dekinaiDir = config.dekinaiDir
    this.strict = config.strict
    this.extensionBlacklist = config.extensionBlacklist
    this.temporaryStorage = config.temporaryStorage
    this.backend = config.backend
    this.watchdog = config.watchdog
    this.filename = config.filename
    this.randomString = config.randomString
  }

  getContainerType<T>(identifier: string, fromNewContainer = false): T {
    if (fromNewContainer) {
      this.container = createContainer(this)
    }

    return this.container.get<T>(identifier)
  }
}
