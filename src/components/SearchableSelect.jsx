import { useEffect, useId, useRef, useState } from 'react'

export function SearchableSelect({
  label,
  value,
  onChange,
  loadOptions,
  optionKey = (option) => option.id,
  renderOption,
  renderValue,
  placeholder = 'ابحث... ',
  emptyMessage = 'لا توجد نتائج متاحة.',
  disabled = false,
}) {
  const listboxId = useId()
  const rootRef = useRef(null)
  const loaderRef = useRef(loadOptions)
  const [isOpen, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState([])
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    loaderRef.current = loadOptions
  }, [loadOptions])

  useEffect(() => {
    if (!isOpen) return undefined

    let active = true
    const timeout = window.setTimeout(() => {
      setStatus('loading')
      loaderRef.current(query)
        .then((items) => {
          if (!active) return
          setOptions(items)
          setStatus('ready')
        })
        .catch(() => {
          if (!active) return
          setOptions([])
          setStatus('failed')
        })
    }, query ? 250 : 0)

    return () => {
      active = false
      window.clearTimeout(timeout)
    }
  }, [isOpen, query])

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [])

  return (
    <label ref={rootRef} className="relative grid gap-1.5 text-sm font-bold text-brand-gray">
      {label}
      <div className={`flex items-center gap-2 rounded-xl border bg-white px-3 transition focus-within:border-brand-primary/50 focus-within:ring-2 focus-within:ring-brand-primary/15 ${isOpen ? 'border-brand-primary/40' : 'border-brand-gray/15'} ${disabled ? 'opacity-60' : ''}`}>
        <span aria-hidden className="text-brand-gray/40">⌕</span>
        <input
          type="search"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          disabled={disabled}
          value={isOpen ? query : value ? renderValue(value) : ''}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-semibold outline-none placeholder:text-brand-gray/35"
        />
        {value ? (
          <button
            type="button"
            aria-label="مسح الاختيار"
            onClick={() => {
              onChange(null)
              setQuery('')
            }}
            className="grid size-7 place-items-center rounded-full text-brand-gray/45 transition hover:bg-brand-gray/8 hover:text-brand-gray"
          >
            ×
          </button>
        ) : null}
      </div>

      {isOpen ? (
        <div id={listboxId} role="listbox" className="absolute inset-x-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-xl border border-brand-gray/12 bg-white p-1.5 shadow-[0_18px_50px_rgba(17,45,95,0.16)]">
          {status === 'loading' ? <p className="m-0 px-3 py-4 text-center text-xs font-bold text-brand-gray/45">جارٍ البحث...</p> : null}
          {status === 'failed' ? <p className="m-0 px-3 py-4 text-center text-xs font-bold text-red-600">تعذر تحميل الخيارات.</p> : null}
          {status === 'ready' && options.length === 0 ? <p className="m-0 px-3 py-4 text-center text-xs font-bold text-brand-gray/45">{emptyMessage}</p> : null}
          {status === 'ready' ? options.map((option) => (
            <button
              key={optionKey(option)}
              type="button"
              role="option"
              aria-selected={value ? optionKey(value) === optionKey(option) : false}
              onClick={() => {
                onChange(option)
                setQuery('')
                setOpen(false)
              }}
              className="block w-full rounded-lg px-3 py-2.5 text-right transition hover:bg-brand-primary/6 focus:bg-brand-primary/6 focus:outline-none"
            >
              {renderOption(option)}
            </button>
          )) : null}
        </div>
      ) : null}
    </label>
  )
}
