import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  addDepartment,
  departmentsErrorCleared,
  editDepartment,
  loadDepartments,
  removeDepartment,
} from '../../features/departments/departmentsSlice'
import { ClockIcon, DepartmentIcon } from '../../layouts/navIcons'
import { Pagination } from '../../components/Pagination'
import { TableEmptyState } from '../../components/TableEmptyState'
import { TableSkeletonRows } from '../../components/TableSkeletonRows'

const ICON_COLORS = [
  'bg-brand-primary/10 text-brand-primary',
  'bg-violet-50 text-violet-600',
  'bg-emerald-50 text-emerald-600',
  'bg-amber-50 text-amber-600',
  'bg-rose-50 text-rose-600',
  'bg-sky-50 text-sky-600',
]

function iconColor(name) {
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return ICON_COLORS[Math.abs(hash) % ICON_COLORS.length]
}

const TIME_HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const TIME_MINUTES = ['00', '15', '30', '45']

// The backend stores/validates 24h "H:i" - this is purely a friendlier,
// locale-consistent Arabic 12h ص/م picker on top of that same value,
// since the bare native <input type="time"> renders inconsistently
// across browsers/OS locales (sometimes 24h, sometimes with no AM/PM UI).
function parseTime24(value) {
  if (!value) return { hour: '09', minute: '00', period: 'ص' }

  const [rawHour, rawMinute] = value.split(':')
  const hourNumber = parseInt(rawHour, 10)
  const period = hourNumber >= 12 ? 'م' : 'ص'
  const hour12 = hourNumber % 12 || 12

  return { hour: String(hour12).padStart(2, '0'), minute: rawMinute || '00', period }
}

function formatTime24({ hour, minute, period }) {
  let hour24 = parseInt(hour, 10) % 12

  if (period === 'م') hour24 += 12

  return `${String(hour24).padStart(2, '0')}:${minute}`
}

function formatTime12(value) {
  if (!value) return null

  const { hour, minute, period } = parseTime24(value)

  return `${hour}:${minute} ${period}`
}

