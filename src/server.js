import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import fastifyStatic from '@fastify/static'
import view from '@fastify/view'
import fastify from 'fastify'
import njk from 'nunjucks'
import dbPlugin from './plugins/db.js'
import viewPlugin from './plugins/view.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function createServer(knexInstance) {
  const app = fastify()

  app.register(fastifyStatic, {
    root: join(__dirname, '_public'),
    prefix: '/_public',
  })

  app.register(view, {
    propertyName: '_view',
    engine: {
      nunjucks: njk,
    },
    templates: [join(__dirname, './views')],
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
