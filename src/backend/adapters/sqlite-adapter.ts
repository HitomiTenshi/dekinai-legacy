import { injectable, inject } from 'inversify'
import { Database } from 'sqlite3'
import * as fs from 'fs'
import * as path from 'path'

import { IConfig, IFile, IDatabaseAdapter } from '../../interfaces'

@injectable()
export class SQLiteAdapter implements IDatabaseAdapter {
  database?: Database

  constructor(@inject('Config') private config: IConfig) { }

  open(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.database = new Database('database.sqlite', async error => {
        if (error) {
          reject(Error(`Unable to create SQLite Database. ${error.message}`))
        }
        else {
          await new Promise(resolve => {
            this.database!.run('CREATE TABLE IF NOT EXISTS files (terminationTime INTEGER, filename TEXT)', error => {
              if (error) {
                console.log(error)
              }

              resolve()
            })
          })

          resolve()
        }
      })
    })
  }

  close(): Promise<void> {
    return new Promise<void>(resolve => {
      if (this.database !== undefined) {
        this.database.close(error => {
          if (error) {
            console.log(error.message)
          }

          resolve()
        })
      }
      else {
        resolve()
      }
    })
  }

  addFile(file: IFile): Promise<void> {
    return new Promise<void>(resolve => {
      if (this.database !== undefined) {
        this.database.run(`INSERT INTO files VALUES(${file.terminationTime}, ?)`, file.filename, error => {
          if (error) {
            console.log(error.message)
          }

          resolve()
        })
      }
      else {
        resolve()
      }
    })
  }

  terminateFiles(): Promise<void> {
    const now = Date.now()

    return new Promise<void>(resolve => {
      if (this.database !== undefined) {
        this.database.all(`SELECT * FROM files WHERE terminationTime < ${now}`, async (error, files: IFile[]) => {
          if (error) {
            console.log(error.message)
          }
          else {
            for (const file of files) {
              fs.unlink(path.join(this.config.uploadDir, file.filename), () => null)
            }

            await new Promise(resolve => {
              this.database!.run(`DELETE FROM files WHERE terminationTime < ${now}`, error => {
                if (error) {
                  console.log(error.message)
                }

                resolve()
              })
            })
          }

          resolve()
        })
      }
      else {
        resolve()
      }
    })
  }
}
