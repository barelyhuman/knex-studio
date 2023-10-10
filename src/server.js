import DatabaseAdaptorKnex from './adaptors/database-knex.js'
import { app } from './app.js'
import routeRegister from './routes.js'
import fstatic from '@fastify/static'
import fastify from 'fastify'
import { createReadStream } from 'node:fs'
import { join } from 'node:path'

const defaults = {
  port: 4321,
}

export const createServer = _knexInstance => {
  const server = fastify()
  app.server = server
  app.router = server
  app.knex = _knexInstance

  app.addModule(DatabaseAdaptorKnex).addModule(routeRegister)

  /**
   * @params {number} port
   */
  return async port => {
    const _port = port || defaults.port

    await app.loadModules()

    server.register(fstatic, {
      wildcard: false,
      root: join(app.sourceDirectory, 'www/dist'),
    })

    server.get('/*', (req, res) => {
      res.send(createReadStream(join(app.sourceDirectory, 'www/index.html')))
    })

    await server.listen({
      port: _port,
    })
    process.stdout.write(`Listening on http://localhost:${_port}\n`)
  }
}
