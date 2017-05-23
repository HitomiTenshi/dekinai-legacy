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

  export function processFiles(): koa.Middleware {
    return async (ctx: koa.Context, next: () => Promise<any>) => {
      const files: fs.ReadStream[] = (ctx.request as any).files

      if (!files || files.length === 0) {
        ctx.status = 404
        return
      }

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

  export function validatePOST(): koa.Middleware {
    return async (ctx: koa.Context, next: () => Promise<any>) => {
      const post: POST = (ctx.request as any).body

      if (post.length !== undefined) {
        if (Config.randomString.forceDefaultLength && Config.strict) {
          fs.unlink(ctx.state.filepath, () => null)
          ctx.body = `Custom length denied, server is set to a randomString length of ${Config.randomString.defaultLength} for all files.`
          ctx.status = 403
          return
        }
        else if (!Config.randomString.forceDefaultLength) {
          const customLength = Number(post.length)

          if (!Number.isInteger(customLength)) {
            if (Config.strict) {
              fs.unlink(ctx.state.filepath, () => null)
              ctx.body = 'randomString length is not an integer.'
              ctx.status = 403
              return
            }
          }
          else if (customLength < Config.randomString.minLength || customLength > Config.randomString.maxLength) {
            if (Config.strict) {
              fs.unlink(ctx.state.filepath, () => null)
              ctx.body = `randomString length needs to be between ${Config.randomString.minLength} and ${Config.randomString.maxLength}.`
              ctx.status = 403
              return
            }
          }
          else {
            ctx.state.postLength = customLength
          }
        }
      }

      if (post.appendFilename !== undefined) {
        if (Config.filename.forceAppendFilename && Config.strict) {
          fs.unlink(ctx.state.filepath, () => null)
          ctx.body = `Custom appendFilename denied, server is set to ${Config.filename.appendFilename ? 'always' : 'never'} append filename.`
          ctx.status = 403
          return
        }
        else if (!Config.filename.forceAppendFilename) {
          if (!(post.appendFilename === 'true' || post.appendFilename === 'false')) {
            if (Config.strict) {
              fs.unlink(ctx.state.filepath, () => null)
              ctx.body = 'appendFilename can only be set to "true" or "false".'
              ctx.status = 403
              return
            }
          }
          else {
            ctx.state.postAppendFilename = post.appendFilename === 'true'
          }
        }
      }

      await next()
    }
  }

  export function checkExtension(): koa.Middleware {
    return async (ctx: koa.Context, next: () => Promise<any>) => {
      const extension = path.extname(ctx.state.originalFilename)

      if (!Util.isExtensionAllowed(extension)) {
        fs.unlink(ctx.state.filepath, () => null)
        ctx.body = `File type "${extension}" not allowed.`
        ctx.status = 403
        return
      }

      ctx.state.extension = extension

      await next()
    }
  }

  export function generateFilename(): koa.Middleware {
    return async (ctx: koa.Context, next: () => Promise<any>) => {
      const appendFilename = ctx.state.postAppendFilename
        ? ctx.state.postAppendFilename
        : Config.filename.appendFilename

      const length = ctx.state.postLength
        ? ctx.state.postLength
        : Config.randomString.defaultLength

      const extension: string = appendFilename
        ? Config.filename.separator + ctx.state.originalFilename
        : ctx.state.extension

      ctx.state.filename = await Util.getRandomFilename(length, extension)

      if (ctx.state.filename === null) {
        fs.unlink(ctx.state.filepath, () => null)
        ctx.body = 'All generated filenames were taken. Try increasing randomString length.'
        ctx.status = 409
        return
      }

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
