import { fileURLToPath } from 'url'
import fastifyStatic from '@fastify/static'
import view from '@fastify/view'
import fastify from 'fastify'
import njk from 'nunjucks'
import dbPlugin from './plugins/db.js'
import viewPlugin from './plugins/view.js'

export function createServer(knexInstance) {
  const app = fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    },
  })

  app.register(fastifyStatic, {
    root: fileURLToPath(new URL('assets', import.meta.url)),
    prefix: '/assets',
  })

  app.register(view, {
    propertyName: '_view',
    engine: {
      nunjucks: njk,
    },
    templates: [fileURLToPath(new URL('views', import.meta.url))],
  })

  app.register(viewPlugin).register(dbPlugin, {
    knexInstance: knexInstance,
  })

  app.get('/raw', async (req, res) => {
    const tables = await app.dbSchemaInspector.tables()
    return res.view('raw.njk', { tables, data: [] })
  })

  app.post('/api/raw', async (req, res) => {
    const data = req.body
    const query = Buffer.from(data, 'base64url').toString('utf8')
    const result = await app.db
      .raw(query)
      .then(d => {
        return {
          success: true,
          data: d,
        }
      })
      .catch(err => {
        return { success: false, error: { message: err.message } }
      })

    if (!result.success) {
      res.code(400)
      return result
    }

    if (!result.data.length) {
      return { success: true, headings: [], data: [] }
    }

    const headings = [...Object.keys(result.data[0])]
    const dataWithoutHeadings = result.data.map(d => headings.map(h => d[h]))

    return { success: true, headings, data: dataWithoutHeadings }
  })

  app.get('/', async (req, res) => {
    const query = req.query
    const tableName = query.tableName ?? ''
    let columns = []
    let data = []
    if (tableName) {
      columns = await app.dbSchemaInspector.columnInfo(tableName)
      data = await app.db(tableName).where({})
    }

    const tables = await app.dbSchemaInspector.tables()
    return res.view('index.njk', { tables, columns, data })
  })

  return app
}
