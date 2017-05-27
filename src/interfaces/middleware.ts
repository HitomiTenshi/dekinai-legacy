import * as koa from 'koa'

export interface IMiddleware {
  onlyAllowPOST(): koa.Middleware
  processFiles(): koa.Middleware
  validatePOST(): koa.Middleware
  checkExtension(): koa.Middleware
  generateFilename(): koa.Middleware
  resolveUrl(): koa.Middleware
}
