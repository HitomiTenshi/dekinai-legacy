import { IFile } from '.'

export interface IDatabase {
  adapter: IDatabaseAdapter
  addFile(file: IFile): void
  terminateFiles(): void
}

export interface IDatabaseAdapter {
  addFile(file: IFile): void
  terminateFiles(): void
}
