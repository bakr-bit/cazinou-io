/**
 * Table Component for rendering Sanity @sanity/table data
 * Supports optional header row and title
 */

export type TableRow = {
  _type: 'tableRow'
  _key: string
  cells?: string[]
}

export type TableBlockData = {
  _type: 'tableBlock'
  _key?: string
  title?: string
  hasHeaderRow?: boolean
  table?: {
    _type: 'table'
    rows?: TableRow[]
  }
}

type Props = {
  data: TableBlockData
}

export function Table({data}: Props) {
  const rows = data.table?.rows

  if (!rows || rows.length === 0) {
    return null
  }

  const hasHeader = data.hasHeaderRow !== false // Default to true
  const headerRow = hasHeader ? rows[0] : null
  const bodyRows = hasHeader ? rows.slice(1) : rows

  return (
    <div className="my-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {data.title && (
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900 font-mono">
            {data.title}
          </h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {headerRow && headerRow.cells && (
            <thead className="bg-gray-50">
              <tr>
                {headerRow.cells.map((cell, cellIndex) => (
                  <th
                    key={`header-${cellIndex}`}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 font-mono"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-gray-200 bg-white">
            {bodyRows.map((row, rowIndex) => (
              <tr
                key={row._key || `row-${rowIndex}`}
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
              >
                {row.cells?.map((cell, cellIndex) => (
                  <td
                    key={`cell-${rowIndex}-${cellIndex}`}
                    className="px-4 py-3 text-sm text-gray-700"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Table
