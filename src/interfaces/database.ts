import { IFile } from '.'

export interface IDatabaseAdapter {
  addFile(file: IFile): Promise<void>
  terminateFiles(): Promise<void>
}

export interface IDatabase extends IDatabaseAdapter {
  adapter: IDatabaseAdapter
}
