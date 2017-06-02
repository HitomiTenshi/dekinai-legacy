import 'reflect-metadata'
import * as assert from 'assert'
import * as shell from 'shelljs'

import { Config } from '../src/configuration'

describe('Config', () => {
  describe('loadConfigFile', () => {
    it('should throw an error if the config file cannot be loaded', () => {
      let error: Error | undefined

      // Delete the configuration file
      shell.rm('config.json')

      try {
        new Config()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
    })

    it('should load the config file if it is available in the current path', () => {
      let error: Error | undefined

      // Get a new configuration file from the template folder
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
})
