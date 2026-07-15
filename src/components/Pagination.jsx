// Compact page-number window with ellipses, e.g. 1 ... 4 5 [6] 7 8 ... 20 -
// avoids rendering a button per page when there are many pages.
function pageNumbers(current, last) {
  const windowSize = 1
  const start = Math.max(1, current - windowSize)
  const end = Math.min(last, current + windowSize)
  const pages = []

  if (start > 1) pages.push(1)
  if (start > 2) pages.push('start-ellipsis')
  for (let page = start; page <= end; page++) pages.push(page)
  if (end < last - 1) pages.push('end-ellipsis')
  if (end < last) pages.push(last)

  return pages
}

export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null

  const { current_page: current, last_page: last, total, per_page: perPage } = meta
  const from = (current - 1) * perPage + 1
  const to = Math.min(current * perPage, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-gray/15 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(17,45,95,0.06)]">
      <span className="text-xs font-bold text-brand-gray/60">
        عرض {from}-{to} من {total}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={current === 1}
          onClick={() => onPageChange(current - 1)}
          className="rounded-lg border border-brand-gray/15 px-3 py-1.5 text-xs font-bold text-brand-gray transition hover:bg-brand-gray/8 disabled:cursor-not-allowed disabled:opacity-40"
        >
          السابق
        </button>

        {pageNumbers(current, last).map((page, index) =>
          typeof page !== 'number' ? (
            <span key={`${page}-${index}`} className="px-1 text-xs font-bold text-brand-gray/40">
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`grid size-8 place-items-center rounded-lg text-xs font-bold transition ${
                page === current
                  ? 'bg-brand-primary text-white'
                  : 'border border-brand-gray/15 text-brand-gray hover:bg-brand-gray/8'
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          disabled={current === last}
          onClick={() => onPageChange(current + 1)}
          className="rounded-lg border border-brand-gray/15 px-3 py-1.5 text-xs font-bold text-brand-gray transition hover:bg-brand-gray/8 disabled:cursor-not-allowed disabled:opacity-40"
        >
          التالي
        </button>
      </div>
    </div>
  )
}
