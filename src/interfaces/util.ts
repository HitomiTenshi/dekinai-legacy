export interface IUtil {
  isExtensionAllowed(extension: string): boolean
  getRandomFilename(length: number, filename: string, extension: string, appendFilename: boolean, tryCount?: number): Promise<string | null>
}
