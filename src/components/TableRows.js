import { html } from '@arrow-js/core'

export function TableRows(rowsData) {
  return rowsData.map(
    x =>
      html`<tr>
        ${() => x.map(d => html`<td>${d}</td>`)}
      </tr>`
  )
}
