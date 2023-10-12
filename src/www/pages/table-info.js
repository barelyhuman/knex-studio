import { reactive } from '@arrow-js/core'
import { html } from '@arrow-js/core'

// Model
const TABLE_STATES = {
  DATA: 0,
  STRUCTURE: 1,
}

const pageState = reactive({
  activeTableName: '',
  tableState: TABLE_STATES.DATA,
  tableSearchTerm: '',
  dataHeaders: [],
  tables: [],
  dataRows: [],
  structureRows: [],
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
          pageState.tableSearchTerm
            ? x.startsWith(pageState.tableSearchTerm)
            : true
        )
        return filteredTables.map(x => TableLink({ name: x }))
      }}
    </ul>
  </div>
</div>`

const TableHeader = ({ label = '' } = {}) =>
  html`<th scope="col" class="px-6 border border-zinc-100 py-3">${label}</th>`

const TableRows = ({ headers = [], data = [] } = {}) =>
  data.map(rowItem => {
    const keys = Object.keys(rowItem).sort((x, y) => {
      return headers.indexOf(x) - headers.indexOf(y)
    })
    return html`<tr class="bg-white hover:bg-zinc-100 border-b">
      ${() =>
        keys.map(k => {
          const value =
            rowItem[k] == null || rowItem[k] == undefined ? '-' : rowItem[k]
          return html`<td class="border border-zinc-100 px-6 py-4">
            <div contenteditable @input="${e => {
              // TODO:
              // e.target.innerText => Sanitize Input
              // also need to keep record of the modifications
              // so that we can show what has changed (something similar to TablePlus)
            }}">
              ${value}
            </d>
          </td>`
        })}
    </tr>`
  })

const TableDisplayData = ({} = {}) => {
  const isDataActive = pageState.tableState === TABLE_STATES.DATA
  let activeHeaders = pageState.dataHeaders
  let dataRows = pageState.dataRows
  if (!isDataActive) {
    dataRows = pageState.structureRows
    const _possibleKeys = new Set()
    pageState.structureRows.forEach(x => {
      Object.keys(x).forEach(k => _possibleKeys.add(k))
    })
    activeHeaders = [..._possibleKeys]
  }
  return html`<table
    class="w-full border-collapse text-sm text-left text-zinc-500"
  >
    <thead class="text-xs text-zinc-700 bg-zinc-50">
      <tr>
        ${() => {
          return activeHeaders.map(x => TableHeader({ label: x }))
        }}
      </tr>
    </thead>
    <tbody>
      ${() =>
        TableRows({
          headers: activeHeaders,
          data: dataRows,
        })}
    </tbody>
  </table>`
}

const TableStateToggle = ({} = {}) => {
  const isDataActive = pageState.tableState === TABLE_STATES.DATA
  const isStructureActive = !isDataActive

  return html`<div
    class="bg-zinc-200 text-sm text-zinc-500 leading-none border-2 border-zinc-200 inline-flex"
  >
    <button
      class="${isDataActive
        ? 'bg-white'
        : ''} inline-flex items-center transition-colors duration-300 ease-in focus:outline-none hover:text-zinc-800 focus:text-zinc-800 px-4 py-2 active"
      @click="${() => (pageState.tableState = TABLE_STATES.DATA)}"
    >
      <span>Data</span>
    </button>
    <button
      class="${isStructureActive
        ? 'bg-white'
        : ''} inline-flex items-center transition-colors duration-300 ease-in focus:outline-none hover:text-zinc-800 focus:text-zinc-800 px-4 py-2"
      @click="${() => (pageState.tableState = TABLE_STATES.STRUCTURE)}"
    >
      <span>Structure</span>
    </button>
  </div>`
}

const TableDisplay = ({} = {}) => {
  return html`<div
    class="flex-[5] relative p-2 overflow-x-auto flex flex-col gap-2"
  >
    <div class="flex gap-2 items-center">
      ${() => TableStateToggle()}
      <a href="/sql">Execute SQL</a>
    </div>
    ${() => TableDisplayData()}
  </div>`
}

export const Page = html`
  <div class="flex gap-1">
    <div class="flex-1 p-2 max-w-[250px]">${TableListCard}</div>
    ${() => (pageState.activeTableName ? TableDisplay() : html``)}
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
  pageState.dataHeaders = info.headers
  pageState.dataRows = info.data.rows
  pageState.structureRows = info.columns
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
  pageState.tableSearchTerm = e.target.value
}
