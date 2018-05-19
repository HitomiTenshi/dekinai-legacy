import { injectable, inject } from 'inversify'
import * as path from 'path'

import { IConfig } from '../interfaces/config'
import { IFile } from '../interfaces/file'
import { IDatabase, IDatabaseAdapter } from '../interfaces/database'
import { container } from '../configuration/ioc'

@injectable()
export class Database implements IDatabase {
  static backendDir: string
  readonly adapter?: IDatabaseAdapter

  constructor(
    @inject('Config') config: IConfig) {
      Database.backendDir = path.join(config.dekinaiDir, 'backend')

      if (!(config.temporaryStorage.forceDefaultEnabled && !config.temporaryStorage.defaultEnabled)) {
        switch (config.backend.adapter) {
          case 'sqlite':
            this.adapter = container.get<IDatabaseAdapter>('SQLiteAdapter')
            break
        }
      }
  }

  open(): Promise<void> {
    if (this.adapter === undefined) {
      throw new Error('open cannot be executed when the database is force-disabled by the config.')
    }

    return this.adapter.open()
  }

  close(): Promise<void> {
    if (this.adapter === undefined) {
      throw new Error('close cannot be executed when the database is force-disabled by the config.')
    }

    return this.adapter.close()
  }

  addFile(file: IFile): Promise<void> {
    if (this.adapter === undefined) {
      throw new Error('addFile cannot be executed when the database is force-disabled by the config.')
    }

    return this.adapter.addFile(file)
  }

  terminateFiles(): Promise<void> {
    if (this.adapter === undefined) {
      throw new Error('terminateFiles cannot be executed when the database is force-disabled by the config.')
    }

    return this.adapter.terminateFiles()
  }
}
