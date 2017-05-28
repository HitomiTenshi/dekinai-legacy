import { injectable, inject } from 'inversify'

import { IConfig, IDatabase, IWatchdog } from './interfaces'

@injectable()
export class Watchdog implements IWatchdog {
  constructor(
    @inject('Config') private config: IConfig,
    @inject('Database') private database: IDatabase) { }

  async start(): Promise<void> {
    await this.database.terminateFiles()
    setTimeout(async () => await this.start(), this.config.watchdog.scanInterval * 1000)
  }
}
