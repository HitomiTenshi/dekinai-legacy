export interface IServer {
  start(): void
  stop(): Promise<void>
}
