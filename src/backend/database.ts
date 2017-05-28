import { injectable, inject } from 'inversify'

import { IConfig, IFile, IDatabase, IDatabaseAdapter } from '../interfaces'
import { container } from '../configuration'

@injectable()
export class Database implements IDatabase {
  adapter: IDatabaseAdapter

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
    await this.adapter.addFile(file)
  }

  async terminateFiles(): Promise<void> {
    await this.adapter.terminateFiles()
  }
}
