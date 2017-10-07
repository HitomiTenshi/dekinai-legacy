import { Container } from 'inversify'

import { Config } from '.'
import { Middleware, Server, Util, Watchdog } from '..'
import { Database } from '../backend'
import { SQLiteAdapter } from '../backend/adapters'
import { IConfig, IUtil, IDatabase, IDatabaseAdapter, IMiddleware, IServer, IWatchdog } from '../interfaces'

export function createContainer(testConfig?: IConfig): Container {
  const container = new Container()

  if (testConfig !== undefined) {
    container.bind<IConfig>('Config').toConstantValue(testConfig)
  }
  else {
    container.bind<IConfig>('Config').to(Config).inSingletonScope()
  }

  container.bind<IDatabase>('Database').to(Database).inSingletonScope()
  container.bind<IDatabaseAdapter>('SQLiteAdapter').to(SQLiteAdapter)
  container.bind<IUtil>('Util').to(Util)
  container.bind<IMiddleware>('Middleware').to(Middleware)
  container.bind<IServer>('Server').to(Server)
  container.bind<IWatchdog>('Watchdog').to(Watchdog)

  return container
}

export const container = createContainer()
