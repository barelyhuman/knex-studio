import _knex from 'knex'
import { SchemaInspector } from 'knex-schema-inspector'

function getInspector(db) {
  const inspector = SchemaInspector(db)
  return inspector
}

export default function DatabaseAdaptorKnex(app) {
  // Namespace the adaptor to the same namespace
  // that other adaptors might use
  const _ = {}
  app.functions.Database = _

  /**@type {import("knex").Knex}*/
  const db = app.knex

  // if (!(db instanceof _knex)) {
  //   throw new Error('Invalid connection received');
  // }

  _.getTables = async () => {
    const tables = await getInspector(db).tables()
    return tables
  }

  _.getColumnHeaders = async tableName => {
    const colData = await getInspector(db).columns(tableName)
    return colData.map(x => x.column)
  }

  _.getTableStructure = async tableName => {
    const colData = await getInspector(db).columns(tableName)
    const columnInfo = await Promise.all(
      colData.map(async x => {
        const colInfo = await getInspector(db).columnInfo(tableName, x.column)
        colInfo.column_name = colInfo.name
        return colInfo
      })
    )

    return columnInfo
  }

  _.getTableData = async tableName => {
    const offset = 0
    const limit = 10
    const rows = await db(tableName).where({}).offset(offset).limit(limit)
    const total = await db(tableName).count('* as count').first()
    return {
      meta: {
        total: total.count,
      },
      rows,
    }
  }
}
