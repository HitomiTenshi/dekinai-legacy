import 'reflect-metadata'

import { container } from './src/configuration/ioc'
import { IConfig } from './src/interfaces/config'
import { IServer } from './src/interfaces/server'

const config = container.get<IConfig>('Config')
const server = container.get<IServer>('Server')

server.start().then(() => console.log(`Listening on port ${config.port}`))

let isShuttingDown = false

process.on('SIGINT', async () => {
  if (!isShuttingDown) {
    isShuttingDown = true
    await server.stop()
    process.exit()
  }
})
