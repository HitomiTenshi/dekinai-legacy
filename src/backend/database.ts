import { injectable, inject } from 'inversify'

import { IConfig, IFile, IDatabase, IDatabaseAdapter } from '../interfaces'
import { container } from '../configuration'

@injectable()
export class Database implements IDatabase {
  adapter?: IDatabaseAdapter

  constructor(
    @inject('Config') config: IConfig) {
      if (!(config.temporaryStorage.forceDefaultEnabled && !config.temporaryStorage.defaultEnabled)) {
        switch (config.backend.adapter) {
          case 'sqlite':
            this.adapter = container.get<IDatabaseAdapter>('SQLiteAdapter')
            break
        }
      }
  }

  async addFile(file: IFile): Promise<void> {
    if (this.adapter === undefined) {
      throw new Error('addFile cannot be executed when the database is force-disabled by the config')
    }

    await this.adapter.addFile(file)
  }

  async terminateFiles(): Promise<void> {
    if (this.adapter === undefined) {
      throw new Error('terminateFiles cannot be executed when the database is force-disabled by the config')
    }

    await this.adapter.terminateFiles()
  }

  async close(): Promise<void> {
    if (this.adapter === undefined) {
      throw new Error('close cannot be executed when the database is force-disabled by the config')
    }

    await this.adapter.close()
  }
}
