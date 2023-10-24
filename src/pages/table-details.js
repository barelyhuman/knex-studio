import { TableActions } from '../components/TableActions.js'
import { TableList } from '../components/TableList.js'
import { TableView } from '../components/TableView.js'
import { MODES } from '../constants.js'
import { reactive } from '@arrow-js/core'
import { html } from '@arrow-js/core'
import _ from 'lodash'

const { pick } = _

export const state = reactive({
  tables: [],
  tableHeaders: [],
  tableRows: [],
  tableSearch: '',
  activeTableName: '',
  mode: MODES.DATA,
})

export const view = () => {
  return html`<div class="container mt-2">
    <div class="row">
      <div class="col-3">
        <div class="input-group flex-nowrap">
          <input
            @input="${e => (state.tableSearch = e.target.value)}"
            type="text"
            class="form-control"
            placeholder="Search"
            aria-label="Search Table"
            aria-describedby="addon-wrapping"
          />
        </div>
      </div>
      <div class="col-9">
        ${() =>
          TableActions({
            onToggleMode: mode => {
              const sp = new URLSearchParams()
              sp.append('mode', mode)
              window.location.search = sp
            },
            activeMode: state.mode,
          })}
      </div>
    </div>
    <div class="row mt-4">
      <div class="col-3">
        ${() =>
          TableList(state.tableSearch, state.tables, state.activeTableName)}
      </div>
      <div class="col-9">
        ${() =>
          TableView({
            headers: state.tableHeaders,
            rows: state.tableRows,
          })}
      </div>
    </div>
  </div>`
}

export const onServer = async ({ app, params, query }) => {
  const { tableName } = params
  const mode = query.mode || MODES.DATA
  state.activeTableName = tableName
  const tables = await app.functions.Database.getTables()
  state.tables = tables

  if (mode === MODES.DATA) {
    const headers = await app.functions.Database.getColumnHeaders(tableName)
    const data = await app.functions.Database.getTableData(tableName)

    const rowEntries = data.rows.map(x =>
      Object.entries(x)
        .sort((x, y) => {
          const keyA = x[0]
          const keyB = y[0]

          return headers.indexOf(keyA) - headers.indexOf(keyB)
        })
        .map(([x, y]) => y)
    )

    state.tableHeaders = headers
    state.tableRows = rowEntries
  }

  if (mode === MODES.STRUCT) {
    const columnInfo = await app.functions.Database.getTableStructure(tableName)
    const columns = columnInfo.map(x =>
      pick(x, [
        'column_name',
        'data_type',
        'has_auto_increment',
        'is_primary_key',
        'is_unique',
      ])
    )
    const structureRows = {
      headers: ['name', 'props'],
      rows: Object.entries(columns).map(([k, v]) => {
        let props = []

        props.push(`type:${v.data_type}`)

        if (v.has_auto_increment) {
          props.push('autoincrement')
        }
        if (v.is_primary_key) {
          props.push('primary')
        }
        if (v.is_unique) {
          props.push('unique')
        }

        return [v.column_name, props.join(', ')]
      }),
    }

    state.tableHeaders = structureRows.headers
    state.tableRows = structureRows.rows
  }
}

export const onClient = () => {
  const sp = new URLSearchParams(window.location.search)
  const mode = sp.get('mode') || MODES.DATA
  state.mode = mode
}
