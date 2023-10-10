import _ from 'lodash'

const { pick } = _

export default function routeRegister(app) {
  const router = app.router

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
}