function TimeField({ value, onChange }) {
  const { hour, minute, period } = parseTime24(value)

  function update(patch) {
    onChange(formatTime24({ hour, minute, period, ...patch }))
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-brand-gray/15 bg-white px-2.5 py-2 focus-within:border-brand-primary/40 focus-within:ring-2 focus-within:ring-brand-primary/15">
      <ClockIcon className="size-4 shrink-0 text-brand-gray/40" />
      <select
        value={hour}
        onChange={(event) => update({ hour: event.target.value })}
        className="bg-transparent text-sm font-bold text-brand-navy focus:outline-none"
      >
        {TIME_HOURS.map((h) => (
          <option key={h} value={String(h).padStart(2, '0')}>
            {h}
          </option>
        ))}
      </select>
      <span className="text-brand-gray/40">:</span>
      <select
        value={minute}
        onChange={(event) => update({ minute: event.target.value })}
        className="bg-transparent text-sm font-bold text-brand-navy focus:outline-none"
      >
        {TIME_MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={period}
        onChange={(event) => update({ period: event.target.value })}
        className="mr-1 rounded-md bg-brand-gray/8 px-1.5 py-0.5 text-xs font-bold text-brand-gray focus:outline-none"
      >
        <option value="ص">ص</option>
        <option value="م">م</option>
      </select>
    </div>
  )
}

const EMPTY_FORM = {
  name: '',
  description: '',
  business_hours_start: '',
  business_hours_end: '',
  timezone: '',
  is_active: true,
}

export function DepartmentsListPage() {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector((state) => state.auth.user)
  const isAdmin = currentUser?.role === 'admin'

  const departments = useAppSelector((state) => state.departments.items)
  const meta = useAppSelector((state) => state.departments.meta)
  const status = useAppSelector((state) => state.departments.status)
  const error = useAppSelector((state) => state.departments.error)
  const actionStatus = useAppSelector((state) => state.departments.actionStatus)
  const actionError = useAppSelector((state) => state.departments.actionError)

  const [isFormOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [page, setPage] = useState(1)

  useEffect(() => {
    dispatch(loadDepartments({ page }))
  }, [dispatch, page])

  function openCreateForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    dispatch(departmentsErrorCleared())
    setFormOpen(true)
  }

  function openEditForm(department) {
    setEditingId(department.id)
    setForm({
      name: department.name || '',
      description: department.description || '',
      business_hours_start: department.business_hours_start || '',
      business_hours_end: department.business_hours_end || '',
      timezone: department.timezone || '',
      is_active: department.is_active,
    })
    dispatch(departmentsErrorCleared())
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
  }

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const body = {
      name: form.name,
      description: form.description || null,
      business_hours_start: form.business_hours_start || null,
      business_hours_end: form.business_hours_end || null,
      timezone: form.timezone || null,
      is_active: form.is_active,
    }

    const action = editingId
      ? await dispatch(editDepartment({ id: editingId, data: body }))
      : await dispatch(addDepartment(body))

    if (!action.error) {
      closeForm()
    }
  }

  async function handleDelete(department) {
    if (!window.confirm(`هل تريد حذف قسم "${department.name}"؟`)) return

    await dispatch(removeDepartment(department.id))
  }

  return (
    <div dir="rtl" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-brand-gray/15 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(17,45,95,0.06)] max-sm:flex-col max-sm:items-stretch">
        <div className="flex items-center gap-2.5">
          <h1 className="m-0 text-lg font-black text-brand-navy">الأقسام</h1>
          <span className="rounded-full bg-brand-gray/8 px-2.5 py-1 text-xs font-bold text-brand-gray/60">{meta?.total ?? departments.length}</span>
        </div>

        {isAdmin ? (
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-navy"
          >
            + إضافة قسم
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-center text-sm font-bold text-red-700">{error}</p>
      ) : null}

      {isFormOpen ? (
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-lg border border-brand-gray/15 bg-white p-5 shadow-[0_10px_30px_rgba(17,45,95,0.06)] sm:grid-cols-2"
        >
          <h2 className="m-0 text-base font-black text-brand-navy sm:col-span-2">
            {editingId ? 'تعديل القسم' : 'قسم جديد'}
          </h2>

          {actionError ? (
            <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 sm:col-span-2">
              {actionError}
            </p>
          ) : null}

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            الاسم
            <input
              required
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
              className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
            />
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            المنطقة الزمنية
            <input
              value={form.timezone}
              onChange={(event) => handleChange('timezone', event.target.value)}
              placeholder="Africa/Cairo"
              className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
            />
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            بداية ساعات العمل
            <TimeField
              value={form.business_hours_start}
              onChange={(value) => handleChange('business_hours_start', value)}
            />
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            نهاية ساعات العمل
            <TimeField
              value={form.business_hours_end}
              onChange={(value) => handleChange('business_hours_end', value)}
            />
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray sm:col-span-2">
            الوصف
            <textarea
              value={form.description}
              onChange={(event) => handleChange('description', event.target.value)}
              rows={2}
              className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-bold text-brand-gray">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => handleChange('is_active', event.target.checked)}
            />
            نشط
          </label>

          <div className="flex gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={actionStatus === 'loading'}
              className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-navy disabled:opacity-60"
            >
              {actionStatus === 'loading' ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-brand-gray/15 px-5 py-2.5 text-sm font-bold text-brand-gray transition hover:bg-brand-gray/8"
            >
              إلغاء
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-brand-gray/15 bg-white shadow-[0_10px_30px_rgba(17,45,95,0.06)]">
        <table className="w-full min-w-150 text-right text-sm">
          <thead>
            <tr className="border-b border-brand-gray/15 text-xs font-bold text-brand-gray/60">
              <th className="px-4 py-3">القسم</th>
              <th className="px-4 py-3">ساعات العمل</th>
              <th className="px-4 py-3">المنطقة الزمنية</th>
              <th className="px-4 py-3">الحالة</th>
              {isAdmin ? <th className="px-4 py-3">إجراءات</th> : null}
            </tr>
          </thead>
          <tbody>
            {status === 'loading' ? (
              <TableSkeletonRows rows={6} columns={isAdmin ? 5 : 4} />
            ) : departments.length === 0 ? (
              <TableEmptyState colSpan={isAdmin ? 5 : 4} icon={DepartmentIcon} message="لا توجد أقسام بعد" />
            ) : (
              departments.map((department) => (
                <tr key={department.id} className="border-b border-brand-gray/8 align-top transition last:border-0 hover:bg-brand-gray/4">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className={`grid size-9 shrink-0 place-items-center rounded-lg ${iconColor(department.name)}`}>
                        <DepartmentIcon className="size-4.5" />
                      </div>
                      <div className="grid gap-0.5">
                        <span className="font-bold text-brand-navy">{department.name}</span>
                        {department.description ? (
                          <span className="max-w-70 truncate text-xs font-semibold text-brand-gray/60">{department.description}</span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-gray">
                    {department.business_hours_start && department.business_hours_end ? (
                      <span className="flex items-center gap-1.5 text-xs">
                        <ClockIcon className="size-3.5 text-brand-gray/40" />
                        {formatTime12(department.business_hours_start)} - {formatTime12(department.business_hours_end)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-gray">{department.timezone || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        department.is_active ? 'bg-green-50 text-green-700' : 'bg-brand-gray/8 text-brand-gray/60'
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${department.is_active ? 'bg-green-500' : 'bg-brand-gray/40'}`} />
                      {department.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  {isAdmin ? (
                    <td className="flex gap-2 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openEditForm(department)}
                        className="rounded-lg border border-brand-gray/15 px-3 py-1.5 text-xs font-bold text-brand-primary transition hover:bg-brand-gray/8"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(department)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                      >
                        حذف
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  )
}
