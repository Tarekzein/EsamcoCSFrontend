// Icon + message empty state for a table, instead of a bare text row -
// used across the Customers/Users/Departments tables.
export function TableEmptyState({ colSpan, icon: Icon, message }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-brand-gray/8 text-brand-gray/40">
            <Icon className="size-6" />
          </div>
          <p className="m-0 text-sm font-bold text-brand-gray/60">{message}</p>
        </div>
      </td>
    </tr>
  )
}
