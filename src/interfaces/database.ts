import { IFile } from '.'

export interface IDatabaseAdapter {
  open(): Promise<void>
  close(): Promise<void>
  addFile(file: IFile): Promise<void>
  terminateFiles(): Promise<void>
}

export interface IDatabase extends IDatabaseAdapter {
  readonly adapter?: IDatabaseAdapter
}
