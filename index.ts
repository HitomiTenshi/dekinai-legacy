import 'reflect-metadata'

import { container } from './src/configuration'
import { IServer } from './src/interfaces'

const server = container.get<IServer>('Server')
server.start()

process.on('SIGINT', async () => {
  await server.stop()
})
