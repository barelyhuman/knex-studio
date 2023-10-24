import { MODES } from '../constants.js'
import { html } from '@arrow-js/core'

const defaultToggleAction = () => {
  // alert('noop')
}

export function TableActions({
  onToggleMode = defaultToggleAction,
  activeMode,
} = {}) {
  return html`<div class="d-flex gap-2">
    <div>
      <a href="/raw" class="btn btn-secondary"> Raw SQL </a>
    </div>
    <div class="ms-auto">
      <div class="btn-group" role="group" aria-label="Basic example">
        <button
          type="button"
          class="btn btn-secondary ${activeMode === MODES.DATA ? 'active' : ''}"
          @click="${() => onToggleMode(MODES.DATA)}"
        >
          Data
        </button>
        <button
          type="button"
          class="btn btn-secondary ${activeMode === MODES.STRUCT
            ? 'active'
            : ''}"
          @click="${() => onToggleMode(MODES.STRUCT)}"
        >
          Structure
        </button>
      </div>
      <button class="btn btn-secondary" @click="${() => {}}">Add Row</button>
    </div>
  </div>`
}
