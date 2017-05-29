import { injectable, inject } from 'inversify'
import * as http from 'http'
import * as koa from 'koa'
const httpShutdown = require('http-shutdown')
const uploader = require('koa-busboy')

import { IConfig, IMiddleware, IServer } from './interfaces'

@injectable()
export class Server implements IServer {
  private readonly app = new koa()
  private server?: http.Server

  constructor(
    @inject('Config') private config: IConfig,
    @inject('Middleware') middleware: IMiddleware) {
      this.app.use(middleware.onlyAllowPOST())
      this.app.use(uploader({ dest: config.tempDir }))
      this.app.use(middleware.processFiles())
      this.app.use(middleware.validatePOST())
      this.app.use(middleware.checkExtension())
      this.app.use(middleware.generateFilename())
      this.app.use(middleware.resolveUrl())
  }

  start(): void {
    this.server = httpShutdown(http.createServer(this.app.callback()))
    this.server!.listen(this.config.port)
    console.log(`Listening on port ${this.config.port}`)
  }

  stop(): Promise<void> {
    if (this.server === undefined) {
      throw new Error('Cannot stop server. Server is not running.')
    }

    return new Promise<void>(resolve => {
      (this.server as any).shutdown(resolve)
    })
  }
}
