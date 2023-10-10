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
      const headers = await app.functions.Database.getColumnHeaders(
        req.params.tableName
      )
      const data = await app.functions.Database.getTableData(
        req.params.tableName
      )
      return res.send({
        headers,
        data,
      })
    } catch (err) {
      console.error(err)
    }
  })
}
