import { TableActions } from '../components/TableActions.js'
import { TableList } from '../components/TableList.js'
import { TableView } from '../components/TableView.js'
import { html, reactive } from '@arrow-js/core'

export const state = reactive({
  tables: [],
  input: '',
  tableHeaders: [],
  tableRows: [],
  tableSearch: '',
  activeTableName: '',
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
        <div class="form-floating">
          <textarea
            class="form-control"
            placeholder="RAW SQL"
            id="rawsql"
            style="height: 100px"
            @input="${e => (state.input = e.target.value)}"
          >
${state.input}</textarea
          >
          <label for="rawsql" class="text-secondary">SQL</label>
        </div>
        <div class="mt-2 d-flex justify-content-end">
          <button
            class="btn btn-primary"
            @click="${() => {
              const sp = new URLSearchParams()
              const queryInput = document.getElementById('rawsql').value
              sp.append('sql', queryInput)
              window.location.search = sp
            }}"
          >
            Run
          </button>
        </div>
      </div>
    </div>
    <div class="row mt-4">
      <div class="col-3"></div>
      <div class="col-9">
        ${() =>
          state.tableHeaders.length
            ? TableView({
                headers: state.tableHeaders,
                rows: state.tableRows,
              })
            : html`<div class="card">
                <div class="card-body">
                  <p class="text-center text-secondary m-0 p-0">No Data</p>
                </div>
              </div>`}
      </div>
    </div>
  </div>`
}

export const onServer = async ({ app, params, query }) => {
  const { sql } = query

  const tables = await app.functions.Database.getTables()
  state.tables = tables

  if (!sql) {
    return
  }

  const rows = await app.functions.Database.runRawQuery(sql)
  let headers = []

  rows.forEach(row => {
    headers = headers.concat([...Object.keys(row)]).flat(2)
  })

  const rowEntries = rows.map(x =>
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

export const onClient = () => {
  const sp = new URLSearchParams(window.location.search)
  state.input = sp.get('sql') || ''
}
