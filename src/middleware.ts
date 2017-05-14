import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'
import * as koa from 'koa'

import { Config } from './config'
import { Util } from './util'
import { POST } from './interfaces/post'

export module Middleware {
  export function onlyAllowPOST(): koa.Middleware {
    return async (ctx: koa.Context, next: () => Promise<any>) => {
      if (ctx.method !== 'POST') {
        ctx.status = 404
        return
      }

      await next()
    }
  }

  export function checkFiles(): koa.Middleware {
    return async (ctx: koa.Context, next: () => Promise<any>) => {
      const files: fs.ReadStream[] = (ctx.request as any).files

      if (!files || files.length === 0) {
        ctx.status = 404
        return
      }

      await next()
    }
  }

  export function processFiles(): koa.Middleware {
    return async (ctx: koa.Context, next: () => Promise<any>) => {
      const files: fs.ReadStream[] = (ctx.request as any).files

      for (const file of files) {
        file.close()
      }

      if (files.length > 1) {
        for (let i = 1; i < files.length; i++) {
          fs.unlink(files[i].path, () => null)
        }
      }

      ctx.state.originalFilename = (files[0] as any).filename
      ctx.state.filepath = files[0].path

      await next()
    }
  }

  export function checkExtension(): koa.Middleware {
    return async (ctx: koa.Context, next: () => Promise<any>) => {
      const extension = path.extname(ctx.state.originalFilename)

      if (!Util.isExtensionAllowed(extension)) {
        fs.unlink(ctx.state.filepath, () => null)
        ctx.body = 'File type not allowed.'
        ctx.status = 403
        return
      }

      ctx.state.extension = extension

      await next()
    }
  }

  export function generateFilename(): koa.Middleware {
    return async (ctx: koa.Context, next: () => Promise<any>) => {
      const post: POST = (ctx.request as any).body
      let length = Config.randomString.defaultLength

      let extension: string = Config.filename.appendFilename
        ? Config.filename.separator + ctx.state.originalFilename
        : ctx.state.extension

      if (!Config.randomString.forceDefaultLength) {
        const customLength = Number(post.length)

        if (!isNaN(customLength) && customLength >= Config.randomString.minLength && customLength <= Config.randomString.maxLength) {
          length = customLength
        }
      }

      if (!Config.filename.forceAppendFilename) {
        if (post.appendFilename !== undefined) {
          switch (post.appendFilename) {
            case 'true':
              extension = Config.filename.separator + ctx.state.originalFilename
              break
            case 'false':
              extension = ctx.state.extension
              break
            default:
              break
          }
        }
      }

      ctx.state.filename = await Util.getRandomFilename(length, extension)

      await next()
    }
  }

  export function resolveUrl(): koa.Middleware {
    return (ctx: koa.Context) => {
      fs.rename(ctx.state.filepath, path.join(Config.uploadDir, ctx.state.filename), () => null)
      ctx.body = url.resolve(Config.uploadUrl, ctx.state.filename)
      ctx.status = 200
    }
  }
}
