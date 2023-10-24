import { html } from '@arrow-js/core'

export function TableList(searchTerm, allTables, activeTableName) {
  return html`<ul class="list-group rounded-0">
    ${() =>
      allTables
        .filter(x => x.includes(searchTerm))
        .map((tableName, i) => {
          const classList = ['list-group-item', 'list-group-item-action']
          const isActive = activeTableName === tableName
          if (isActive) {
            classList.push('active')
          }
          return html`<li
            role="button"
            class="${classList.join(' ')}"
            @click="${() => {
              window.location.href = `/${tableName}`
            }}"
          >
            ${tableName}
          </li>`
        })}
  </ul>`
}
