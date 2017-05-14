import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'
import * as koa from 'koa'

import { Config } from './config'
import { Util } from './util'

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

      ctx.state.filepath = files[0].path

      await next()
    }
  }

  export function checkExtension(): koa.Middleware {
    return async (ctx: koa.Context, next: () => Promise<any>) => {
      const filepath: string = ctx.state.filepath
      const extension = path.extname(filepath)

      if (!Util.isExtensionAllowed(extension)) {
        fs.unlink(filepath, () => null)
        ctx.body = 'File type not allowed.'
        ctx.status = 403
        return
      }

      ctx.state.extension = extension

      await next()
    }
  }

  export function resolveUrl(): koa.Middleware {
    return async (ctx: koa.Context) => {
      const filepath: string = ctx.state.filepath
      const extension: string = ctx.state.extension
      const filename = await Util.getRandomFilename(extension)

      fs.rename(filepath, path.join(Config.uploadDir, filename), () => null)
      ctx.body = url.resolve(Config.uploadUrl, filename)
      ctx.status = 200
    }
  }
}
