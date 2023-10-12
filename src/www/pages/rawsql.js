import { reactive } from '@arrow-js/core'
import { html } from '@arrow-js/core'

// Model

const pageState = reactive({
  queryToRun: '',
  headers: [],
  dataRows: [],
})

// View

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

const TableData = () => {
  return html`<table
    class="w-full border-collapse text-sm text-left text-zinc-500"
  >
    <thead class="text-xs text-zinc-700 bg-zinc-50">
      <tr>
        ${() => {
          return pageState.headers.map(x => TableHeader({ label: x }))
        }}
      </tr>
    </thead>
    <tbody>
      ${() =>
        TableRows({
          headers: pageState.headers,
          data: pageState.dataRows,
        })}
    </tbody>
  </table>`
}

export const Page = html`
  <div class="p-2 flex flex-col gap-3">
    <textarea
      class="text-zinc-800 p-2 border w-full rounded-sm"
      placeholder="SELECT * from 'users';"
      @input="${e => (pageState.queryToRun = e.target.value)}"
    ></textarea>
    <div class="flex items-center justify-end">
      <button
        type="button"
        class="inline-flex justify-center items-center px-3 py-2 bg-zinc-800 text-zinc-50 rounded-sm"
        @click="${() => runQuery(pageState.queryToRun)}"
      >
        Run Query
      </button>
    </div>
    <div class="mt-10">${() => TableData()}</div>
  </div>
`

// Controller
export const init = async () => {}

async function runQuery(query) {
  const response = await fetch('/api/exec', {
    method: 'POST',
    body: query,
  }).then(d => d.json())

  console.log(response)

  pageState.headers = response.headers
  pageState.dataRows = response.rows
}
