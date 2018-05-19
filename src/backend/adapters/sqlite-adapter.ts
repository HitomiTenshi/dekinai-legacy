import { injectable, inject } from 'inversify'
import * as SQLiteDatabase from 'better-sqlite3'
import * as fs from 'fs'
import * as path from 'path'

import { IConfig } from '../../interfaces/config'
import { IFile } from '../../interfaces/file'
import { IDatabaseAdapter } from '../../interfaces/database'
import { Database } from '../database'

@injectable()
export class SQLiteAdapter implements IDatabaseAdapter {
  database?: SQLiteDatabase

  constructor(@inject('Config') private config: IConfig) { }

  async open(): Promise<void> {
    this.database = new SQLiteDatabase(path.join(Database.backendDir, 'database.sqlite'))

    this.database
      .prepare('CREATE TABLE IF NOT EXISTS files (terminationTime INTEGER, filename TEXT)')
      .run()
  }

  async close(): Promise<void> {
    if (this.database !== undefined) {
      this.database.close()
    }
    else {
      throw Error('Database has not been opened.')
    }
  }

  async addFile(file: IFile): Promise<void> {
    if (this.database !== undefined) {
      this.database
        .prepare('INSERT INTO files VALUES(?, ?)')
        .run(file.terminationTime, file.filename)
    }
    else {
      throw Error('Database has not been opened.')
    }
  }

  async terminateFiles(): Promise<void> {
    if (this.database !== undefined) {
      const now = Date.now()

      const files = this.database
        .prepare('SELECT * FROM files WHERE terminationTime < ?')
        .all(now) as IFile[]

      for (const file of files) {
        fs.unlink(path.join(this.config.uploadDir, file.filename), () => null)
      }

      this.database
        .prepare('DELETE FROM files WHERE terminationTime < ?')
        .run(now)
    }
    else {
      throw Error('Database has not been opened.')
    }
  }
}
