import { injectable, inject } from 'inversify'

import { IConfig, IDatabase, IWatchdog } from './interfaces'

@injectable()
export class Watchdog implements IWatchdog {
  constructor(
    @inject('Config') private config: IConfig,
    @inject('Database') private database: IDatabase) { }

  start(): void {
    this.database.terminateFiles()
    setTimeout(() => this.start(), this.config.watchdog.scanInterval * 1000)
  }
}
