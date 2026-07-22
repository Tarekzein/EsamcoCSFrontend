import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { TableEmptyState } from '../../../components/TableEmptyState'
import { TableSkeletonRows } from '../../../components/TableSkeletonRows'
import { ClockIcon } from '../../../layouts/navIcons'
import { PRIORITIES, PRIORITY_BADGE, PRIORITY_LABELS } from '../ticketLabels'
import {
  addSlaPolicy,
  editSlaPolicy,
  loadCategories,
  loadSlaPolicies,
  removeSlaPolicy,
  ticketSettingsErrorCleared,
} from '../ticketSettingsSlice'

const INPUT_CLASS =
  'rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15'

const EMPTY_FORM = {
  ticket_category_id: '',
  priority: 'normal',
  response_minutes: 60,
  resolution_minutes: 480,
  is_active: true,
}

/** Policies are authored in minutes but reasoned about in hours. */
function humanizeMinutes(minutes) {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes} دقيقة`

  const hours = minutes / 60

  if (hours < 24) {
    return `${minutes} دقيقة (${Number.isInteger(hours) ? hours : hours.toFixed(1)} ساعة)`
  }

  const days = hours / 24

  return `${minutes} دقيقة (${Number.isInteger(days) ? days : days.toFixed(1)} يوم)`
}

export function SlaPoliciesTab() {
  const dispatch = useAppDispatch()
  const policies = useAppSelector((state) => state.ticketSettings.policies)
  const status = useAppSelector((state) => state.ticketSettings.policiesStatus)
  const categories = useAppSelector((state) => state.ticketSettings.categories)
  const error = useAppSelector((state) => state.ticketSettings.error)
  const actionStatus = useAppSelector((state) => state.ticketSettings.actionStatus)
  const actionError = useAppSelector((state) => state.ticketSettings.actionError)

  const [isFormOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    dispatch(loadSlaPolicies())
    dispatch(loadCategories())
  }, [dispatch])

  // A category with no matching policy silently gets null SLA due dates -
  // the feature looks broken rather than unconfigured, so surface it.
  const categoriesWithoutPolicy = useMemo(() => {
    if (!categories.length) return []

    const covered = new Set(policies.map((policy) => policy.ticket_category?.id ?? 'global'))

    return categories.filter((category) => !covered.has(category.id) && !covered.has('global'))
  }, [categories, policies])

  function openCreate() {
    dispatch(ticketSettingsErrorCleared())
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  function openEdit(policy) {
    dispatch(ticketSettingsErrorCleared())
    setEditingId(policy.id)
    setForm({
      ticket_category_id: policy.ticket_category?.id || '',
      priority: policy.priority,
      response_minutes: policy.response_minutes,
      resolution_minutes: policy.resolution_minutes,
      is_active: policy.is_active,
    })
    setFormOpen(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const body = {
      ticket_category_id: form.ticket_category_id ? Number(form.ticket_category_id) : null,
      priority: form.priority,
      response_minutes: Number(form.response_minutes),
      resolution_minutes: Number(form.resolution_minutes),
      is_active: form.is_active,
    }

    const action = editingId
      ? await dispatch(editSlaPolicy({ id: editingId, data: body }))
      : await dispatch(addSlaPolicy(body))

    if (!action.error) setFormOpen(false)
  }

  async function handleDelete(policy) {
    const label = policy.ticket_category?.name || 'الافتراضية'

    if (!window.confirm(`هل تريد حذف سياسة "${label}" لأولوية ${PRIORITY_LABELS[policy.priority]}؟`)) return

    await dispatch(removeSlaPolicy(policy.id))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-brand-gray/15 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(17,45,95,0.06)]">
        <p className="m-0 text-xs font-semibold text-brand-gray/60">
          تُحدد مدة الاستجابة والحل لكل فئة وأولوية. السياسة بدون فئة هي الافتراضية لكل التذاكر.
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="shrink-0 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-navy"
        >
          + سياسة جديدة
        </button>
      </div>

      {error ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-center text-sm font-bold text-red-700">{error}</p>
      ) : null}

      {categoriesWithoutPolicy.length ? (
        <p className="m-0 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800">
          تنبيه: لا توجد سياسة SLA للفئات التالية، ولن يتم احتساب مواعيد لها:{' '}
          {categoriesWithoutPolicy.map((category) => category.name).join('، ')}
        </p>
      ) : null}

      {isFormOpen ? (
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-lg border border-brand-gray/15 bg-white p-5 shadow-[0_10px_30px_rgba(17,45,95,0.06)] sm:grid-cols-2"
        >
          <h2 className="m-0 text-base font-black text-brand-navy sm:col-span-2">
            {editingId ? 'تعديل سياسة' : 'سياسة جديدة'}
          </h2>

          {actionError ? (
            <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 sm:col-span-2">
              {actionError}
            </p>
          ) : null}

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            الفئة
            <select
              value={form.ticket_category_id}
              onChange={(event) => setForm({ ...form, ticket_category_id: event.target.value })}
              className={INPUT_CLASS}
            >
              <option value="">الافتراضية (كل الفئات)</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            الأولوية
            <select
              value={form.priority}
              onChange={(event) => setForm({ ...form, priority: event.target.value })}
              className={INPUT_CLASS}
            >
              {PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {PRIORITY_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            مدة الاستجابة (بالدقائق)
            <input
              required
              type="number"
              min={1}
              value={form.response_minutes}
              onChange={(event) => setForm({ ...form, response_minutes: event.target.value })}
              className={INPUT_CLASS}
            />
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            مدة الحل (بالدقائق)
            <input
              required
              type="number"
              min={1}
              value={form.resolution_minutes}
              onChange={(event) => setForm({ ...form, resolution_minutes: event.target.value })}
              className={INPUT_CLASS}
            />
          </label>

          <label className="flex items-center gap-2 text-sm font-bold text-brand-gray sm:col-span-2">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
            />
            مفعّلة
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
              onClick={() => setFormOpen(false)}
              className="rounded-lg border border-brand-gray/15 px-5 py-2.5 text-sm font-bold text-brand-gray transition hover:bg-brand-gray/8"
            >
              إلغاء
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-brand-gray/15 bg-white shadow-[0_10px_30px_rgba(17,45,95,0.06)]">
        <table className="w-full min-w-200 text-right text-sm">
          <thead>
            <tr className="border-b border-brand-gray/15 text-xs font-bold text-brand-gray/60">
              <th className="px-4 py-3">الفئة</th>
              <th className="px-4 py-3">الأولوية</th>
              <th className="px-4 py-3">مدة الاستجابة</th>
              <th className="px-4 py-3">مدة الحل</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {status === 'loading' ? (
              <TableSkeletonRows rows={4} columns={6} />
            ) : policies.length === 0 ? (
              <TableEmptyState colSpan={6} icon={ClockIcon} message="لا توجد سياسات SLA بعد" />
            ) : (
              policies.map((policy) => (
                <tr key={policy.id} className="border-b border-brand-gray/8 transition last:border-0 hover:bg-brand-gray/4">
                  <td className="px-4 py-3 font-bold text-brand-navy">
                    {policy.ticket_category?.name || <span className="text-brand-gray/50">الافتراضية</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${PRIORITY_BADGE[policy.priority]}`}>
                      {PRIORITY_LABELS[policy.priority]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-gray">{humanizeMinutes(policy.response_minutes)}</td>
                  <td className="px-4 py-3 font-semibold text-brand-gray">{humanizeMinutes(policy.resolution_minutes)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        policy.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-gray/8 text-brand-gray/60'
                      }`}
                    >
                      {policy.is_active ? 'مفعّلة' : 'معطّلة'}
                    </span>
                  </td>
                  <td className="flex flex-wrap gap-2 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openEdit(policy)}
                      className="rounded-lg border border-brand-gray/15 px-3 py-1.5 text-xs font-bold text-brand-primary transition hover:bg-brand-gray/8"
                    >
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(policy)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
