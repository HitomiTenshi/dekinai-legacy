export interface IWatchdog {
  isRunning: boolean
  start(): Promise<void>
  stop(): Promise<void>
}
