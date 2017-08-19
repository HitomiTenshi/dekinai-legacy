import 'reflect-metadata'
import * as assert from 'assert'
import * as shell from 'shelljs'
import * as fs from 'fs'

import { Config } from '../src/configuration'
import { TestConfig } from './resources'

const config = new TestConfig()

describe('Config', () => {
  // Reset the config to the default state before each "it"
  beforeEach(() => config.reset())

  // Restore the default config file after running all tests
  after(() => shell.cp('../template/config.json', '.'))

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
    it('should throw an error if the config file defines no parameters', () => {
      let error: Error | undefined

      // Create a config file that defines no parameters
      fs.writeFileSync('config.json', '{}')

      try {
        new Config()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)

      assert.strictEqual(
        error!.message,
        `"port" is not defined in the configuration file.
        "uploadUrl" is not defined in the configuration file.
        "uploadDir" is not defined in the configuration file.
        "tempDir" is not defined in the configuration file.
        "strict" is not defined in the configuration file.
        "extensionBlacklist" is not defined in the configuration file.
        "temporaryStorage" is not defined in the configuration file.
        "backend" is not defined in the configuration file.
        "watchdog" is not defined in the configuration file.
        "filename" is not defined in the configuration file.
        "randomString" is not defined in the configuration file.`
        .replace(/^\s+/gm, '')
      )
    })

    it('should throw an error if the config file defines objects as null', () => {
      let error: Error | undefined

      // Set invalid values
      const testConfig = config as any
      testConfig.temporaryStorage = null
      testConfig.backend = null
      testConfig.watchdog = null
      testConfig.filename = null
      testConfig.randomString = null

      // Create the config file
      fs.writeFileSync('config.json', JSON.stringify(testConfig))

      try {
        new Config()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)

      assert.strictEqual(
        error!.message,
        `"temporaryStorage" is not an object.
        "backend" is not an object.
        "watchdog" is not an object.
        "filename" is not an object.
        "randomString" is not an object.`
        .replace(/^\s+/gm, '')
      )
    })

    it('should throw an error if the config file defines objects as strings', () => {
      let error: Error | undefined

      // Set invalid values
      const testConfig = config as any
      testConfig.temporaryStorage = 'test'
      testConfig.backend = 'test'
      testConfig.watchdog = 'test'
      testConfig.filename = 'test'
      testConfig.randomString = 'test'

      // Create the config file
      fs.writeFileSync('config.json', JSON.stringify(testConfig))

      try {
        new Config()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)

      assert.strictEqual(
        error!.message,
        `"temporaryStorage" is not an object.
        "backend" is not an object.
        "watchdog" is not an object.
        "filename" is not an object.
        "randomString" is not an object.`
        .replace(/^\s+/gm, '')
      )
    })

    it('should throw an error if the config file defines no parameters inside objects', () => {
      let error: Error | undefined

      // Set invalid values
      const testConfig = config as any
      testConfig.temporaryStorage = {}
      testConfig.backend = {}
      testConfig.watchdog = {}
      testConfig.filename = {}
      testConfig.randomString = {}

      // Create the config file
      fs.writeFileSync('config.json', JSON.stringify(testConfig))

      try {
        new Config()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)

      assert.strictEqual(
        error!.message,
        `"temporaryStorage.forceDefaultEnabled" is not defined in the configuration file.
        "temporaryStorage.forceDefaultTTL" is not defined in the configuration file.
        "temporaryStorage.defaultEnabled" is not defined in the configuration file.
        "temporaryStorage.maxTTL" is not defined in the configuration file.
        "temporaryStorage.minTTL" is not defined in the configuration file.
        "temporaryStorage.defaultTTL" is not defined in the configuration file.
        "backend.adapter" is not defined in the configuration file.
        "watchdog.scanInterval" is not defined in the configuration file.
        "filename.forceDefaultAppendFilename" is not defined in the configuration file.
        "filename.defaultAppendFilename" is not defined in the configuration file.
        "filename.separator" is not defined in the configuration file.
        "randomString.forceDefaultLength" is not defined in the configuration file.
        "randomString.maxLength" is not defined in the configuration file.
        "randomString.minLength" is not defined in the configuration file.
        "randomString.defaultLength" is not defined in the configuration file.
        "randomString.placement" is not defined in the configuration file.`
        .replace(/^\s+/gm, '')
      )
    })
  })

  describe('typeCheckParameters', () => {
    it('should throw an error if the config file defines parameters with wrong types', () => {
      let error: Error | undefined

      // Create a config file that defines parameters with wrong types
      fs.writeFileSync('config.json',
        `{
          "port": {},
          "uploadUrl": {},
          "uploadDir": {},
          "tempDir": {},
          "strict": {},
          "extensionBlacklist": {},

          "temporaryStorage": {
            "forceDefaultEnabled": {},
            "forceDefaultTTL": {},
            "defaultEnabled": {},
            "maxTTL": {},
            "minTTL": {},
            "defaultTTL": {}
          },

          "backend": {
            "adapter": {}
          },

          "watchdog": {
            "scanInterval": {}
          },

          "filename": {
            "forceDefaultAppendFilename": {},
            "defaultAppendFilename": {},
            "separator": {}
          },

          "randomString": {
            "forceDefaultLength": {},
            "maxLength": {},
            "minLength": {},
            "defaultLength": {},
            "placement": {}
          }
        }`
      )

      try {
        new Config()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)

      assert.strictEqual(
        error!.message,
        `"uploadUrl" is not a string.
        "uploadDir" is not a string.
        "backend.adapter" is not a string.
        "randomString.placement" is not a string.
        "tempDir" is not a string.
        "filename.separator" is not a string.
        "strict" is not a boolean.
        "temporaryStorage.forceDefaultEnabled" is not a boolean.
        "temporaryStorage.forceDefaultTTL" is not a boolean.
        "temporaryStorage.defaultEnabled" is not a boolean.
        "filename.forceDefaultAppendFilename" is not a boolean.
        "filename.defaultAppendFilename" is not a boolean.
        "randomString.forceDefaultLength" is not a boolean.
        "extensionBlacklist" is not an array.
        "port" is not an integer.
        "temporaryStorage.maxTTL" is not an integer.
        "temporaryStorage.minTTL" is not an integer.
        "temporaryStorage.defaultTTL" is not an integer.
        "watchdog.scanInterval" is not an integer.
        "randomString.maxLength" is not an integer.
        "randomString.minLength" is not an integer.
        "randomString.defaultLength" is not an integer.`
        .replace(/^\s+/gm, '')
      )
    })

    it('should throw an error if the config file defines array items with wrong types', () => {
      let error: Error | undefined

      // Set invalid value
      const testConfig = config as any
      testConfig.extensionBlacklist = [null]

      // Create the config file
      fs.writeFileSync('config.json', JSON.stringify(testConfig))

      try {
        new Config()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
      assert.strictEqual(error!.message, '"extensionBlacklist" contains values that are not strings.')
    })

    it('should allow certain parameters to define null as their value', () => {
      let error: Error | undefined

      // Set invalid values
      config.tempDir = null
      config.extensionBlacklist = null
      config.filename.separator = null

      // Create the config file
      fs.writeFileSync('config.json', JSON.stringify(config))

      try {
        new Config()
      }
      catch (err) {
        error = err
      }

      assert.strictEqual(error, undefined)
    })
  })

  describe('validateParameters', () => {
    describe('backend.adapter', () => {
      it('should throw an error if the value is not "sqlite"', () => {
        let error: Error | undefined

        // Set invalid value
        const testConfig = config as any
        testConfig.backend.adapter = 'invalid'

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(testConfig))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error!.message, '"backend.adapter" can only be "sqlite".')
      })
    })

    describe('randomString.placement', () => {
      it('should throw an error if the value is not "start" or "end"', () => {
        let error: Error | undefined

        // Set invalid value
        const testConfig = config as any
        testConfig.randomString.placement = 'invalid'

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(testConfig))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error!.message, '"randomString.placement" can only be "start" or "end".')
      })
    })

    describe('temporaryStorage.maxTTL', () => {
      it('should throw an error if the value is below 0', () => {
        let error: Error | undefined

        // Set invalid value
        config.temporaryStorage.maxTTL = -1

        // Adjust dependent values
        config.temporaryStorage.minTTL = 0
        config.temporaryStorage.defaultTTL = 0

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)

        assert.strictEqual(
          error!.message,
          `"temporaryStorage.maxTTL" must be equal or greater than 0.
          "temporaryStorage.maxTTL" cannot be smaller than "temporaryStorage.minTTL".
          "temporaryStorage.minTTL" cannot be greater than "temporaryStorage.maxTTL".
          "temporaryStorage.defaultTTL" cannot be greater than "temporaryStorage.maxTTL".`
          .replace(/^\s+/gm, '')
        )
      })

      it('should throw an error if the value is below temporaryStorage.minTTL', () => {
        let error: Error | undefined

        // Set invalid value
        config.temporaryStorage.maxTTL = 0

        // Adjust dependent values
        config.temporaryStorage.minTTL = 1
        config.temporaryStorage.defaultTTL = 1

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)

        assert.strictEqual(
          error!.message,
          `"temporaryStorage.maxTTL" cannot be smaller than "temporaryStorage.minTTL".
          "temporaryStorage.minTTL" cannot be greater than "temporaryStorage.maxTTL".
          "temporaryStorage.defaultTTL" cannot be greater than "temporaryStorage.maxTTL".`
          .replace(/^\s+/gm, '')
        )
      })

      it('should not be validated when temporaryStorage.forceDefaultTTL is enabled', () => {
        let error: Error | undefined

        // Set values
        config.temporaryStorage.maxTTL = -1
        config.temporaryStorage.forceDefaultTTL = true

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.strictEqual(error, undefined)
      })
    })

    describe('temporaryStorage.minTTL', () => {
      it('should throw an error if the value is below 0', () => {
        let error: Error | undefined

        // Set invalid value
        config.temporaryStorage.minTTL = -1

        // Adjust dependent values
        config.temporaryStorage.maxTTL = 0
        config.temporaryStorage.defaultTTL = 0

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error!.message, '"temporaryStorage.minTTL" must be equal or greater than 0.')
      })

      it('should throw an error if the value is above temporaryStorage.maxTTL', () => {
        let error: Error | undefined

        // Set invalid value
        config.temporaryStorage.minTTL = 1

        // Adjust dependent values
        config.temporaryStorage.maxTTL = 0
        config.temporaryStorage.defaultTTL = 1

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)

        assert.strictEqual(
          error!.message,
          `"temporaryStorage.maxTTL" cannot be smaller than "temporaryStorage.minTTL".
          "temporaryStorage.minTTL" cannot be greater than "temporaryStorage.maxTTL".
          "temporaryStorage.defaultTTL" cannot be greater than "temporaryStorage.maxTTL".`
          .replace(/^\s+/gm, '')
        )
      })

      it('should not be validated when temporaryStorage.forceDefaultTTL is enabled', () => {
        let error: Error | undefined

        // Set values
        config.temporaryStorage.minTTL = -1
        config.temporaryStorage.forceDefaultTTL = true

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.strictEqual(error, undefined)
      })
    })

    describe('temporaryStorage.defaultTTL', () => {
      it('should throw an error if the value is below 0', () => {
        let error: Error | undefined

        // Set invalid value
        config.temporaryStorage.defaultTTL = -1

        // Adjust dependent values
        config.temporaryStorage.maxTTL = 0
        config.temporaryStorage.minTTL = 0

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)

        assert.strictEqual(
          error!.message,
          `"temporaryStorage.defaultTTL" must be equal or greater than 0.
          "temporaryStorage.defaultTTL" cannot be smaller than "temporaryStorage.minTTL".`
          .replace(/^\s+/gm, '')
        )
      })

      it('should throw an error if the value is below temporaryStorage.minTTL', () => {
        let error: Error | undefined

        // Set invalid value
        config.temporaryStorage.defaultTTL = 0

        // Adjust dependent values
        config.temporaryStorage.maxTTL = 1
        config.temporaryStorage.minTTL = 1

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error!.message, '"temporaryStorage.defaultTTL" cannot be smaller than "temporaryStorage.minTTL".')
      })

      it('should throw an error if the value is above temporaryStorage.maxTTL', () => {
        let error: Error | undefined

        // Set invalid value
        config.temporaryStorage.defaultTTL = 1

        // Adjust dependent values
        config.temporaryStorage.maxTTL = 0
        config.temporaryStorage.minTTL = 0

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error!.message, '"temporaryStorage.defaultTTL" cannot be greater than "temporaryStorage.maxTTL".')
      })
    })

    describe('watchdog.scanInterval', () => {
      it('should throw an error if the value is below 0', () => {
        let error: Error | undefined

        // Set invalid value
        config.watchdog.scanInterval = -1

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error!.message, '"watchdog.scanInterval" must be equal or greater than 0.')
      })
    })

    describe('randomString.maxLength', () => {
      it('should throw an error if the value is below 1', () => {
        let error: Error | undefined

        // Set invalid value
        config.randomString.maxLength = 0

        // Adjust dependent values
        config.randomString.minLength = 1
        config.randomString.defaultLength = 1

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)

        assert.strictEqual(
          error!.message,
          `"randomString.maxLength" must be equal or greater than 1.
          "randomString.maxLength" cannot be smaller than "randomString.minLength".
          "randomString.minLength" cannot be greater than "randomString.maxLength".
          "randomString.defaultLength" cannot be greater than "randomString.maxLength".`
          .replace(/^\s+/gm, '')
        )
      })

      it('should throw an error if the value is below randomString.minLength', () => {
        let error: Error | undefined

        // Set invalid value
        config.randomString.maxLength = 1

        // Adjust dependent values
        config.randomString.minLength = 2
        config.randomString.defaultLength = 2

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)

        assert.strictEqual(
          error!.message,
          `"randomString.maxLength" cannot be smaller than "randomString.minLength".
          "randomString.minLength" cannot be greater than "randomString.maxLength".
          "randomString.defaultLength" cannot be greater than "randomString.maxLength".`
          .replace(/^\s+/gm, '')
        )
      })

      it('should not be validated when randomString.forceDefaultLength is enabled', () => {
        let error: Error | undefined

        // Set values
        config.randomString.maxLength = 0
        config.randomString.forceDefaultLength = true

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.strictEqual(error, undefined)
      })
    })

    describe('randomString.minLength', () => {
      it('should throw an error if the value is below 1', () => {
        let error: Error | undefined

        // Set invalid value
        config.randomString.minLength = 0

        // Adjust dependent values
        config.randomString.maxLength = 1
        config.randomString.defaultLength = 1

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error!.message, '"randomString.minLength" must be equal or greater than 1.')
      })

      it('should throw an error if the value is above randomString.maxLength', () => {
        let error: Error | undefined

        // Set invalid value
        config.randomString.minLength = 2

        // Adjust dependent values
        config.randomString.maxLength = 1
        config.randomString.defaultLength = 2

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)

        assert.strictEqual(
          error!.message,
          `"randomString.maxLength" cannot be smaller than "randomString.minLength".
          "randomString.minLength" cannot be greater than "randomString.maxLength".
          "randomString.defaultLength" cannot be greater than "randomString.maxLength".`
          .replace(/^\s+/gm, '')
        )
      })

      it('should not be validated when randomString.forceDefaultLength is enabled', () => {
        let error: Error | undefined

        // Set values
        config.randomString.minLength = 0
        config.randomString.forceDefaultLength = true

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.strictEqual(error, undefined)
      })
    })

    describe('randomString.defaultLength', () => {
      it('should throw an error if the value is below 1', () => {
        let error: Error | undefined

        // Set invalid value
        config.randomString.defaultLength = 0

        // Adjust dependent values
        config.randomString.maxLength = 1
        config.randomString.minLength = 1

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)

        assert.strictEqual(
          error!.message,
          `"randomString.defaultLength" must be equal or greater than 1.
          "randomString.defaultLength" cannot be smaller than "randomString.minLength".`
          .replace(/^\s+/gm, '')
        )
      })

      it('should throw an error if the value is below randomString.minLength', () => {
        let error: Error | undefined

        // Set invalid value
        config.randomString.defaultLength = 1

        // Adjust dependent values
        config.randomString.maxLength = 2
        config.randomString.minLength = 2

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error!.message, '"randomString.defaultLength" cannot be smaller than "randomString.minLength".')
      })

      it('should throw an error if the value is above randomString.maxLength', () => {
        let error: Error | undefined

        // Set invalid value
        config.randomString.defaultLength = 2

        // Adjust dependent values
        config.randomString.maxLength = 1
        config.randomString.minLength = 1

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error!.message, '"randomString.defaultLength" cannot be greater than "randomString.maxLength".')
      })
    })

    describe('uploadDir', () => {
      it('should throw an error if the value points to a path that does not exist', () => {
        let error: Error | undefined

        // Set invalid value
        config.uploadDir = './invalid_path'

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error!.message.startsWith('The path defined in "uploadDir" does not exist or does not have write permissions.'), true)
      })
    })

    describe('tempDir', () => {
      it('should throw an error if the value points to a path that does not exist', () => {
        let error: Error | undefined

        // Set invalid value
        config.tempDir = './invalid_path'

        // Create the config file
        fs.writeFileSync('config.json', JSON.stringify(config))

        try {
          new Config()
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error!.message.startsWith('The path defined in "tempDir" does not exist or does not have write permissions.'), true)
      })
    })
  })
})
