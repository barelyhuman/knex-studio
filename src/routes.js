import { hash } from './lib/hash.js'
import { clientRender } from './lib/plugins/esbuild-client-render.js'
import routeConfig from './routes.config.js'
import { html } from '@arrow-js/core'
import { renderToString } from 'arrow-render-to-string'
import esbuild from 'esbuild'
import { readFile } from 'fs/promises'
import _ from 'lodash'
import { basename, join } from 'path'

const { pick } = _

let baseLayoutHTML

export default async function routeRegister(app) {
  baseLayoutHTML = await readFile(
    join(app.sourceDirectory, 'www/index.html'),
    'utf8'
  )

  const router = app.router

  await registerFromConfig(app)

  router.get('/api/tables', async (req, res) => {
    try {
      const tables = await app.functions.Database.getTables()
      return res.send({ tables })
    } catch (err) {
      console.error(err)
    }
  })

  router.get('/api/tables/:tableName/info', async (req, res) => {
    try {
      const tableName = req.params.tableName
      const headers = await app.functions.Database.getColumnHeaders(tableName)
      const data = await app.functions.Database.getTableData(tableName)
      const columnInfo =
        await app.functions.Database.getTableStructure(tableName)

      const columns = columnInfo.map(x =>
        pick(x, [
          'column_name',
          'data_type',
          'has_auto_increment',
          'is_primary_key',
          'is_unique',
        ])
      )

      return res.send({
        headers,
        data,
        columns,
      })
    } catch (err) {
      console.error(err)
    }
  })

  router.post('/api/exec', async (req, res) => {
    const query = req.body
    // TODO: santize query , parse and break down based on the connection information

    const rows = await app.functions.Database.runRawQuery(query)
    let headers = []

    rows.forEach(row => {
      headers = headers.concat([...Object.keys(row)]).flat(2)
    })

    return res.send({
      headers: [...new Set(headers)],
      rows: rows,
    })
  })
}

async function registerFromConfig(app) {
  const pathMappers = Object.entries(routeConfig).map(
    async ([path, componentPath]) => {
      const _componentPath = join(app.sourceDirectory, componentPath)
      const componentModule = await import(_componentPath)
      const _hashedName = hash(_componentPath)
      const islandsOutFile = join(
        app.sourceDirectory,
        'www',
        'dist',
        'islands',
        '' + _hashedName + '.js'
      )

      // 1st pass, remove node deps and build
      await esbuild.build({
        entryPoints: [_componentPath],
        bundle: true,
        outfile: islandsOutFile,
        platform: 'node',
        minify: true,
        format: 'esm',
        treeShaking: true,
        plugins: [clientRender()],
      })

      // 2nd pass, build specifically for the browser
      await esbuild.build({
        entryPoints: [islandsOutFile],
        bundle: true,
        allowOverwrite: true,
        outfile: islandsOutFile,
        platform: 'browser',
        minify: true,
        format: 'esm',
        treeShaking: true,
        plugins: [],
      })

      app.router.get(path, async (request, reply) => {
        const meta = {
          path: join('/', 'islands', basename(islandsOutFile)),
          state: componentModule.state,
        }

        'onServer' in componentModule &&
          (await componentModule.onServer({
            app,
            params: request.params,
            query: request.query,
          }))

        const _wrapper = html` ${componentModule.view()} `
        const finalTmp = baseLayoutHTML
          .replace('%app%', renderToString(_wrapper))
          .replace(
            '%scripts%',
            `
              <script type="text/json" id="_meta">
                ${JSON.stringify(meta)}
              </script>
            `
          )
        reply.header(`content-type`, 'text/html')
        reply.send(finalTmp)
      })
    }
  )

  await Promise.all(pathMappers)
}
