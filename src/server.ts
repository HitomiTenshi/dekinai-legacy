import * as koa from 'koa'
const uploader = require('koa-busboy')

import { Middleware } from './middleware'
import { Config } from './config'

export class Server {
  private readonly app = new koa()

  constructor() {
    this.app.use(Middleware.onlyAllowPOST())
    this.app.use(uploader({ dest: Config.tempDir }))
    this.app.use(Middleware.checkFiles())
    this.app.use(Middleware.processFiles())
    this.app.use(Middleware.validatePOST())
    this.app.use(Middleware.checkExtension())
    this.app.use(Middleware.generateFilename())
    this.app.use(Middleware.resolveUrl())
  }

  start(): void {
    this.app.listen(Config.port);
    console.log(`Listening on port ${Config.port}`);
  }
}
