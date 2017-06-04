import 'reflect-metadata'
import * as assert from 'assert'

import { Util } from '../src'
import { IUtil } from '../src/interfaces'
import { TestConfig, Helper } from './resources'

const config = new TestConfig()

describe('Util', () => {
  let util: IUtil

  // Get Util from the IoC container
  before(() => util = config.getContainerType<IUtil>('Util'))

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
    after(() => Helper.cleanUploads())

    it('should return a filename that is 5 characters long', async () => {
      const filename = await util.getRandomFilename(5, '')
      assert.strictEqual(filename!.length, 5)
    })

    it('should return a filename that is 9 characters long when it includes the ".png" extension', async () => {
      const filename = await util.getRandomFilename(5, '.png')
      assert.strictEqual(filename!.length, 9)
      assert.strictEqual(filename!.endsWith('.png'), true)
    })

    it('should return null when the maximum tryCount has been reached', async function () {
      // This test might be slow due to fs operations
      this.slow(100)

      // Create all possible 1 character long files from Util's charset
      Helper.simulateMaxTryCount((util as Util).charset, '.png')

      const filename = await util.getRandomFilename(1, '.png')
      assert.strictEqual(filename, null)
    })
  })
})
