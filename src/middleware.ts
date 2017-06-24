import { injectable, inject } from 'inversify'
import * as fs from 'fs'
import * as util from 'util'
import * as path from 'path'
import * as url from 'url'
import * as koa from 'koa'

import { IConfig, IDatabase, IUtil, IMiddleware, IPOST } from './interfaces'
import { File } from './backend'

const rename = util.promisify(fs.rename) as (oldPath: string, newPath: string) => Promise<void>

@injectable()
export class Middleware implements IMiddleware {
  constructor(
    @inject('Config') private config: IConfig,
    @inject('Database') private database: IDatabase,
    @inject('Util') private util: IUtil) { }

  onlyAllowPOST(): koa.Middleware {
    return async (ctx: koa.Context, next: () => Promise<any>) => {
      if (ctx.method !== 'POST') {
        ctx.status = 404
        return
      }

      await next()
    }
  }

  processFiles(): koa.Middleware {
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
        if (this.config.strict) {
          for (const file of files) {
            fs.unlink(file.path, () => null)
          }

          ctx.body = 'Uploading multiple files is not supported, please upload only one file.'
          ctx.status = 403
          return
        }

        for (let i = 1; i < files.length; i++) {
          fs.unlink(files[i].path, () => null)
        }
      }

      ctx.state.originalFilename = (files[0] as any).filename
      ctx.state.filepath = files[0].path

