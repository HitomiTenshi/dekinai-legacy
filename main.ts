import 'reflect-metadata'

import { container } from './src/configuration'
import { IServer, IConfig } from './src/interfaces'

const config = container.get<IConfig>('Config')
const server = container.get<IServer>('Server')

server.start().then(() => console.log(`Listening on port ${config.port}`))

let isShuttingDown = false

process.on('SIGINT', async () => {
  if (!isShuttingDown) {
    isShuttingDown = true
    await server.stop()
    container.unbindAll()
  }
})
