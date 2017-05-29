import { injectable, inject } from 'inversify'
import { Database } from 'sqlite3'
import * as fs from 'fs'
import * as path from 'path'

import { IConfig, IFile, IDatabaseAdapter } from '../../interfaces'

export class SQLiteFile {
  terminationTime: number
  filename: string

  constructor(file: IFile) {
    this.terminationTime = file.terminationDate.getTime()
    this.filename = file.filename
  }
}

@injectable()
export class SQLiteAdapter implements IDatabaseAdapter {
  readonly database: Database

  constructor(@inject('Config') private config: IConfig) {
    this.database = new Database('database.sqlite', error => {
      if (error) {
        throw Error(`Unable to create SQLite Database. ${error.message}`)
      }
    })

    this.database.run('CREATE TABLE IF NOT EXISTS files (terminationTime INTEGER, filename TEXT)')
  }

  addFile(file: IFile): Promise<void> {
    const sqliteFile = new SQLiteFile(file)

    return new Promise<void>(resolve => {
      this.database.run(`INSERT INTO files VALUES(${sqliteFile.terminationTime}, ?)`, sqliteFile.filename, error => {
        if (error) {
          console.log(error.message)
        }

        resolve()
      })
    })
  }

  terminateFiles(): Promise<void> {
    const now = new Date().getTime()

    return new Promise<void>(resolve => {
      this.database.all(`SELECT * FROM files WHERE terminationTime < ${now}`, async (error, files: SQLiteFile[]) => {
        if (error) {
          if (error.message !== 'SQLITE_ERROR: no such table: files') {
            console.log(error.message)
          }
        }
        else {
          for (const file of files) {
            fs.unlink(path.join(this.config.uploadDir, file.filename), () => null)
          }

          await new Promise(resolve => {
            this.database.run(`DELETE FROM files WHERE terminationTime < ${now}`, error => {
              if (error) {
                console.log(error.message)
              }

              resolve()
            })
          })
        }

        resolve()
      })
    })
  }

  close(): Promise<void> {
    return new Promise<void>(resolve => {
      this.database.close(error => {
        if (error) {
          console.log(error.message)
        }

        resolve()
      })
    })
  }
}
