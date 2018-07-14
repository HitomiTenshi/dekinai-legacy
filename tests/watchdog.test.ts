import 'reflect-metadata'

import * as assert from 'assert'

import { Watchdog } from '../src/watchdog'
import { IWatchdog } from '../src/interfaces/watchdog'
import { TestConfig } from './resources/config'

const config = new TestConfig()

describe('Watchdog', () => {
  let watchdog: Watchdog

  // Get Watchdog from the IoC container before each "it"
  beforeEach(() => {
    watchdog = config.getContainerType<IWatchdog>('Watchdog', true) as Watchdog
  })

  describe('start', () => {
    it('should start the watchdog', async () => {
      await watchdog.start()
      assert.notStrictEqual(watchdog.timer, undefined)
    })

    it('should execute the watchdog in an endless loop until stopped', async () => {
      // Set scanInterval to 0 so that the watchdog runs continuously without waiting
      config.watchdog.scanInterval = 0

      // Start the watchdog
      await watchdog.start()

      // Assert
      assert.strictEqual((watchdog.timer as any)._called, false)

      // Wait 5 ms
      await new Promise(resolve => global.setTimeout(resolve, 5))

      // Assert
      assert.strictEqual((watchdog.timer as any)._called, true)

      // Stop the watchdog
      await watchdog.stop()

      // Assert
      assert.strictEqual(watchdog.timer, undefined)
    })
  })

  describe('stop', () => {
    it('should throw an error if the watchdog has not been started before executing this function', async () => {
      let error: Error | undefined

      try {
        await watchdog.stop()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
      assert.strictEqual(error!.message, 'Watchdog has not been started.')
    })

    it('should stop the watchdog', async () => {
      await watchdog.start()
      await watchdog.stop()
      assert.strictEqual(watchdog.timer, undefined)
    })
  })
})
