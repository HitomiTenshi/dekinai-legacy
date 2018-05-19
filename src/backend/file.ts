import { IFile } from '../interfaces/file'

export class File implements IFile {
  constructor(
    public terminationTime: number,
    public filename: string) { }
}
