import { mountTable } from './table.js'

mountTable('#database-datatable', {
  searchable: true,
  tableRender: (_data, table, type) => {
    if (type === 'print') {
      return table
    }
    const tHead = table.childNodes[0]
    const filterHeaders = {
      nodeName: 'TR',
      childNodes: tHead.childNodes[0].childNodes.map((_th, index) => ({
        nodeName: 'TH',
        childNodes: [
          {
            nodeName: 'INPUT',
            attributes: {
              class: 'datatable-input form-control',
              type: 'search',
              'data-columns': `[${index}]`,
            },
          },
        ],
      })),
    }
    tHead.childNodes.push(filterHeaders)
    return table
  },
})
