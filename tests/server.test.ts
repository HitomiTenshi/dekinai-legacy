import 'reflect-metadata'
import * as assert from 'assert'

import { Server, Watchdog } from '../src'
import { IServer } from '../src/interfaces'
import { TestConfig } from './resources'

const config = new TestConfig()

describe('Server', () => {
  let server: Server

  // Get a new server from the IoC container before each "it"
  beforeEach(async () => {
    // Stop the server if it is running from previous tests
    if (server !== undefined && server.server !== undefined) {
      await server.stop()
    }

    // Reset the config to the default state
    config.reset()

    // Get the server from a new container
    server = config.getContainerType<IServer>('Server') as Server
  })

  describe('start', () => {
    it('should start the server and the watchdog with the default config', async () => {
      await server.start()
      assert.notStrictEqual(server.server, undefined)
      assert.notStrictEqual((server.watchdog as Watchdog).timer, undefined)
    })

    it('should start the server without the watchdog when the database is force-disabled', async () => {
      // Set values
      config.temporaryStorage.forceDefaultEnabled = true
      config.temporaryStorage.defaultEnabled = false

      await server.start()
      assert.notStrictEqual(server.server, undefined)
      assert.strictEqual((server.watchdog as Watchdog).timer, undefined)
    })
  })

  describe('stop', () => {
    it('should throw an error if the server has not been started before executing this function', async () => {
      let error: Error | undefined

      try {
        await server.stop()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
      assert.strictEqual(error!.message, 'Server has not been started.')
    })

    it('should stop the server and the watchdog with the default config', async () => {
      // Start the server
      await server.start()

      // Watchdog should be running
      assert.notStrictEqual((server.watchdog as Watchdog).timer, undefined)

      // Stop the server
      await server.stop()

      // Assert
      assert.strictEqual(server.server, undefined)
      assert.strictEqual((server.watchdog as Watchdog).timer, undefined)
    })

    it('should not attempt to stop the watchdog when the database is force-disabled', async () => {
      // Set values
      config.temporaryStorage.forceDefaultEnabled = true
      config.temporaryStorage.defaultEnabled = false

      // Start the server
      await server.start()

      // Watchdog should be offline
      assert.strictEqual((server.watchdog as Watchdog).timer, undefined)

      // Stop the server
      await server.stop()

      // Assert
      assert.strictEqual(server.server, undefined)
      assert.strictEqual((server.watchdog as Watchdog).timer, undefined)
    })
  })
})
