import * as fs from 'fs'
import * as util from 'util'

export const fsRename = util.promisify(fs.rename);
export const fsExists = util.promisify(fs.exists);
