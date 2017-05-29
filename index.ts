import 'reflect-metadata'

import { container } from './src/configuration'
import { IConfig, IServer, IWatchdog } from './src/interfaces'

const config = container.get<IConfig>('Config')
const server = container.get<IServer>('Server')
const watchdog = container.get<IWatchdog>('Watchdog')

server.start()

if (!(config.temporaryStorage.forceDefaultEnabled && !config.temporaryStorage.defaultEnabled)) {
  watchdog.start()
}

process.on('SIGINT', async () => {
  await server.stop()

  if (watchdog.isRunning) {
    await watchdog.stop()
  }
})
