export interface IWatchdog {
  start(): Promise<void>
  stop(): Promise<void>
}
