import { reactive } from '@arrow-js/core'
import { html } from '@arrow-js/core'

// Model
const pageState = reactive({
  activeTableName: '',
  tableSearch: '',
  headers: [],
  tables: [],
  rows: [],
  total: 0,
  page: 1,
})

// View
const TableLink = ({ name } = {}) => {
  const sp = new URLSearchParams()
  sp.append('tableName', name)
  const activeClass =
    pageState.activeTableName === name
      ? 'font-semibold text-zinc-900'
      : 'text-zinc-500'
  return html`<a href="/tables?${sp}"
    ><li class="${activeClass} text-sm px-3 py-2 hover:bg-zinc-100">
      ${name}
    </li></a
  >`
}

const TableListCard = html`<div class="bg-white flex flex-col gap-2">
  <div>
    <input
      type="text"
      class="bg-gray-50 border border-gray-100 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
      placeholder="Search"
      @input="${onTableSearch}"
    />
  </div>
  <div>
    <ul class="flex flex-col gap-2">
      ${() => {
        const filteredTables = pageState.tables.filter(x =>
          pageState.tableSearch ? x.startsWith(pageState.tableSearch) : true
        )
        return filteredTables.map(x => TableLink({ name: x }))
      }}
    </ul>
  </div>
</div>`

const TableHeader = ({ label = '' } = {}) =>
  html`<th scope="col" class="px-6 border border-zinc-100 py-3">${label}</th>`

const TableRows = ({ data = [] } = {}) =>
  data.map(rowItem => {
    const keys = Object.keys(rowItem).sort((x, y) => {
      return pageState.headers.indexOf(x) - pageState.headers.indexOf(y)
    })
    return html`<tr class="bg-white hover:bg-zinc-100 border-b">
      ${() =>
        keys.map(
          k =>
            html`<td class="border border-zinc-100 px-6 py-4">
              ${rowItem[k]}
            </td>`
        )}
    </tr>`
  })

const TableDisplay = html`<div class="flex-[5] relative p-2 overflow-x-auto">
  <table class="w-full border-collapse text-sm text-left text-zinc-500">
    <thead class="text-xs text-zinc-700 bg-zinc-50">
      <tr>
        ${() => pageState.headers.map(x => TableHeader({ label: x }))}
      </tr>
    </thead>
    <tbody>
      ${() => TableRows({ data: pageState.rows })}
    </tbody>
  </table>
</div>`

export const Page = html`
  <div class="flex gap-1">
    <div class="flex-1 p-2 max-w-[250px]">${TableListCard}</div>
    ${() => (pageState.activeTableName ? TableDisplay : html``)}
  </div>
`

// Controller
export async function init() {
  await fetchTables()
  const query = new URLSearchParams(document.location.search)
  const tableName = query.get('tableName')
  if (tableName) {
    pageState.activeTableName = tableName
    await fetchTableData(tableName)
  }
}

async function fetchTableData(tableName) {
  const info = await fetch(`/api/tables/${tableName}/info`).then(d => d.json())
  pageState.headers = info.headers
  pageState.rows = info.data.rows
  console.log({ info })
}

async function fetchTables() {
  try {
    const response = await fetch('/api/tables').then(d => {
      if (!d.ok) {
        throw d
      }
      return d.json()
    })

    pageState.tables = response.tables
  } catch (err) {
    toast.error(err.message)
  }
}

function onTableSearch(e) {
  pageState.tableSearch = e.target.value
}