      await next()
    }
  }

  validatePOST(): koa.Middleware {
    return async (ctx: koa.Context, next: () => Promise<any>) => {
      const post: IPOST = (ctx.request as any).body

      if (post.temporary !== undefined) {
        if (this.config.temporaryStorage.forceDefaultEnabled) {
          if (this.config.strict) {
            fs.unlink(ctx.state.filepath, () => null)
            ctx.body = `Custom temporary setting denied, server is set to save all files ${this.config.temporaryStorage.defaultEnabled ? 'temporarily' : 'forever'}.`
            ctx.status = 403
            return
          }
        }
        else {
          if (!(post.temporary === 'true' || post.temporary === 'false')) {
            if (this.config.strict) {
              fs.unlink(ctx.state.filepath, () => null)
              ctx.body = 'Custom temporary setting can only be set to "true" or "false".'
              ctx.status = 403
              return
            }
          }
          else {
            ctx.state.postTemporary = post.temporary === 'true'
          }
        }
      }

      if (post.TTL !== undefined) {
        if (this.config.temporaryStorage.forceDefaultEnabled && !this.config.temporaryStorage.defaultEnabled) {
          if (this.config.strict) {
            fs.unlink(ctx.state.filepath, () => null)
            ctx.body = 'Custom TTL setting denied, temporary storage is disabled on this server.'
            ctx.status = 403
            return
          }
        }
        else if (this.config.temporaryStorage.forceDefaultTTL) {
          if (this.config.strict) {
            fs.unlink(ctx.state.filepath, () => null)
            ctx.body = `Custom TTL denied, server is set to a TTL duration of ${this.config.temporaryStorage.defaultTTL} seconds for all files.`
            ctx.status = 403
            return
          }
        }
        else {
          const customTTL = Number(post.TTL)

          if (!Number.isInteger(customTTL)) {
            if (this.config.strict) {
              fs.unlink(ctx.state.filepath, () => null)
              ctx.body = 'Custom TTL is not an integer.'
              ctx.status = 403
              return
            }
          }
          else if (customTTL < this.config.temporaryStorage.minTTL || customTTL > this.config.temporaryStorage.maxTTL) {
            if (this.config.strict) {
              fs.unlink(ctx.state.filepath, () => null)
              ctx.body = `Custom TTL needs to be between ${this.config.temporaryStorage.minTTL} and ${this.config.temporaryStorage.maxTTL} seconds.`
              ctx.status = 403
              return
            }
          }
          else {
            if (ctx.state.postTemporary === false) {
              if (this.config.strict) {
                fs.unlink(ctx.state.filepath, () => null)
                ctx.body = 'Custom temporary setting must be "true" when custom TTL is defined.'
                ctx.status = 403
                return
              }
            }

            ctx.state.postTemporary = true
            ctx.state.postTTL = customTTL
          }
        }
      }

      if (post.length !== undefined) {
        if (this.config.randomString.forceDefaultLength) {
          if (this.config.strict) {
            fs.unlink(ctx.state.filepath, () => null)
            ctx.body = `Custom length denied, server is set to a randomString length of ${this.config.randomString.defaultLength} for all files.`
            ctx.status = 403
            return
          }
        }
        else {
          const customLength = Number(post.length)

          if (!Number.isInteger(customLength)) {
            if (this.config.strict) {
              fs.unlink(ctx.state.filepath, () => null)
              ctx.body = 'Custom length is not an integer.'
              ctx.status = 403
              return
            }
          }
          else if (customLength < this.config.randomString.minLength || customLength > this.config.randomString.maxLength) {
            if (this.config.strict) {
              fs.unlink(ctx.state.filepath, () => null)
              ctx.body = `Custom length needs to be between ${this.config.randomString.minLength} and ${this.config.randomString.maxLength}.`
              ctx.status = 403
              return
            }
          }
          else {
            ctx.state.postLength = customLength
          }
        }
      }

      if (post.append !== undefined) {
        if (this.config.filename.forceDefaultAppendFilename) {
          if (this.config.strict) {
            fs.unlink(ctx.state.filepath, () => null)
            ctx.body = `Custom append setting denied, server is set to ${this.config.filename.defaultAppendFilename ? 'always' : 'never'} append filenames.`
            ctx.status = 403
            return
          }
        }
        else {
          if (!(post.append === 'true' || post.append === 'false')) {
            if (this.config.strict) {
              fs.unlink(ctx.state.filepath, () => null)
              ctx.body = 'Custom append setting can only be set to "true" or "false".'
              ctx.status = 403
              return
            }
          }
          else {
            ctx.state.postAppend = post.append === 'true'
          }
        }
      }

      await next()
    }
  }

  checkExtension(): koa.Middleware {
    return async (ctx: koa.Context, next: () => Promise<any>) => {
      const extension = path.extname(ctx.state.originalFilename)

      if (!this.util.isExtensionAllowed(extension)) {
        fs.unlink(ctx.state.filepath, () => null)
        ctx.body = `File type "${extension}" is not allowed.`
        ctx.status = 403
        return
      }

      ctx.state.extension = extension

      await next()
    }
  }

  generateFilename(): koa.Middleware {
    return async (ctx: koa.Context, next: () => Promise<any>) => {
      const appendFilename: boolean = ctx.state.postAppend !== undefined
        ? ctx.state.postAppend
        : this.config.filename.defaultAppendFilename

      const length: number = ctx.state.postLength !== undefined
        ? ctx.state.postLength
        : this.config.randomString.defaultLength

      const extension: string = appendFilename
        ? [this.config.filename.separator, ctx.state.originalFilename].join()
        : ctx.state.extension

      ctx.state.filename = await this.util.getRandomFilename(length, extension)

      if (ctx.state.filename === null) {
        fs.unlink(ctx.state.filepath, () => null)
        ctx.body = 'All generated filenames were taken. Try increasing randomString length.'
        ctx.status = 409
        return
      }

      await next()
    }
  }

  resolveUrl(): koa.Middleware {
    return async (ctx: koa.Context) => {
      await rename(ctx.state.filepath, path.join(this.config.uploadDir, ctx.state.filename))

      const temporary: boolean = ctx.state.postTemporary !== undefined
        ? ctx.state.postTemporary
        : this.config.temporaryStorage.defaultEnabled

      if (temporary) {
        const TTL: number = ctx.state.postTTL !== undefined
          ? ctx.state.postTTL
          : this.config.temporaryStorage.defaultTTL

        this.database.addFile(new File(Date.now() + TTL * 1000, ctx.state.filename))
      }

      ctx.body = url.resolve(this.config.uploadUrl, ctx.state.filename)
      ctx.status = 200
    }
  }
}
