import 'reflect-metadata'
import * as assert from 'assert'
import * as shell from 'shelljs'
import * as fs from 'fs'

import { Config } from '../src/configuration'

describe('Config', () => {
  describe('loadConfigFile', () => {
    it('should throw an error if the config file cannot be loaded', () => {
      let error: Error | undefined

      // Delete the config file
      shell.rm('config.json')

      try {
        new Config()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
      assert.strictEqual(error!.message, 'Configuration file "config.json" not found. Please check the template folder for an example configuration file.')
    })

    it('should throw an error if the config file is empty', () => {
      let error: Error | undefined

      // Create an invalid config file
      fs.writeFileSync('config.json', '')

      try {
        new Config()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
      assert.strictEqual(error!.message.startsWith('Configuration file "config.json" contains invalid JSON.'), true)
    })

    it('should throw an error if the config file contains invalid JSON', () => {
      let error: Error | undefined

      // Create an invalid config file
      fs.writeFileSync('config.json', '{ This is invalid JSON. }')

      try {
        new Config()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
      assert.strictEqual(error!.message.startsWith('Configuration file "config.json" contains invalid JSON.'), true)
    })

    it('should load the config file if it is available in the current path and contains valid JSON', () => {
      let error: Error | undefined

      // Restore default config file
      shell.cp('../template/config.json', '.')

      try {
        new Config()
      }
      catch (err) {
        error = err
      }

      assert.strictEqual(error, undefined)
    })
  })

  describe('ensureParameters', () => {
    // Restore default config file after running all tests
    after(() => shell.cp('../template/config.json', '.'))

    it('should throw an error if the config file defines no parameters', () => {
      let error: Error | undefined

      // Create a valid JSON file that defines no parameters
      fs.writeFileSync('config.json', '{}')

      try {
        new Config()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
      assert.strictEqual(error!.message.includes('"port" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"uploadUrl" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"uploadDir" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"tempDir" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"strict" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"extensionBlacklist" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"temporaryStorage" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"backend" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"watchdog" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"filename" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"randomString" is not defined in the configuration file.'), true)
    })

    it('should throw an error if the config file defines objects as null', () => {
      let error: Error | undefined

      // Create a valid JSON file that defines objects as null
      fs.writeFileSync('config.json',
        `{
          "port": 3100,
          "uploadUrl": "https://dekinai.moe",
          "uploadDir": "./uploads",
          "tempDir": "./temp",
          "strict": true,
          "extensionBlacklist": [],

          "temporaryStorage": null,
          "backend": null,
          "watchdog": null,
          "filename": null,
          "randomString": null
        }`
      )

      try {
        new Config()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
      assert.strictEqual(error!.message.includes('"temporaryStorage" is not an object.'), true)
      assert.strictEqual(error!.message.includes('"backend" is not an object.'), true)
      assert.strictEqual(error!.message.includes('"watchdog" is not an object.'), true)
      assert.strictEqual(error!.message.includes('"filename" is not an object.'), true)
      assert.strictEqual(error!.message.includes('"randomString" is not an object.'), true)
    })

    it('should throw an error if the config file defines objects as strings', () => {
      let error: Error | undefined

      // Create a valid JSON file that defines objects as strings
      fs.writeFileSync('config.json',
        `{
          "port": 3100,
          "uploadUrl": "https://dekinai.moe",
          "uploadDir": "./uploads",
          "tempDir": "./temp",
          "strict": true,
          "extensionBlacklist": [],

          "temporaryStorage": "test",
          "backend": "test",
          "watchdog": "test",
          "filename": "test",
          "randomString": "test"
        }`
      )

      try {
        new Config()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
      assert.strictEqual(error!.message.includes('"temporaryStorage" is not an object.'), true)
      assert.strictEqual(error!.message.includes('"backend" is not an object.'), true)
      assert.strictEqual(error!.message.includes('"watchdog" is not an object.'), true)
      assert.strictEqual(error!.message.includes('"filename" is not an object.'), true)
      assert.strictEqual(error!.message.includes('"randomString" is not an object.'), true)
    })

    it('should throw an error if the config file defines no parameters inside objects', () => {
      let error: Error | undefined

      // Create a valid JSON file that defines no parameters inside objects
      fs.writeFileSync('config.json',
        `{
          "port": 3100,
          "uploadUrl": "https://dekinai.moe",
          "uploadDir": "./uploads",
          "tempDir": "./temp",
          "strict": true,
          "extensionBlacklist": [],

          "temporaryStorage": {},
          "backend": {},
          "watchdog": {},
          "filename": {},
          "randomString": {}
        }`
      )

      try {
        new Config()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
      assert.strictEqual(error!.message.includes('"temporaryStorage.forceDefaultEnabled" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"temporaryStorage.forceDefaultTTL" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"temporaryStorage.defaultEnabled" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"temporaryStorage.maxTTL" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"temporaryStorage.minTTL" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"temporaryStorage.defaultTTL" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"backend.adapter" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"watchdog.scanInterval" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"filename.forceDefaultAppendFilename" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"filename.defaultAppendFilename" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"filename.separator" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"randomString.forceDefaultLength" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"randomString.maxLength" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"randomString.minLength" is not defined in the configuration file.'), true)
      assert.strictEqual(error!.message.includes('"randomString.defaultLength" is not defined in the configuration file.'), true)
    })
  })
})
