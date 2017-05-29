import { injectable, inject } from 'inversify'

import { IConfig, IDatabase, IWatchdog } from './interfaces'

@injectable()
export class Watchdog implements IWatchdog {
  private timer: NodeJS.Timer
  isRunning: boolean

  constructor(
    @inject('Config') private config: IConfig,
    @inject('Database') private database: IDatabase) { }

  private async run(): Promise<void> {
    if (this.isRunning) {
      await this.database.terminateFiles()
      this.timer = setTimeout(async () => await this.run(), this.config.watchdog.scanInterval * 1000)
    }
  }

  async start(): Promise<void> {
    this.isRunning = true
    await this.run()
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Cannot stop watchdog. Watchdog is not running.')
    }

    this.isRunning = false
    clearTimeout(this.timer)
    await this.database.close()
  }
}
