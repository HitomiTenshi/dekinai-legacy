import { Container } from 'inversify'
import { Config } from '.'
import { Middleware, Server, Util, Watchdog } from '..'
import { Database } from '../backend'
import { SQLiteAdapter } from '../backend/adapters'
import { IConfig, IUtil, IDatabase, IDatabaseAdapter, IMiddleware, IServer, IWatchdog } from '../interfaces'

const _container = new Container()

_container.bind<IConfig>('Config').to(Config).inSingletonScope()
_container.bind<IDatabase>('Database').to(Database).inSingletonScope()
_container.bind<IDatabaseAdapter>('SQLiteAdapter').to(SQLiteAdapter)
_container.bind<IUtil>('Util').to(Util)
_container.bind<IMiddleware>('Middleware').to(Middleware)
_container.bind<IServer>('Server').to(Server)
_container.bind<IWatchdog>('Watchdog').to(Watchdog)

export const container = _container
