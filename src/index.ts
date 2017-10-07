import * as fs from 'fs'
import * as util from 'util'

export * from './middleware'
export * from './server'
export * from './util'
export * from './watchdog'

export const fsRename = util.promisify(fs.rename);
export const fsExists = util.promisify(fs.exists);
