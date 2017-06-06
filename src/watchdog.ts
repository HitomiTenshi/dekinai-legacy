import { injectable, inject } from 'inversify'

import { IConfig, IDatabase, IWatchdog } from './interfaces'

@injectable()
export class Watchdog implements IWatchdog {
  timer?: NodeJS.Timer

  constructor(
    @inject('Config') private config: IConfig,
    @inject('Database') private database: IDatabase) { }

  async start(): Promise<void> {
    await this.database.open()

    this.timer = setInterval(
      async () => await this.database.terminateFiles(),
      this.config.watchdog.scanInterval * 1000
    )
  }

  async stop(): Promise<void> {
    if (this.timer !== undefined) {
      clearInterval(this.timer)
      this.timer = undefined
      await this.database.close()
    }
  }
}
