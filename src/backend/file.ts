import { IFile } from '../interfaces'

export class File implements IFile {
  constructor(
    public terminationDate: Date,
    public filename: string) { }
}
