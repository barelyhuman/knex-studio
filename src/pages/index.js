import { TableActions } from '../components/TableActions.js'
import { TableList } from '../components/TableList.js'
import { html, reactive } from '@arrow-js/core'

export const state = reactive({
  tables: [],
  activeTableName: '',
  tableSearch: '',
})

export const view = () => {
  return html`
    <div class="container mt-2">
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
        <div class="col-9">${() => TableActions()}</div>
        <div class="row mt-4">
          <div class="col-3">
            ${() =>
              TableList(state.tableSearch, state.tables, state.activeTableName)}
          </div>
          <div class="col-9">
            <div class="card">
              <div class="card-body">
                <p class="text-center text-secondary m-0 p-0">
                  No Table Selected
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

export const onServer = async ({ app }) => {
  const tables = await app.functions.Database.getTables()
  state.tables = tables
}
