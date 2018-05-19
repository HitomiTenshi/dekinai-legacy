import { Container } from 'inversify'

import { Config } from './config'
import { Middleware } from '../middleware'
import { Server } from '../server'
import { Util } from '../util'
import { Watchdog } from '../watchdog'
import { Database } from '../backend/database'
import { SQLiteAdapter } from '../backend/adapters/sqlite-adapter'
import { IConfig } from '../interfaces/config'
import { IUtil } from '../interfaces/util'
import { IDatabase, IDatabaseAdapter } from '../interfaces/database'
import { IMiddleware } from '../interfaces/middleware'
import { IServer } from '../interfaces/server'
import { IWatchdog } from '../interfaces/watchdog'

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
