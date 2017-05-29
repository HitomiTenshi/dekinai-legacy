import 'reflect-metadata'
import 'mocha'
import * as assert from 'assert'

import { File } from '../src/backend'
import { SQLiteAdapter, SQLiteFile } from '../src/backend/adapters'
import { Config, createContainer } from '../src/configuration'
import { IDatabase } from '../src/interfaces'
import { ITestConfig } from './resources'

const testConfig: ITestConfig = new Config()

describe('Database', () => {
  describe('Instance', () => {
    it('should have an adapter instance when the database is force-enabled', () => {
      testConfig.temporaryStorage.forceDefaultEnabled = true
      testConfig.temporaryStorage.defaultEnabled = true

      const container = createContainer(testConfig)
      const database = container.get<IDatabase>('Database')

      assert.notStrictEqual(database.adapter, undefined)
    })

    it('should not have an adapter instance when the database is force-disabled', () => {
      testConfig.temporaryStorage.forceDefaultEnabled = true
      testConfig.temporaryStorage.defaultEnabled = false

      const container = createContainer(testConfig)
      const database = container.get<IDatabase>('Database')

      assert.strictEqual(database.adapter, undefined)
    })

    it('should always have an adapter instance when the defaultEnabled setting is not forced', () => {
      testConfig.temporaryStorage.forceDefaultEnabled = false
      testConfig.temporaryStorage.defaultEnabled = false

      const container = createContainer(testConfig)
      const database = container.get<IDatabase>('Database')

      assert.notStrictEqual(database.adapter, undefined)
    })
  })

  describe('Adapter', () => {
    describe('SQLite', () => {
      testConfig.temporaryStorage.forceDefaultEnabled = false
      testConfig.backend.adapter = 'sqlite'

      const container = createContainer(testConfig)
      const database = container.get<IDatabase>('Database')
      const testFile = new File(new Date(), 'test.txt')

      // Give SQLite 10ms to initialize the database file before continuing
      before(done => setTimeout(done, 10))

      it('should have an SQLite adapter when the backend is set to "sqlite"', async () => {
        assert.strictEqual(database.adapter instanceof SQLiteAdapter, true)
      })

      describe('addFile', () => {
        it('should add the testFile', async () => {
          const adapter = database.adapter as SQLiteAdapter
          await database.addFile(testFile)

          await new Promise(resolve => {
            adapter.database.get(
              `SELECT * FROM files WHERE filename = '${testFile.filename}' LIMIT 1`,
              (error, file: SQLiteFile) => {
                assert.strictEqual(Boolean(error), false)
                assert.strictEqual(testFile.terminationDate.getTime(), file.terminationTime)
                assert.strictEqual(file.filename, testFile.filename)
                resolve()
            })
          })
        })
      })

      describe('terminateFiles', () => {
        it('should terminate the testFile after 10ms', async () => {
          // Wait 10ms to exceed the testFile's TTL
          await new Promise(resolve => setTimeout(resolve, 10))

          const adapter = database.adapter as SQLiteAdapter
          await database.terminateFiles()

          await new Promise(resolve => {
            adapter.database.get(
              `SELECT * FROM files WHERE filename = '${testFile.filename}' LIMIT 1`,
              (error, file: SQLiteFile) => {
                assert.strictEqual(Boolean(error), false)
                assert.strictEqual(file, undefined)
                resolve()
            })
          })
        })
      })

      describe('close', () => {
        it('should close the database', async () => {
          const adapter = database.adapter as SQLiteAdapter
          await database.close()
          assert.strictEqual((adapter.database as any).open, false)
        })
      })
    })
  })
})
