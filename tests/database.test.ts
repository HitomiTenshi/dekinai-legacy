import 'reflect-metadata'
import * as assert from 'assert'

import { File } from '../src/backend'
import { SQLiteAdapter, SQLiteFile } from '../src/backend/adapters'
import { IDatabase } from '../src/interfaces'
import { TestConfig } from './resources'

const config = new TestConfig()
const testFile = new File(new Date(), 'test.txt')

describe('Database', () => {
  let database: IDatabase

  describe('Instance', () => {
    it('should have an adapter instance when the database is force-enabled', () => {
      // Set values
      config.temporaryStorage.forceDefaultEnabled = true
      config.temporaryStorage.defaultEnabled = true

      // Get the database from the IoC container
      database = config.getContainerType<IDatabase>('Database')

      assert.notStrictEqual(database.adapter, undefined)
    })

    it('should not have an adapter instance when the database is force-disabled', () => {
      // Set values
      config.temporaryStorage.forceDefaultEnabled = true
      config.temporaryStorage.defaultEnabled = false

      // Get the database from the IoC container
      database = config.getContainerType<IDatabase>('Database')

      assert.strictEqual(database.adapter, undefined)
    })

    it('should always have an adapter instance when the defaultEnabled setting is not forced', () => {
      // Set values
      config.temporaryStorage.forceDefaultEnabled = false
      config.temporaryStorage.defaultEnabled = false

      // Get the database from the IoC container
      database = config.getContainerType<IDatabase>('Database')

      assert.notStrictEqual(database.adapter, undefined)
    })
  })

  describe('Adapter', () => {
    let adapter: SQLiteAdapter

    // Make sure that the database is being initialized
    before(() => config.temporaryStorage.forceDefaultEnabled = false)

    describe('SQLite', () => {
      before(() => {
        // Use the SQLite adapter
        config.backend.adapter = 'sqlite'

        // Get the SQLite database from the IoC container
        database = config.getContainerType<IDatabase>('Database')
        adapter = database.adapter as SQLiteAdapter
      })

      it('should have an SQLite adapter when the backend is set to "sqlite"', () => {
        assert.strictEqual(adapter instanceof SQLiteAdapter, true)
      })

      describe('open', () => {
        it('should open the database', async () => {
          await database.open()
          assert.strictEqual((adapter.database as any).open, true)
        })
      })

      describe('addFile', () => {
        it('should add the testFile', async () => {
          await database.addFile(testFile)

          return new Promise(resolve => {
            adapter.database!.get(
              `SELECT * FROM files WHERE filename = '${testFile.filename}' LIMIT 1`,
              (error, file: SQLiteFile) => {
                assert.strictEqual(Boolean(error), false)
                assert.strictEqual(testFile.terminationDate.getTime(), file.terminationTime)
                assert.strictEqual(file.filename, testFile.filename)
                resolve()
              }
            )
          })
        })
      })

      describe('terminateFiles', () => {
        // Wait 5 ms to exceed the testFile's TTL
        before(done => setTimeout(done, 5))

        it('should terminate the testFile after 5 ms', async () => {
          await database.terminateFiles()

          return new Promise(resolve => {
            adapter.database!.get(
              `SELECT * FROM files WHERE filename = '${testFile.filename}' LIMIT 1`,
              (error, file: SQLiteFile) => {
                assert.strictEqual(Boolean(error), false)
                assert.strictEqual(file, undefined)
                resolve()
              }
            )
          })
        })
      })

      describe('close', () => {
        it('should close the database', async () => {
          await database.close()
          assert.strictEqual((adapter.database as any).open, false)
        })
      })
    })
  })
})
