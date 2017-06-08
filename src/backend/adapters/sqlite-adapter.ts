import { injectable, inject } from 'inversify'
import * as sqlite from 'sqlite'
import * as fs from 'fs'
import * as path from 'path'

import { IConfig, IFile, IDatabaseAdapter } from '../../interfaces'

@injectable()
export class SQLiteAdapter implements IDatabaseAdapter {
  database?: sqlite.Database

  constructor(@inject('Config') private config: IConfig) { }

  async open(): Promise<void> {
    this.database = await sqlite.open('database.sqlite')
    await this.database.run('CREATE TABLE IF NOT EXISTS files (terminationTime INTEGER, filename TEXT)')
  }

  async close(): Promise<void> {
    if (this.database !== undefined) {
      await this.database.close()
    }
    else {
      throw Error('Database has not been opened.')
    }
  }

  async addFile(file: IFile): Promise<void> {
    if (this.database !== undefined) {
      await this.database.run(`INSERT INTO files VALUES(${file.terminationTime}, ?)`, file.filename)
    }
    else {
      throw Error('Database has not been opened.')
    }
  }

  async terminateFiles(): Promise<void> {
    if (this.database !== undefined) {
      const now = Date.now()
      const files = await this.database.all(`SELECT * FROM files WHERE terminationTime < ${now}`) as IFile[]

      for (const file of files) {
        fs.unlink(path.join(this.config.uploadDir, file.filename), () => null)
      }

      await this.database.run(`DELETE FROM files WHERE terminationTime < ${now}`)
    }
    else {
      throw Error('Database has not been opened.')
    }
  }
}
