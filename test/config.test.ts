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
    it('should throw an error if the config file defines no parameters', () => {
      let error: Error | undefined

      // Create a valid config file that defines no parameters
      fs.writeFileSync('config.json', '{}')

      try {
        new Config()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)

      assert.strictEqual(error!.message.replace(/\s+/g, ''),
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
        .replace(/\s+/g, ''))
    })

    it('should throw an error if the config file defines objects as null', () => {
      let error: Error | undefined

      // Create a valid config file that defines objects as null
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

      assert.strictEqual(error!.message.replace(/\s+/g, ''),
        `"temporaryStorage" is not an object.
        "backend" is not an object.
        "watchdog" is not an object.
        "filename" is not an object.
        "randomString" is not an object.`
        .replace(/\s+/g, ''))
    })

    it('should throw an error if the config file defines objects as strings', () => {
      let error: Error | undefined

      // Create a valid config file that defines objects as strings
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

      assert.strictEqual(error!.message.replace(/\s+/g, ''),
        `"temporaryStorage" is not an object.
        "backend" is not an object.
        "watchdog" is not an object.
        "filename" is not an object.
        "randomString" is not an object.`
        .replace(/\s+/g, ''))
    })

    it('should throw an error if the config file defines no parameters inside objects', () => {
      let error: Error | undefined

      // Create a valid config file that defines no parameters inside objects
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

      assert.strictEqual(error!.message.replace(/\s+/g, ''),
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
        "randomString.defaultLength" is not defined in the configuration file.`
        .replace(/\s+/g, ''))
    })
  })

  describe('typeCheckParameters', () => {
    it('should throw an error if the config file defines parameters with wrong types', () => {
      let error: Error | undefined

      // Create a valid config file that defines parameters with wrong types
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
            "defaultLength": {}
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

      assert.strictEqual(error!.message.replace(/\s+/g, ''),
        `"uploadUrl" is not a string.
        "uploadDir" is not a string.
        "backend.adapter" is not a string.
        "filename.separator" is not a string.
        "tempDir" is not a string.
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
        .replace(/\s+/g, ''))
    })

    it('should throw an error if the config file defines array items with wrong types', () => {
      let error: Error | undefined

      // Create a valid config file that defines array items with wrong types
      fs.writeFileSync('config.json',
        `{
          "port": 3100,
          "uploadUrl": "https://dekinai.moe",
          "uploadDir": "./uploads",
          "tempDir": "./temp",
          "strict": true,
          "extensionBlacklist": [{}],

          "temporaryStorage": {
            "forceDefaultEnabled": false,
            "forceDefaultTTL": false,
            "defaultEnabled": true,
            "maxTTL": 2592000,
            "minTTL": 0,
            "defaultTTL": 604800
          },

          "backend": {
            "adapter": "sqlite"
          },

          "watchdog": {
            "scanInterval": 900
          },

          "filename": {
            "forceDefaultAppendFilename": false,
            "defaultAppendFilename": false,
            "separator": "_"
          },

          "randomString": {
            "forceDefaultLength": false,
            "maxLength": 10,
            "minLength": 5,
            "defaultLength": 5
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
      assert.strictEqual(error!.message, '"extensionBlacklist" contains values that are not strings.')
    })

    it('should allow certain parameters to define null as their value', () => {
      let error: Error | undefined

      // Create a valid config file that defines null for parameters that allow it
      fs.writeFileSync('config.json',
        `{
          "port": 3100,
          "uploadUrl": "https://dekinai.moe",
          "uploadDir": "./uploads",
          "tempDir": null,
          "strict": true,
          "extensionBlacklist": null,

          "temporaryStorage": {
            "forceDefaultEnabled": false,
            "forceDefaultTTL": false,
            "defaultEnabled": true,
            "maxTTL": 2592000,
            "minTTL": 0,
            "defaultTTL": 604800
          },

          "backend": {
            "adapter": "sqlite"
          },

          "watchdog": {
            "scanInterval": 900
          },

          "filename": {
            "forceDefaultAppendFilename": false,
            "defaultAppendFilename": false,
            "separator": "_"
          },

          "randomString": {
            "forceDefaultLength": false,
            "maxLength": 10,
            "minLength": 5,
            "defaultLength": 5
          }
        }`
      )

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
    // Restore default config file after running all tests
    after(() => shell.cp('../template/config.json', '.'))

    describe('backend.adapter', () => {
      it('should throw an error if the value is not "sqlite"', () => {
        let error: Error | undefined

        // Create a valid config file that defines backend.adapter with an invalid value
        fs.writeFileSync('config.json',
          `{
            "port": 3100,
            "uploadUrl": "https://dekinai.moe",
            "uploadDir": "./uploads",
            "tempDir": "./temp",
            "strict": true,
            "extensionBlacklist": [],

            "temporaryStorage": {
              "forceDefaultEnabled": false,
              "forceDefaultTTL": false,
              "defaultEnabled": true,
              "maxTTL": 2592000,
              "minTTL": 0,
              "defaultTTL": 604800
            },

            "backend": {
              "adapter": "invalid"
            },

            "watchdog": {
              "scanInterval": 900
            },

            "filename": {
              "forceDefaultAppendFilename": false,
              "defaultAppendFilename": false,
              "separator": "_"
            },

            "randomString": {
              "forceDefaultLength": false,
              "maxLength": 10,
              "minLength": 5,
              "defaultLength": 5
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
        assert.strictEqual(error!.message, '"backend.adapter" can only be "sqlite".')
      })
    })

    describe('temporaryStorage.maxTTL', () => {
      it('should throw an error if the value is below 0', () => {
        let error: Error | undefined

        // Create a valid config file that defines temporaryStorage.maxTTL with a value below 0
        fs.writeFileSync('config.json',
          `{
            "port": 3100,
            "uploadUrl": "https://dekinai.moe",
            "uploadDir": "./uploads",
            "tempDir": "./temp",
            "strict": true,
            "extensionBlacklist": [],

            "temporaryStorage": {
              "forceDefaultEnabled": false,
              "forceDefaultTTL": false,
              "defaultEnabled": true,
              "maxTTL": -1,
              "minTTL": -1,
              "defaultTTL": -1
            },

            "backend": {
              "adapter": "sqlite"
            },

            "watchdog": {
              "scanInterval": 900
            },

            "filename": {
              "forceDefaultAppendFilename": false,
              "defaultAppendFilename": false,
              "separator": "_"
            },

            "randomString": {
              "forceDefaultLength": false,
              "maxLength": 10,
              "minLength": 5,
              "defaultLength": 5
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

        assert.strictEqual(error!.message.replace(/\s+/g, ''),
          `"temporaryStorage.maxTTL" must be equal or greater than 0.
          "temporaryStorage.minTTL" must be equal or greater than 0.
          "temporaryStorage.defaultTTL" must be equal or greater than 0.`
          .replace(/\s+/g, ''))
      })

      it('should throw an error if the value is below temporaryStorage.minTTL', () => {
        let error: Error | undefined

        // Create a valid config file that defines temporaryStorage.maxTTL with a value below temporaryStorage.minTTL
        fs.writeFileSync('config.json',
          `{
            "port": 3100,
            "uploadUrl": "https://dekinai.moe",
            "uploadDir": "./uploads",
            "tempDir": "./temp",
            "strict": true,
            "extensionBlacklist": [],

            "temporaryStorage": {
              "forceDefaultEnabled": false,
              "forceDefaultTTL": false,
              "defaultEnabled": true,
              "maxTTL": 604799,
              "minTTL": 604800,
              "defaultTTL": 604800
            },

            "backend": {
              "adapter": "sqlite"
            },

            "watchdog": {
              "scanInterval": 900
            },

            "filename": {
              "forceDefaultAppendFilename": false,
              "defaultAppendFilename": false,
              "separator": "_"
            },

            "randomString": {
              "forceDefaultLength": false,
              "maxLength": 10,
              "minLength": 5,
              "defaultLength": 5
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

        assert.strictEqual(error!.message.replace(/\s+/g, ''),
          `"temporaryStorage.maxTTL" cannot be smaller than "config.temporaryStorage.minTTL".
          "temporaryStorage.minTTL" cannot be greater than "config.temporaryStorage.maxTTL".
          "temporaryStorage.defaultTTL" cannot be greater than "config.temporaryStorage.maxTTL".`
          .replace(/\s+/g, ''))
      })
    })

    describe('temporaryStorage.minTTL', () => {
      it('should throw an error if the value is below 0', () => {
        let error: Error | undefined

        // Create a valid config file that defines temporaryStorage.minTTL with a value below 0
        fs.writeFileSync('config.json',
          `{
            "port": 3100,
            "uploadUrl": "https://dekinai.moe",
            "uploadDir": "./uploads",
            "tempDir": "./temp",
            "strict": true,
            "extensionBlacklist": [],

            "temporaryStorage": {
              "forceDefaultEnabled": false,
              "forceDefaultTTL": false,
              "defaultEnabled": true,
              "maxTTL": 2592000,
              "minTTL": -1,
              "defaultTTL": 604800
            },

            "backend": {
              "adapter": "sqlite"
            },

            "watchdog": {
              "scanInterval": 900
            },

            "filename": {
              "forceDefaultAppendFilename": false,
              "defaultAppendFilename": false,
              "separator": "_"
            },

            "randomString": {
              "forceDefaultLength": false,
              "maxLength": 10,
              "minLength": 5,
              "defaultLength": 5
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
        assert.strictEqual(error!.message, '"temporaryStorage.minTTL" must be equal or greater than 0.')
      })

      it('should throw an error if the value is above temporaryStorage.maxTTL', () => {
        let error: Error | undefined

        // Create a valid config file that defines temporaryStorage.minTTL with a value above temporaryStorage.maxTTL
        fs.writeFileSync('config.json',
          `{
            "port": 3100,
            "uploadUrl": "https://dekinai.moe",
            "uploadDir": "./uploads",
            "tempDir": "./temp",
            "strict": true,
            "extensionBlacklist": [],

            "temporaryStorage": {
              "forceDefaultEnabled": false,
              "forceDefaultTTL": false,
              "defaultEnabled": true,
              "maxTTL": 604799,
              "minTTL": 604800,
              "defaultTTL": 604800
            },

            "backend": {
              "adapter": "sqlite"
            },

            "watchdog": {
              "scanInterval": 900
            },

            "filename": {
              "forceDefaultAppendFilename": false,
              "defaultAppendFilename": false,
              "separator": "_"
            },

            "randomString": {
              "forceDefaultLength": false,
              "maxLength": 10,
              "minLength": 5,
              "defaultLength": 5
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

        assert.strictEqual(error!.message.replace(/\s+/g, ''),
          `"temporaryStorage.maxTTL" cannot be smaller than "config.temporaryStorage.minTTL".
          "temporaryStorage.minTTL" cannot be greater than "config.temporaryStorage.maxTTL".
          "temporaryStorage.defaultTTL" cannot be greater than "config.temporaryStorage.maxTTL".`
          .replace(/\s+/g, ''))
      })
    })

    describe('temporaryStorage.defaultTTL', () => {
      it('should throw an error if the value is below 0', () => {
        let error: Error | undefined

        // Create a valid config file that defines temporaryStorage.defaultTTL with a value below 0
        fs.writeFileSync('config.json',
          `{
            "port": 3100,
            "uploadUrl": "https://dekinai.moe",
            "uploadDir": "./uploads",
            "tempDir": "./temp",
            "strict": true,
            "extensionBlacklist": [],

            "temporaryStorage": {
              "forceDefaultEnabled": false,
              "forceDefaultTTL": false,
              "defaultEnabled": true,
              "maxTTL": 2592000,
              "minTTL": -1,
              "defaultTTL": -1
            },

            "backend": {
              "adapter": "sqlite"
            },

            "watchdog": {
              "scanInterval": 900
            },

            "filename": {
              "forceDefaultAppendFilename": false,
              "defaultAppendFilename": false,
              "separator": "_"
            },

            "randomString": {
              "forceDefaultLength": false,
              "maxLength": 10,
              "minLength": 5,
              "defaultLength": 5
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

        assert.strictEqual(error!.message.replace(/\s+/g, ''),
          `"temporaryStorage.minTTL" must be equal or greater than 0.
          "temporaryStorage.defaultTTL" must be equal or greater than 0.`
          .replace(/\s+/g, ''))
      })

      it('should throw an error if the value is below temporaryStorage.minTTL', () => {
        let error: Error | undefined

        // Create a valid config file that defines temporaryStorage.defaultTTL with a value below temporaryStorage.minTTL
        fs.writeFileSync('config.json',
          `{
            "port": 3100,
            "uploadUrl": "https://dekinai.moe",
            "uploadDir": "./uploads",
            "tempDir": "./temp",
            "strict": true,
            "extensionBlacklist": [],

            "temporaryStorage": {
              "forceDefaultEnabled": false,
              "forceDefaultTTL": false,
              "defaultEnabled": true,
              "maxTTL": 2592000,
              "minTTL": 604800,
              "defaultTTL": 604799
            },

            "backend": {
              "adapter": "sqlite"
            },

            "watchdog": {
              "scanInterval": 900
            },

            "filename": {
              "forceDefaultAppendFilename": false,
              "defaultAppendFilename": false,
              "separator": "_"
            },

            "randomString": {
              "forceDefaultLength": false,
              "maxLength": 10,
              "minLength": 5,
              "defaultLength": 5
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
        assert.strictEqual(error!.message, '"temporaryStorage.defaultTTL" cannot be smaller than "config.temporaryStorage.minTTL".')
      })

      it('should throw an error if the value is above temporaryStorage.maxTTL', () => {
        let error: Error | undefined

        // Create a valid config file that defines temporaryStorage.defaultTTL with a value above temporaryStorage.maxTTL
        fs.writeFileSync('config.json',
          `{
            "port": 3100,
            "uploadUrl": "https://dekinai.moe",
            "uploadDir": "./uploads",
            "tempDir": "./temp",
            "strict": true,
            "extensionBlacklist": [],

            "temporaryStorage": {
              "forceDefaultEnabled": false,
              "forceDefaultTTL": false,
              "defaultEnabled": true,
              "maxTTL": 2592000,
              "minTTL": 0,
              "defaultTTL": 2592001
            },

            "backend": {
              "adapter": "sqlite"
            },

            "watchdog": {
              "scanInterval": 900
            },

            "filename": {
              "forceDefaultAppendFilename": false,
              "defaultAppendFilename": false,
              "separator": "_"
            },

            "randomString": {
              "forceDefaultLength": false,
              "maxLength": 10,
              "minLength": 5,
              "defaultLength": 5
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
        assert.strictEqual(error!.message, '"temporaryStorage.defaultTTL" cannot be greater than "config.temporaryStorage.maxTTL".')
      })
    })
  })
})
