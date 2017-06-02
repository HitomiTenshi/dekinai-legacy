import 'reflect-metadata'
import * as assert from 'assert'

import { Config, createContainer } from '../src/configuration'
import { IUtil } from '../src/interfaces'
import { TestConfig } from './resources'

const testConfig = new Config() as TestConfig

describe('Util', () => {
  testConfig.extensionBlacklist = ['.html']

  const container = createContainer(testConfig)
  const util = container.get<IUtil>('Util')

  describe('isExtensionAllowed', () => {
    it('should return true for ".png"', () => {
      assert.strictEqual(util.isExtensionAllowed('.png'), true)
    })

    it('should return false for ".html"', () => {
      assert.strictEqual(util.isExtensionAllowed('.html'), false)
    })
  })

  describe('getRandomFilename', () => {
    it('should return a filename that is 5 characters long', async () => {
      const filename = await util.getRandomFilename(5, '')
      assert.strictEqual(filename!.length, 5)
    })

    it('should return a filename that is 9 characters long when it includes the ".png" extension', async () => {
      const filename = await util.getRandomFilename(5, '.png')
      assert.strictEqual(filename!.length, 9)
      assert.strictEqual(filename!.endsWith('.png'), true)
    })

    it('should return null when the maximum tryCount has been reached', async() => {
      const filename = await util.getRandomFilename(5, '', 10)
      assert.strictEqual(filename, null)
    })
  })
})
