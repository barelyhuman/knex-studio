import { html } from '@arrow-js/core'

export function TableHeaders(headers) {
  return headers.map(x => html`<th scope="col">${x}</th>`)
}
