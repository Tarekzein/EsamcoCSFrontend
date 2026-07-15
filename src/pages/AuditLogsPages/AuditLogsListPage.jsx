import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { loadDepartments } from '../../features/departments/departmentsSlice'
import { auditLogSelectionCleared, loadAuditLog, loadAuditLogs } from '../../features/auditLogs/auditLogsSlice'
import { ChatIcon, DepartmentIcon, HomeIcon, PhoneIcon, TicketIcon, UsersIcon } from '../../layouts/navIcons'
import { Pagination } from '../../components/Pagination'

// Backend action -> how to present it. Falls back to a plain gray badge
// with the raw action string for anything not listed here, so a new
// backend action type never breaks the page.
const ACTION_META = {
  went_online: { label: 'اتصل', dot: 'bg-green-500', badge: 'bg-green-50 text-green-700' },
  went_offline: { label: 'انقطع الاتصال', dot: 'bg-brand-gray/40', badge: 'bg-brand-gray/8 text-brand-gray/700' },
  created: { label: 'إنشاء', badge: 'bg-blue-50 text-blue-700' },
  updated: { label: 'تحديث', badge: 'bg-amber-50 text-amber-700' },
  deleted: { label: 'حذف', badge: 'bg-red-50 text-red-700' },
  restored: { label: 'استعادة', badge: 'bg-teal-50 text-teal-700' },
  force_deleted: { label: 'حذف نهائي', badge: 'bg-red-100 text-red-800' },
  transferred: { label: 'نقل', dot: 'bg-purple-500', badge: 'bg-purple-50 text-purple-700' },
}

const ACTION_FILTER_OPTIONS = [
  { value: '', label: 'كل الإجراءات' },
  { value: 'went_online,went_offline', label: 'الاتصال والانقطاع' },
  { value: 'created', label: 'إنشاء' },
  { value: 'updated', label: 'تحديث' },
  { value: 'deleted', label: 'حذف' },
  { value: 'transferred', label: 'نقل محادثة' },
]

function formatDate(value) {
  if (!value) return '—'

  return new Date(value).toLocaleString('ar-EG')
}

