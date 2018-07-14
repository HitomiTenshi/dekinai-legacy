import { injectable, inject } from 'inversify'

import { IConfig } from './interfaces/config'
import { IDatabase } from './interfaces/database'
import { IWatchdog } from './interfaces/watchdog'

@injectable()
export class Watchdog implements IWatchdog {
  timer?: NodeJS.Timer

  constructor(
    @inject('Config') private config: IConfig,
    @inject('Database') private database: IDatabase) { }

  async start(): Promise<void> {
    await this.database.open()
    await this.database.terminateFiles()

    this.timer = global.setInterval(
      async () => await this.database.terminateFiles(),
      this.config.watchdog.scanInterval * 1000
    )
  }

  async stop(): Promise<void> {
    if (this.timer !== undefined) {
      global.clearInterval(this.timer)
      this.timer = undefined
      await this.database.close()
    }
    else {
      throw Error('Watchdog has not been started.')
    }
  }
}
