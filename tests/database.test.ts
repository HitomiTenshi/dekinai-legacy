import 'reflect-metadata'
import * as assert from 'assert'
import * as FormData from 'form-data'
import * as fs from 'fs'
const got = require('got')

import { File } from '../src/backend'
import { SQLiteAdapter } from '../src/backend/adapters'
import { IServer, IDatabase, IFile } from '../src/interfaces'
import { TestConfig, Helper } from './resources'

const config = new TestConfig()
const testFile = new File(Date.now(), 'test.txt')
const url = `http://localhost:${config.port}`

describe('Database', () => {
  let database: IDatabase

  describe('Instance', () => {
    it('should have an adapter instance when the database is force-enabled', () => {
      // Set values
      config.temporaryStorage.forceDefaultEnabled = true
      config.temporaryStorage.defaultEnabled = true

      // Get the database from the IoC container
      database = config.getContainerType<IDatabase>('Database', true)

      assert.notStrictEqual(database.adapter, undefined)
    })

    it('should not have an adapter instance when the database is force-disabled', () => {
      // Set values
      config.temporaryStorage.forceDefaultEnabled = true
      config.temporaryStorage.defaultEnabled = false

      // Get the database from the IoC container
      database = config.getContainerType<IDatabase>('Database', true)

      assert.strictEqual(database.adapter, undefined)
    })

    it('should always have an adapter instance when the defaultEnabled setting is not forced', () => {
      // Set values
      config.temporaryStorage.forceDefaultEnabled = false
      config.temporaryStorage.defaultEnabled = false

      // Get the database from the IoC container
      database = config.getContainerType<IDatabase>('Database', true)

      assert.notStrictEqual(database.adapter, undefined)
    })
  })

  describe('open', () => {
    it('should throw an error if the database is force-disabled', async () => {
      let error: Error | undefined

      // Set values
      config.temporaryStorage.forceDefaultEnabled = true
      config.temporaryStorage.defaultEnabled = false

      // Get the database from the IoC container
      database = config.getContainerType<IDatabase>('Database', true)

      try {
        await database.open()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
      assert.strictEqual(error!.message, 'open cannot be executed when the database is force-disabled by the config.')
    })
  })

  describe('close', () => {
    it('should throw an error if the database is force-disabled', async () => {
      let error: Error | undefined

      // Set values
      config.temporaryStorage.forceDefaultEnabled = true
      config.temporaryStorage.defaultEnabled = false

      // Get the database from the IoC container
      database = config.getContainerType<IDatabase>('Database', true)

      try {
        await database.close()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
      assert.strictEqual(error!.message, 'close cannot be executed when the database is force-disabled by the config.')
    })
  })

  describe('addFile', () => {
    it('should throw an error if the database is force-disabled', async () => {
      let error: Error | undefined

      // Set values
      config.temporaryStorage.forceDefaultEnabled = true
      config.temporaryStorage.defaultEnabled = false

      // Get the database from the IoC container
      database = config.getContainerType<IDatabase>('Database', true)

      try {
        await database.addFile(testFile)
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
      assert.strictEqual(error!.message, 'addFile cannot be executed when the database is force-disabled by the config.')
    })
  })

  describe('terminateFiles', () => {
    it('should throw an error if the database is force-disabled', async () => {
      let error: Error | undefined

      // Set values
      config.temporaryStorage.forceDefaultEnabled = true
      config.temporaryStorage.defaultEnabled = false

      // Get the database from the IoC container
      database = config.getContainerType<IDatabase>('Database', true)

      try {
        await database.terminateFiles()
      }
      catch (err) {
        error = err
      }

      assert.notStrictEqual(error, undefined)
      assert.strictEqual(error!.message, 'terminateFiles cannot be executed when the database is force-disabled by the config.')
    })

    it('should delete expired files', async function () {
      // This test might be slow due to fs operations
      this.slow(200)

      // Set values
      config.temporaryStorage.forceDefaultEnabled = false
      config.temporaryStorage.defaultEnabled = true
      config.watchdog.scanInterval = 0
      config.temporaryStorage.minTTL = 0
      config.temporaryStorage.defaultTTL = 0

      // Get the database and the server from the IoC container
      database = config.getContainerType<IDatabase>('Database', true)
      const server = config.getContainerType<IServer>('Server')

      // Start the server
      await server.start()

      // Prepare a test file
      const formData = new FormData()
      formData.append('file', fs.createReadStream('resources/test.txt'))

      // Execute a POST request
      const response = await got.post(url, {
        body: formData
      })

      // File should exist
      const fileShouldExist = await Helper.checkFile(response.body)

      // Wait 5 ms
      await new Promise(resolve => setTimeout(resolve, 5))

      // File should be deleted after 5 ms
      const fileShouldNotExist = await Helper.checkFile(response.body)

      // Stop the server
      await server.stop()

      // Clean the uploads folder
      Helper.cleanUploads()

      // Assert
      assert.strictEqual(response.statusCode, 200)
      assert.strictEqual(fileShouldExist, true)
      assert.strictEqual(fileShouldNotExist, false)
    })
  })

  describe('Adapter', () => {
    // Reset the config to the default state
    before(() => {
      config.reset()
    })

    // Get the database from the IoC container before each "it"
    beforeEach(() => {
      database = config.getContainerType<IDatabase>('Database', true)
    })

    describe('SQLite', () => {
      let adapter: SQLiteAdapter

      // Use the SQLite adapter
      before(() => {
        config.backend.adapter = 'sqlite'
      })

      // Assign the SQLite adapter before each "it"
      beforeEach(() => {
        adapter = database.adapter as SQLiteAdapter
      })

      it('should have an SQLite adapter when the backend is set to "sqlite"', () => {
        assert.strictEqual(adapter instanceof SQLiteAdapter, true)
      })

      describe('open', () => {
        it('should open the database', async () => {
          await database.open()
          assert.strictEqual((adapter.database as any).driver.open, true)
        })
      })

      describe('close', () => {
        it('should throw an error if the database has not been opened before executing this function', async () => {
          let error: Error | undefined

          try {
            await database.close()
          }
          catch (err) {
            error = err
          }

          assert.notStrictEqual(error, undefined)
          assert.strictEqual(error!.message, 'Database has not been opened.')
        })

        it('should close the database', async () => {
          await database.open()
          await database.close()
          assert.strictEqual((adapter.database as any).driver.open, false)
        })
      })

      describe('addFile', () => {
        it('should throw an error if the database has not been opened before executing this function', async () => {
          let error: Error | undefined

          try {
            await database.addFile(testFile)
          }
          catch (err) {
            error = err
          }

          assert.notStrictEqual(error, undefined)
          assert.strictEqual(error!.message, 'Database has not been opened.')
        })

        it('should add the testFile', async () => {
          await database.open()
          await database.addFile(testFile)
          const file = await adapter.database!.get(`SELECT * FROM files WHERE filename = '${testFile.filename}' LIMIT 1`) as IFile
          assert.strictEqual(file.terminationTime, testFile.terminationTime)
          assert.strictEqual(file.filename, testFile.filename)
        })
      })

      describe('terminateFiles', () => {
        // Wait 5 ms to exceed the testFile's TTL
        before(done => {
          setTimeout(done, 5)
        })

        it('should throw an error if the database has not been opened before executing this function', async () => {
          let error: Error | undefined

          try {
            await database.terminateFiles()
          }
          catch (err) {
            error = err
          }

          assert.notStrictEqual(error, undefined)
          assert.strictEqual(error!.message, 'Database has not been opened.')
        })

        it('should terminate the testFile after 5 ms', async () => {
          await database.open()
          await database.terminateFiles()
          const file = await adapter.database!.get(`SELECT * FROM files WHERE filename = '${testFile.filename}' LIMIT 1`) as IFile
          assert.strictEqual(file, undefined)
        })
      })
    })
  })
})
