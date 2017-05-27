import { injectable, inject } from 'inversify'
import * as koa from 'koa'
const uploader = require('koa-busboy')

import { IConfig, IMiddleware, IServer } from './interfaces'

@injectable()
export class Server implements IServer {
  private readonly app = new koa()

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
    this.app.listen(this.config.port)
    console.log(`Listening on port ${this.config.port}`)
  }
}
