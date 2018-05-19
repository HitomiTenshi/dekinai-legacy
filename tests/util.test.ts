import 'reflect-metadata'

import * as assert from 'assert'

import { Util } from '../src/util'
import { IUtil } from '../src/interfaces/util'
import { TestConfig } from './resources/config'
import { Helper } from './resources/helper'

const config = new TestConfig()

describe('Util', () => {
  let util: Util

  // Get Util from the IoC container
  before(() => {
    util = config.getContainerType<IUtil>('Util') as Util
    config.filename.forceDefaultAppendFilename = true
    config.filename.defaultAppendFilename = false
  })

  describe('isExtensionAllowed', () => {
    it('should return true for ".png"', () => {
      assert.strictEqual(util.isExtensionAllowed('.png'), true)
    })

    it('should return false for ".html"', () => {
      // Set extensionBlacklist to disallow ".html"
      config.extensionBlacklist = ['.html']

      assert.strictEqual(util.isExtensionAllowed('.html'), false)
    })

    it('should return true for ".html" when extensionBlacklist is set to null', () => {
      // Set extensionBlacklist to allow all values
      config.extensionBlacklist = null

      assert.strictEqual(util.isExtensionAllowed('.html'), true)
    })
  })

  describe('getRandomFilename', () => {
    // Clean the uploads folder after running all tests
    after(() => {
      Helper.cleanUploads()
    })

    it('should return a random filename that is 5 characters long', async () => {
      const filename = await util.getRandomFilename(5, '', '', false)
      assert.strictEqual(filename!.length, 5)
    })

    it('should return a random filename that is 9 characters long when it includes the ".png" extension', async () => {
      const filename = await util.getRandomFilename(5, '', '.png', false)
      assert.strictEqual(filename!.length, 9)
      assert.strictEqual(filename!.endsWith('.png'), true)
    })

    it('should return an appended filename that is 14 characters long when it includes the ".png" extension. Appending random string at start.', async () => {
      // Set randomString.placement to append at start
      config.randomString.placement = 'start'

      const filename = await util.getRandomFilename(5, 'test', '.png', true)
      assert.strictEqual(filename!.length, 14)
      assert.strictEqual(filename!.endsWith('_test.png'), true)
    })

    it('should return an appended filename that is 14 characters long when it includes the ".png" extension. Appending random string at end.', async () => {
      // Set randomString.placement to append at end
      config.randomString.placement = 'end'

      const filename = await util.getRandomFilename(5, 'test', '.png', true)
      assert.strictEqual(filename!.length, 14)
      assert.strictEqual(filename!.startsWith('test'), true)
      assert.strictEqual(filename!.endsWith('.png'), true)
      assert.strictEqual(filename!.substr(-10, 1), '_')
    })

    it('should return null when the maximum tryCount has been reached', async function () {
      // This test might be slow due to fs operations
      this.slow(200)

      // Create all possible 1 character long files from Util's charset
      Helper.simulateMaxTryCount(util.charset, '.png')

      const filename = await util.getRandomFilename(1, '', '.png', false)
      assert.strictEqual(filename, null)
    })
  })
})
