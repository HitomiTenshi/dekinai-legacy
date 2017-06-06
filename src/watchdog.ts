import { injectable, inject } from 'inversify'

import { IConfig, IDatabase, IWatchdog } from './interfaces'

@injectable()
export class Watchdog implements IWatchdog {
  private preventStart = false
  timer?: NodeJS.Timer

  constructor(
    @inject('Config') private config: IConfig,
    @inject('Database') private database: IDatabase) { }

  private async run(): Promise<void> {
    await this.database.terminateFiles()

    if (!this.preventStart) {
      this.timer = setTimeout(async () => await this.run(), this.config.watchdog.scanInterval * 1000)
    }
  }

  async start(): Promise<void> {
    // Wait 100 ms before starting to give the database enough time to initialize
    await new Promise(resolve => setTimeout(resolve, 100))

    if (!this.preventStart) {
      await this.run()
    }
  }

  async stop(): Promise<void> {
    this.preventStart = true

    if (this.timer !== undefined) {
      clearTimeout(this.timer)
      this.timer = undefined
    }

    await this.database.close()
  }
}
