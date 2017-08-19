import 'reflect-metadata'
import * as assert from 'assert'
import * as FormData from 'form-data'
import * as fs from 'fs'
const got = require('got')

import { Util } from '../src'
import { IServer, IUtil } from '../src/interfaces'
import { TestConfig, Helper } from './resources'

const config = new TestConfig()
const url = `http://localhost:${config.port}`

describe('Middleware', () => {
  let server: IServer
  let formData: FormData

  // Start the server
  before(async () => {
    server = config.getContainerType<IServer>('Server')
    await server.start()
  })

  // Reset the config to the default state and prepare a testFile before each "it"
  beforeEach(() => {
    // Reset the config
    config.reset()

    // Prepare a test file
    formData = new FormData()
    formData.append('file', fs.createReadStream('resources/test.txt'))
  })

  // Clean the uploads folder after each "it"
  afterEach(() => Helper.cleanUploads())

  // Stop the server after running all tests
  after(async () => await server.stop())

  describe('onlyAllowPOST', () => {
    it('should reply with 404 to GET requests', async () => {
      let error: any

      try {
        await got.get(url)
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
      assert.strictEqual(error.statusCode, 404)
    })
  })

  describe('processFiles', () => {
    it('should reply with 404 to empty POST requests', async () => {
      let error: any

      try {
        await got.post(url)
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
      assert.strictEqual(error.statusCode, 404)
    })

    it('should reply with 200 to POST requests that include one file', async () => {
      const response = await got.post(url, {
        body: formData
      })

      const fileExists = await Helper.checkFile(response.body)

      assert.strictEqual(response.statusCode, 200)
      assert.strictEqual(fileExists, true)
    })

    it('should reply with 200 to POST requests that include two files when not being strict', async () => {
      // Prepare FormData
      formData.append('file2', fs.createReadStream('resources/test.html'))

      // Set value
      config.strict = false

      const response = await got.post(url, {
        body: formData
      })

      const fileExists = await Helper.checkFile(response.body)

      assert.strictEqual(response.statusCode, 200)
      assert.strictEqual(fileExists, true)
    })

    it('should reply with 403 to POST requests that include two files when being strict', async () => {
      let error: any

      // Prepare FormData
      formData.append('file2', fs.createReadStream('resources/test.html'))

      // Set value
      config.strict = true

      try {
        await got.post(url, {
          body: formData
        })
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
      assert.strictEqual(error.statusCode, 403)
    })
  })

  describe('validatePOST', () => {
    describe('temporary', () => {
      it('should reply with 403 to POST requests when temporaryStorage.forceDefaultEnabled is enabled with strict mode; default set to true', async () => {
        let error: any

        // Prepare FormData
        formData.append('temporary', 'true')

        // Set values
        config.strict = true
        config.temporaryStorage.forceDefaultEnabled = true
        config.temporaryStorage.defaultEnabled = true

        try {
          await got.post(url, {
            body: formData
          })
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error.statusCode, 403)
      })

      it('should reply with 403 to POST requests when temporaryStorage.forceDefaultEnabled is enabled with strict mode; default set to false', async () => {
        let error: any

        // Prepare FormData
        formData.append('temporary', 'true')

        // Set values
        config.strict = true
        config.temporaryStorage.forceDefaultEnabled = true
        config.temporaryStorage.defaultEnabled = false

        try {
          await got.post(url, {
            body: formData
          })
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error.statusCode, 403)
      })

      it('should reply with 200 to POST requests when temporaryStorage.forceDefaultEnabled is enabled without strict mode', async () => {
        // Prepare FormData
        formData.append('temporary', 'true')

        // Set values
        config.strict = false
        config.temporaryStorage.forceDefaultEnabled = true
        config.temporaryStorage.defaultEnabled = true

        const response = await got.post(url, {
          body: formData
        })

        const fileExists = await Helper.checkFile(response.body)

        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(fileExists, true)
      })

      it('should reply with 403 to POST requests when temporary is not "true" or "false" with strict mode', async () => {
        let error: any

        // Prepare FormData
        formData.append('temporary', 'invalid')

        // Set values
        config.strict = true
        config.temporaryStorage.forceDefaultEnabled = false

        try {
          await got.post(url, {
            body: formData
          })
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error.statusCode, 403)
      })

      it('should reply with 200 to POST requests when temporary is not "true" or "false" without strict mode', async () => {
        // Prepare FormData
        formData.append('temporary', 'invalid')

        // Set values
        config.strict = false
        config.temporaryStorage.forceDefaultEnabled = false

        const response = await got.post(url, {
          body: formData
        })

        const fileExists = await Helper.checkFile(response.body)

        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(fileExists, true)
      })

      it('should reply with 200 to POST requests when temporary is "true"', async () => {
        // Prepare FormData
        formData.append('temporary', 'true')

        // Set values
        config.strict = true
        config.temporaryStorage.forceDefaultEnabled = false

        const response = await got.post(url, {
          body: formData
        })

        const fileExists = await Helper.checkFile(response.body)

        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(fileExists, true)
      })
    })

    describe('TTL', () => {
      it('should reply with 403 to POST requests when temporaryStorage.forceDefaultEnabled is enabled with strict mode; default set to false', async () => {
        let error: any

        // Prepare FormData
        formData.append('TTL', '1000')

        // Set values
        config.strict = true
        config.temporaryStorage.forceDefaultEnabled = true
        config.temporaryStorage.defaultEnabled = false

        try {
          await got.post(url, {
            body: formData
          })
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error.statusCode, 403)
      })

      it('should reply with 200 to POST requests when temporaryStorage.forceDefaultEnabled is enabled without strict mode; default set to false', async () => {
        // Prepare FormData
        formData.append('TTL', '1000')

        // Set values
        config.strict = false
        config.temporaryStorage.forceDefaultEnabled = true
        config.temporaryStorage.defaultEnabled = false

        const response = await got.post(url, {
          body: formData
        })

        const fileExists = await Helper.checkFile(response.body)

        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(fileExists, true)
      })

      it('should reply with 403 to POST requests when temporaryStorage.forceDefaultTTL is enabled with strict mode', async () => {
        let error: any

        // Prepare FormData
        formData.append('TTL', '1000')

        // Set values
        config.strict = true
        config.temporaryStorage.forceDefaultEnabled = false
        config.temporaryStorage.forceDefaultTTL = true

        try {
          await got.post(url, {
            body: formData
          })
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error.statusCode, 403)
      })

      it('should reply with 200 to POST requests when temporaryStorage.forceDefaultTTL is enabled without strict mode', async () => {
        // Prepare FormData
        formData.append('TTL', '1000')

        // Set values
        config.strict = false
        config.temporaryStorage.forceDefaultEnabled = false
        config.temporaryStorage.forceDefaultTTL = true

        const response = await got.post(url, {
          body: formData
        })

        const fileExists = await Helper.checkFile(response.body)

        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(fileExists, true)
      })

      it('should reply with 403 to POST requests when TTL is not an integer with strict mode', async () => {
        let error: any

        // Prepare FormData
        formData.append('TTL', 'invalid')

        // Set values
        config.strict = true
        config.temporaryStorage.forceDefaultEnabled = false
        config.temporaryStorage.forceDefaultTTL = false

        try {
          await got.post(url, {
            body: formData
          })
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error.statusCode, 403)
      })

      it('should reply with 200 to POST requests when TTL is not an integer without strict mode', async () => {
        // Prepare FormData
        formData.append('TTL', 'invalid')

        // Set values
        config.strict = false
        config.temporaryStorage.forceDefaultEnabled = false
        config.temporaryStorage.forceDefaultTTL = false

        const response = await got.post(url, {
          body: formData
        })

        const fileExists = await Helper.checkFile(response.body)

        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(fileExists, true)
      })

      it('should reply with 403 to POST requests when TTL is smaller than temporaryStorage.minTTL with strict mode', async () => {
        let error: any

        // Prepare FormData
        formData.append('TTL', '-1')

        // Set values
        config.strict = true
        config.temporaryStorage.forceDefaultEnabled = false
        config.temporaryStorage.forceDefaultTTL = false

        try {
          await got.post(url, {
            body: formData
          })
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error.statusCode, 403)
      })

      it('should reply with 200 to POST requests when TTL is smaller than temporaryStorage.minTTL without strict mode', async () => {
        // Prepare FormData
        formData.append('TTL', '-1')

        // Set values
        config.strict = false
        config.temporaryStorage.forceDefaultEnabled = false
        config.temporaryStorage.forceDefaultTTL = false

        const response = await got.post(url, {
          body: formData
        })

        const fileExists = await Helper.checkFile(response.body)

        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(fileExists, true)
      })

      it('should reply with 403 to POST requests when TTL is bigger than temporaryStorage.maxTTL with strict mode', async () => {
        let error: any

        // Prepare FormData
        formData.append('TTL', '100000000')

        // Set values
        config.strict = true
        config.temporaryStorage.forceDefaultEnabled = false
        config.temporaryStorage.forceDefaultTTL = false

        try {
          await got.post(url, {
            body: formData
          })
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error.statusCode, 403)
      })

      it('should reply with 200 to POST requests when TTL is bigger than temporaryStorage.maxTTL without strict mode', async () => {
        // Prepare FormData
        formData.append('TTL', '100000000')

        // Set values
        config.strict = false
        config.temporaryStorage.forceDefaultEnabled = false
        config.temporaryStorage.forceDefaultTTL = false

        const response = await got.post(url, {
          body: formData
        })

        const fileExists = await Helper.checkFile(response.body)

        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(fileExists, true)
      })

      it('should reply with 403 to POST requests when TTL and temporary are defined with strict mode; temporary set to false', async () => {
        let error: any

        // Prepare FormData
        formData.append('temporary', 'false')
        formData.append('TTL', '1000')

        // Set values
        config.strict = true
        config.temporaryStorage.forceDefaultEnabled = false
        config.temporaryStorage.forceDefaultTTL = false

        try {
          await got.post(url, {
            body: formData
          })
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error.statusCode, 403)
      })

      it('should reply with 200 to POST requests when TTL and temporary are defined without strict mode; temporary set to false', async () => {
        // Prepare FormData
        formData.append('temporary', 'false')
        formData.append('TTL', '1000')

        // Set values
        config.strict = false
        config.temporaryStorage.forceDefaultEnabled = false
        config.temporaryStorage.forceDefaultTTL = false

        const response = await got.post(url, {
          body: formData
        })

        const fileExists = await Helper.checkFile(response.body)

        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(fileExists, true)
      })

      it('should reply with 200 to POST requests when TTL is "1000"', async () => {
        // Prepare FormData
        formData.append('TTL', '1000')

        // Set values
        config.strict = true
        config.temporaryStorage.forceDefaultEnabled = false
        config.temporaryStorage.forceDefaultTTL = false

        const response = await got.post(url, {
          body: formData
        })

        const fileExists = await Helper.checkFile(response.body)

        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(fileExists, true)
      })
    })

    describe('length', () => {
      it('should reply with 403 to POST requests when randomString.forceDefaultLength is enabled with strict mode', async () => {
        let error: any

        // Prepare FormData
        formData.append('length', '5')

        // Set values
        config.strict = true
        config.randomString.forceDefaultLength = true
        config.randomString.defaultLength = 5

        try {
          await got.post(url, {
            body: formData
          })
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error.statusCode, 403)
      })

      it('should reply with 200 to POST requests when randomString.forceDefaultLength is enabled without strict mode', async () => {
        // Prepare FormData
        formData.append('length', '5')

        // Set values
        config.strict = false
        config.randomString.forceDefaultLength = true
        config.randomString.defaultLength = 5

        const response = await got.post(url, {
          body: formData
        })

        const fileExists = await Helper.checkFile(response.body)

        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(fileExists, true)
      })

      it('should reply with 403 to POST requests when length is not an integer with strict mode', async () => {
        let error: any

        // Prepare FormData
        formData.append('length', 'invalid')

        // Set values
        config.strict = true
        config.randomString.forceDefaultLength = false

        try {
          await got.post(url, {
            body: formData
          })
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error.statusCode, 403)
      })

      it('should reply with 200 to POST requests when length is not an integer without strict mode', async () => {
        // Prepare FormData
        formData.append('length', 'invalid')

        // Set values
        config.strict = false
        config.randomString.forceDefaultLength = false

        const response = await got.post(url, {
          body: formData
        })

        const fileExists = await Helper.checkFile(response.body)

        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(fileExists, true)
      })

      it('should reply with 403 to POST requests when length is smaller than randomString.minLength with strict mode', async () => {
        let error: any

        // Prepare FormData
        formData.append('length', '0')

        // Set values
        config.strict = true
        config.randomString.forceDefaultLength = false

        try {
          await got.post(url, {
            body: formData
          })
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error.statusCode, 403)
      })

      it('should reply with 200 to POST requests when length is smaller than randomString.minLength without strict mode', async () => {
        // Prepare FormData
        formData.append('length', '0')

        // Set values
        config.strict = false
        config.randomString.forceDefaultLength = false

        const response = await got.post(url, {
          body: formData
        })

        const fileExists = await Helper.checkFile(response.body)

        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(fileExists, true)
      })

      it('should reply with 403 to POST requests when length is bigger than randomString.maxLength with strict mode', async () => {
        let error: any

        // Prepare FormData
        formData.append('length', '1000')

        // Set values
        config.strict = true
        config.randomString.forceDefaultLength = false

        try {
          await got.post(url, {
            body: formData
          })
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error.statusCode, 403)
      })

      it('should reply with 200 to POST requests when length is bigger than randomString.maxLength without strict mode', async () => {
        // Prepare FormData
        formData.append('length', '1000')

        // Set values
        config.strict = false
        config.randomString.forceDefaultLength = false

        const response = await got.post(url, {
          body: formData
        })

        const fileExists = await Helper.checkFile(response.body)

        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(fileExists, true)
      })

      it('should reply with 200 to POST requests when length is "5"', async () => {
        // Prepare FormData
        formData.append('length', '5')

        // Set values
        config.strict = true
        config.randomString.forceDefaultLength = false

        const response = await got.post(url, {
          body: formData
        })

        const fileExists = await Helper.checkFile(response.body)

        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(fileExists, true)
      })
    })

    describe('append', () => {
      it('should reply with 403 to POST requests when filename.forceDefaultAppendFilename is enabled with strict mode; default set to true', async () => {
        let error: any

        // Prepare FormData
        formData.append('append', 'true')

        // Set values
        config.strict = true
        config.filename.forceDefaultAppendFilename = true
        config.filename.defaultAppendFilename = true

        try {
          await got.post(url, {
            body: formData
          })
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error.statusCode, 403)
      })

      it('should reply with 403 to POST requests when filename.forceDefaultAppendFilename is enabled with strict mode; default set to false', async () => {
        let error: any

        // Prepare FormData
        formData.append('append', 'true')

        // Set values
        config.strict = true
        config.filename.forceDefaultAppendFilename = true
        config.filename.defaultAppendFilename = false

        try {
          await got.post(url, {
            body: formData
          })
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error.statusCode, 403)
      })

      it('should reply with 200 to POST requests when filename.forceDefaultAppendFilename is enabled without strict mode', async () => {
        // Prepare FormData
        formData.append('append', 'true')

        // Set values
        config.strict = false
        config.filename.forceDefaultAppendFilename = true
        config.filename.defaultAppendFilename = false

        const response = await got.post(url, {
          body: formData
        })

        const fileExists = await Helper.checkFile(response.body)

        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(fileExists, true)
      })

      it('should reply with 403 to POST requests when append is not "true" or "false" with strict mode', async () => {
        let error: any

        // Prepare FormData
        formData.append('append', 'invalid')

        // Set values
        config.strict = true
        config.filename.forceDefaultAppendFilename = false

        try {
          await got.post(url, {
            body: formData
          })
        }
        catch (err) {
          error = err
        }

        assert.notStrictEqual(error, undefined)
        assert.strictEqual(error.statusCode, 403)
      })

      it('should reply with 200 to POST requests when append is not "true" or "false" without strict mode', async () => {
        // Prepare FormData
        formData.append('append', 'invalid')

        // Set values
        config.strict = false
        config.filename.forceDefaultAppendFilename = false

        const response = await got.post(url, {
          body: formData
        })

        const fileExists = await Helper.checkFile(response.body)

        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(fileExists, true)
      })

      it('should reply with 200 to POST requests when append is "true"', async () => {
        // Prepare FormData
        formData.append('append', 'true')

        // Set values
        config.strict = true
        config.filename.forceDefaultAppendFilename = false

        const response = await got.post(url, {
          body: formData
        })

        const fileExists = await Helper.checkFile(response.body)

        assert.strictEqual(response.statusCode, 200)
        assert.strictEqual(fileExists, true)
      })
    })
  })

  describe('checkExtension', () => {
    it('should reply with 403 to POST requests that include a ".html" file', async () => {
      let error: any

      // Prepare FormData
      formData = new FormData()
      formData.append('file', fs.createReadStream('resources/test.html'))

      // Set value
      config.extensionBlacklist = ['.html']

      try {
        await got.post(url, {
          body: formData
        })
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
      assert.strictEqual(error.statusCode, 403)
    })

    it('should reply with 200 to POST requests that include a ".txt" file', async () => {
      // Set value
      config.extensionBlacklist = ['.html']

      const response = await got.post(url, {
        body: formData
      })

      const fileExists = await Helper.checkFile(response.body)

      assert.strictEqual(response.statusCode, 200)
      assert.strictEqual(fileExists, true)
    })
  })

  describe('generateFilename', () => {
    it('should reply with 409 to POST requests when the maximum tryCount has been reached', async function () {
      let error: any

      // This test might be slow due to fs operations
      this.slow(200)

      // Get Util from the IoC container
      const util = config.getContainerType<IUtil>('Util') as Util

      // Create all possible 1 character long files from Util's charset
      Helper.simulateMaxTryCount(util.charset, '.txt')

      // Set values
      config.randomString.minLength = 1
      config.randomString.maxLength = 1
      config.randomString.defaultLength = 1

      try {
        await got.post(url, {
          body: formData
        })
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
      assert.strictEqual(error.statusCode, 409)
    })
  })

  describe('resolveUrl', () => {
    it('should reply with 200 to POST requests with a body containing the url to the uploaded file; append set to "false"', async () => {
      // Prepare FormData
      formData.append('append', 'false')

      // Set values
      config.uploadUrl = 'https://this.is-a-test.url/'
      config.randomString.minLength = 5
      config.randomString.maxLength = 5
      config.randomString.defaultLength = 5
      config.randomString.placement = 'start'
      config.filename.separator = '_'

      const response = await got.post(url, {
        body: formData
      })

      const fileExists = await Helper.checkFile(response.body)

      assert.strictEqual(response.statusCode, 200)
      assert.strictEqual(fileExists, true)
      assert.strictEqual(response.body.startsWith(config.uploadUrl), true)
      assert.strictEqual(response.body.endsWith('.txt'), true)
      assert.strictEqual(response.body.replace(config.uploadUrl, '').replace('.txt', '').length, 5)
    })

    it('should reply with 200 to POST requests with a body containing the url to the uploaded file; append set to "true"', async () => {
      // Prepare FormData
      formData.append('append', 'true')

      // Set values
      config.uploadUrl = 'https://this.is-a-test.url/'
      config.randomString.minLength = 5
      config.randomString.maxLength = 5
      config.randomString.defaultLength = 5
      config.randomString.placement = 'start'
      config.filename.separator = '_'

      const response = await got.post(url, {
        body: formData
      })

      const fileExists = await Helper.checkFile(response.body)

      assert.strictEqual(response.statusCode, 200)
      assert.strictEqual(fileExists, true)
      assert.strictEqual(response.body.startsWith(config.uploadUrl), true)
      assert.strictEqual(response.body.endsWith('test.txt'), true)
      assert.strictEqual(response.body.replace(config.uploadUrl, '').replace('test.txt', '').length, 6)
    })
  })
})
