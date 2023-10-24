import { TableHeaders } from './TableHeaders.js'
import { TableRows } from './TableRows.js'
import { html } from '@arrow-js/core'

export function TableView({ headers, rows }) {
  return html`
    <table
      class="table table-hover table-bordered rounded overflow-hidden table-striped"
    >
      <thead>
        <tr>
          ${() => TableHeaders(headers)}
        </tr>
      </thead>
      <tbody>
        ${() => TableRows(rows)}
      </tbody>
    </table>
  `
}
