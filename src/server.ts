import { injectable, inject } from 'inversify'
import * as http from 'http'
import * as koa from 'koa'
const httpShutdown = require('http-shutdown')
const uploader = require('koa-busboy')

import { IConfig, IMiddleware, IServer, IWatchdog } from './interfaces'

@injectable()
export class Server implements IServer {
  private readonly app = new koa()
  server?: http.Server

  constructor(
    @inject('Config') private config: IConfig,
    @inject('Watchdog') public watchdog: IWatchdog,
    @inject('Middleware') middleware: IMiddleware) {
      this.app.use(middleware.onlyAllowPOST())
      this.app.use(uploader({ dest: config.tempDir }))
      this.app.use(middleware.processFiles())
      this.app.use(middleware.validatePOST())
      this.app.use(middleware.checkExtension())
      this.app.use(middleware.generateFilename())
      this.app.use(middleware.resolveUrl())
  }

  async start(): Promise<void> {
    // Start watchdog when temporary storage is not force-disabled
    if (!(this.config.temporaryStorage.forceDefaultEnabled && !this.config.temporaryStorage.defaultEnabled)) {
      await this.watchdog.start()
    }

    // Start server
    this.server = httpShutdown(http.createServer(this.app.callback()))
    this.server!.listen(this.config.port)
  }

  async stop(): Promise<void> {
    if (this.server !== undefined) {
      // Stop watchdog when temporary storage is not force-disabled
      if (!(this.config.temporaryStorage.forceDefaultEnabled && !this.config.temporaryStorage.defaultEnabled)) {
        await this.watchdog.stop()
      }

      // Stop server
      await new Promise(resolve => (this.server as any).shutdown(resolve))
      this.server = undefined
    }
    else {
      throw Error('Server has not been started.')
    }
  }
}
