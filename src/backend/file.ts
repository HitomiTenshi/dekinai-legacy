import { IFile } from '../interfaces'

export class File implements IFile {
  constructor(
    public terminationTime: number,
    public filename: string) { }
}
