import 'reflect-metadata'
import * as assert from 'assert'

import { Watchdog } from '../src'
import { IWatchdog } from '../src/interfaces'
import { TestConfig } from './resources'

const config = new TestConfig()

describe('Watchdog', () => {
  let watchdog: Watchdog

  // Get Watchdog from the IoC container
  before(() => watchdog = config.getContainerType<IWatchdog>('Watchdog') as Watchdog)

  describe('start', () => {
    it('should start the watchdog', async () => {
      await watchdog.start()
      assert.notStrictEqual(watchdog.timer, undefined)
    })
  })

  describe('stop', () => {
    it('should stop the watchdog', async () => {
      await watchdog.stop()
      assert.strictEqual(watchdog.timer, undefined)
    })
  })
})