function ActionBadge({ action }) {
  const meta = ACTION_META[action] || { label: action, badge: 'bg-brand-gray/8 text-brand-gray/70' }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${meta.badge}`}>
      {meta.dot ? <span className={`size-1.5 rounded-full ${meta.dot}`} /> : null}
      {meta.label}
    </span>
  )
}

// A one-line, human summary for the log types people actually want to
// skim at a glance - everything else still falls back to the raw
// old/new JSON blocks below it.
function friendlySummary(log) {
  if (!log.user) return null

  if (log.action === 'went_online') return `${log.user.name} أصبح متصلاً`
  if (log.action === 'went_offline') return `${log.user.name} أصبح غير متصل`
  // Covers "transferred" and any "updated" entry that carries visitor
  // context (e.g. closing a conversation) - status/closed_at alone don't
  // say much at a glance, but the visitor's name does.
  if (log.action === 'transferred' || log.action === 'updated') {
    const customerName = log.new_values?.visitor_name || log.old_values?.visitor_name
    return customerName || null
  }
  return null
}

function parseBrowser(userAgent) {
  if (!userAgent) return null

  const chrome = userAgent.match(/Chrome\/([\d.]+)/)
  const safari = userAgent.match(/Version\/([\d.]+).*Safari/)
  const firefox = userAgent.match(/Firefox\/([\d.]+)/)
  const edge = userAgent.match(/Edg\/([\d.]+)/)
  const os = userAgent.match(/Mac OS X ([\d_]+)|Windows NT ([\d.]+)|Linux/)

  let browser = 'غير معروف'
  let version = ''

  if (edge) {
    browser = 'Microsoft Edge'
    version = edge[1]
  } else if (chrome) {
    browser = 'Google Chrome'
    version = chrome[1]
  } else if (firefox) {
    browser = 'Mozilla Firefox'
    version = firefox[1]
  } else if (safari) {
    browser = 'Apple Safari'
    version = safari[1]
  }

  let osName = 'غير معروف'
  if (os) {
    if (os[1]) osName = 'macOS ' + os[1].replace(/_/g, '.')
    else if (os[2]) osName = 'Windows ' + os[2]
    else osName = 'Linux'
  }

  return { browser, version, osName }
}

const FIELD_LABELS = {
  status: 'الحالة',
  closed_at: 'تاريخ الإغلاق',
  updated_at: 'تاريخ التحديث',
  assigned_agent_id: 'الموظف المعيّن',
  assigned_at: 'تاريخ التعيين',
  department_id: 'القسم',
  department: 'القسم',
  priority: 'الأولوية',
  name: 'الاسم',
  email: 'البريد الإلكتروني',
  phone: 'الهاتف',
  company: 'الشركة',
  source: 'المصدر',
  notes: 'الملاحظات',
  tags: 'الوسوم',
  is_active: 'نشط',
  role: 'الدور',
  visitor_name: 'اسم الزائر',
  visitor_phone: 'هاتف الزائر',
  visitor_email: 'بريد الزائر',
  messages_count: 'عدد الرسائل',
}

function DiffView({ oldValues, newValues }) {
  if (!oldValues && !newValues) {
    return <p className="m-0 text-center text-sm font-semibold text-brand-gray/60">لا توجد تغييرات</p>
  }

  const oldKeys = oldValues ? Object.keys(oldValues) : []
  const newKeys = newValues ? Object.keys(newValues) : []
  const allKeys = [...new Set([...oldKeys, ...newKeys])]

  if (allKeys.length === 0) {
    return <p className="m-0 text-center text-sm font-semibold text-brand-gray/60">لا توجد تغييرات</p>
  }

  return (
    <div className="grid gap-1.5">
      {allKeys.map((key) => {
        const oldVal = oldValues?.[key]
        const newVal = newValues?.[key]
        const oldStr = oldVal == null ? '—' : typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal)
        const newStr = newVal == null ? '—' : typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal)
        const changed = oldStr !== newStr
        const label = FIELD_LABELS[key] || key

        return (
          <div
            key={key}
            className={`rounded-lg border px-3 py-2.5 ${
              changed ? 'border-amber-200 bg-amber-50/50' : 'border-brand-gray/10 bg-brand-gray/3'
            }`}
          >
            <span className="text-xs font-bold text-brand-navy">{label}</span>
            {changed ? (
              <div className="mt-1.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs">
                <span className="truncate rounded bg-red-50 px-2 py-1 font-semibold text-red-700 line-through decoration-red-300/60">{oldStr}</span>
                <span className="text-brand-gray/40">←</span>
                <span className="truncate rounded bg-green-50 px-2 py-1 font-semibold text-green-700">{newStr}</span>
              </div>
            ) : (
              <div className="mt-1 text-xs font-semibold text-brand-gray/60">{oldStr}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function MetaItem({ label, children, icon: Icon }) {
  return (
    <div className="flex items-start gap-2.5">
      {Icon ? (
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-brand-gray/6 text-brand-gray/50">
          <Icon className="size-3.5" />
        </span>
      ) : null}
      <div className="grid gap-0.5">
        <span className="text-[11px] font-bold text-brand-gray/50">{label}</span>
        <span className="text-sm font-semibold text-brand-navy">{children}</span>
      </div>
    </div>
  )
}

export function AuditLogsListPage() {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector((state) => state.auth.user)
  const isAdmin = currentUser?.role === 'admin'

  const logs = useAppSelector((state) => state.auditLogs.items)
  const meta = useAppSelector((state) => state.auditLogs.meta)
  const status = useAppSelector((state) => state.auditLogs.status)
  const error = useAppSelector((state) => state.auditLogs.error)
  const selected = useAppSelector((state) => state.auditLogs.selected)
  const selectedStatus = useAppSelector((state) => state.auditLogs.selectedStatus)
  const departments = useAppSelector((state) => state.departments.items)

  const [departmentFilter, setDepartmentFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [emailFilter, setEmailFilter] = useState('')
  const [page, setPage] = useState(1)

  const today = new Date().toISOString().slice(0, 10)
  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(today)

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10)
    dispatch(loadAuditLogs({ dateFrom: todayStr, dateTo: todayStr, page }))
  }, [dispatch, page])

  useEffect(() => {
    // GET /departments has no role restriction, so this is loaded for both
    // admins (to build the department filter) and supervisors (just to
    // resolve their own department's name in the table).
    dispatch(loadDepartments())
  }, [dispatch])

  function handleFilter(event) {
    event.preventDefault()
    setPage(1)

    dispatch(
      loadAuditLogs({
        departmentId: departmentFilter || undefined,
        action: actionFilter || undefined,
        email: emailFilter.trim() || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page: 1,
      })
    )
  }

  function openDetails(log) {
    dispatch(loadAuditLog(log.id))
  }

  function closeDetails() {
    dispatch(auditLogSelectionCleared())
  }

  return (
    <div dir="rtl" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-brand-gray/15 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(17,45,95,0.06)] max-sm:flex-col max-sm:items-stretch">
        <h1 className="m-0 text-lg font-black text-brand-navy">سجلات التدقيق</h1>
        <span className="text-xs font-bold text-brand-gray/60">
          {isAdmin ? 'عرض كل الأقسام' : 'مقتصر على قسمك فقط'}
        </span>
      </div>

      <form
        onSubmit={handleFilter}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-brand-gray/15 bg-white p-4 shadow-[0_10px_30px_rgba(17,45,95,0.06)]"
      >
        <label className="grid min-w-56 flex-1 gap-1 text-sm font-bold text-brand-gray">
          البريد الإلكتروني
          <input
            type="text"
            value={emailFilter}
            onChange={(event) => setEmailFilter(event.target.value)}
            placeholder="بحث عن مستخدم بالبريد الإلكتروني..."
            className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
          />
        </label>

        {isAdmin ? (
          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            القسم
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
            >
              <option value="">كل الأقسام</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="grid gap-1 text-sm font-bold text-brand-gray">
          نوع الإجراء
          <select
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
            className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
          >
            {ACTION_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm font-bold text-brand-gray">
          من تاريخ
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
          />
        </label>

        <label className="grid gap-1 text-sm font-bold text-brand-gray">
          إلى تاريخ
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
          />
        </label>

        <button
          type="submit"
          className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-navy"
        >
          تصفية
        </button>
      </form>

      {error ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-center text-sm font-bold text-red-700">{error}</p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-brand-gray/15 bg-white shadow-[0_10px_30px_rgba(17,45,95,0.06)]">
        <table className="w-full min-w-180 text-right text-sm">
          <thead>
            <tr className="border-b border-brand-gray/15 text-xs font-bold text-brand-gray/60">
              <th className="px-4 py-3">التاريخ</th>
              <th className="px-4 py-3">الإجراء</th>
              <th className="px-4 py-3">النوع</th>
              <th className="px-4 py-3">المستخدم</th>
              <th className="px-4 py-3">القسم</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {status === 'loading' ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center font-semibold text-brand-gray/60">
                  جارٍ التحميل...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center font-semibold text-brand-gray/60">
                  لا توجد سجلات بعد.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-brand-gray/8 last:border-0">
                  <td className="px-4 py-3 font-semibold text-brand-gray">{formatDate(log.created_at)}</td>
                  <td className="px-4 py-3">
                    <ActionBadge action={log.action} />
                    {friendlySummary(log) ? (
                      <div className="mt-1 text-xs font-semibold text-brand-gray/60">{friendlySummary(log)}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-gray">{log.auditable_type?.split('\\').pop()}</td>
                  <td className="px-4 py-3 font-semibold text-brand-gray">
                    {log.user ? (
                      <div className="grid gap-0.5">
                        <span className="font-bold text-brand-navy">{log.user.name}</span>
                        <span className="text-xs font-semibold text-brand-gray/60">{log.user.email}</span>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-gray">
                    {departments.find((d) => d.id === log.department_id)?.name || log.department_id || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openDetails(log)}
                      className="rounded-lg border border-brand-gray/15 px-3 py-1.5 text-xs font-bold text-brand-primary transition hover:bg-brand-gray/8"
                    >
                      التفاصيل
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} onPageChange={setPage} />

      {selected || selectedStatus === 'loading' ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={closeDetails}>
          <div
            className="grid max-h-[85vh] w-full max-w-2xl gap-4 overflow-y-auto rounded-lg bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-base font-black text-brand-navy">تفاصيل سجل التدقيق</h2>
              <button
                type="button"
                onClick={closeDetails}
                className="rounded-lg border border-brand-gray/15 px-3 py-1.5 text-xs font-bold text-brand-gray transition hover:bg-brand-gray/8"
              >
                إغلاق
              </button>
            </div>

            {selectedStatus === 'loading' ? (
              <p className="m-0 text-center font-semibold text-brand-gray/60">جارٍ التحميل...</p>
            ) : selected ? (
              <>
                <div className="flex items-center gap-3">
                  <ActionBadge action={selected.action} />
                  {friendlySummary(selected) ? (
                    <span className="text-sm font-bold text-brand-navy">{friendlySummary(selected)}</span>
                  ) : null}
                </div>

                <div className="grid gap-4 rounded-lg border border-brand-gray/15 bg-brand-gray/3 p-4 sm:grid-cols-2">
                  <MetaItem label="نفّذها" icon={UsersIcon}>
                    {selected.user ? (
                      <div className="grid gap-0.5">
                        <span>{selected.user.name}</span>
                        <span className="text-xs text-brand-gray/60">{selected.user.email}</span>
                      </div>
                    ) : '—'}
                  </MetaItem>

                  <MetaItem label="القسم" icon={DepartmentIcon}>
                    {departments.find((d) => d.id === selected.department_id)?.name || selected.department_id || '—'}
                  </MetaItem>

                  <MetaItem label="النوع" icon={TicketIcon}>
                    {selected.auditable_type?.split('\\').pop()}
                  </MetaItem>

                  <MetaItem label="المعرّف" icon={HomeIcon}>
                    #{selected.auditable_id}
                  </MetaItem>

                  <MetaItem label="التاريخ" icon={ChatIcon}>
                    {formatDate(selected.created_at)}
                  </MetaItem>

                  <MetaItem label="عنوان IP" icon={PhoneIcon}>
                    {selected.ip_address || '—'}
                  </MetaItem>

                  {selected.user_agent ? (() => {
                    const parsed = parseBrowser(selected.user_agent)
                    return parsed ? (
                      <MetaItem label="المتصفح" icon={ChatIcon}>
                        <div className="grid gap-0.5">
                          <span>{parsed.browser} {parsed.version}</span>
                          <span className="text-xs text-brand-gray/60">{parsed.osName}</span>
                        </div>
                      </MetaItem>
                    ) : null
                  })() : null}
                </div>

                <div className="grid gap-1.5">
                  <h3 className="m-0 text-sm font-black text-brand-navy">القيم المتغّرة</h3>
                  <DiffView oldValues={selected.old_values} newValues={selected.new_values} />
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
