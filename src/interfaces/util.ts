export interface IUtil {
  isExtensionAllowed(extension: string): boolean
  getRandomFilename(length: number, extension: string, tryCount?: number): Promise<string | null>
}
