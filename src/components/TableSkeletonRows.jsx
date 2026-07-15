// Pulsing placeholder rows shown while a table's data is loading, instead
// of a plain "جارٍ التحميل..." row - used across the Customers/Users/
// Departments tables so the loading state matches the rest of the app.
export function TableSkeletonRows({ rows = 6, columns = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse border-b border-brand-gray/8 last:border-0">
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <td key={columnIndex} className="px-4 py-3.5">
              <div
                className="h-3 rounded-full bg-brand-gray/10"
                style={{ width: `${50 + ((rowIndex + columnIndex) % 4) * 12}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
