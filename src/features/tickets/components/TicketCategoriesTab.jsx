import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { TableEmptyState } from '../../../components/TableEmptyState'
import { TableSkeletonRows } from '../../../components/TableSkeletonRows'
import { loadDepartments } from '../../departments/departmentsSlice'
import { TicketIcon } from '../../../layouts/navIcons'
import { PRIORITIES, PRIORITY_BADGE, PRIORITY_LABELS } from '../ticketLabels'
import {
  addCategory,
  editCategory,
  loadCategories,
  removeCategory,
  ticketSettingsErrorCleared,
} from '../ticketSettingsSlice'

const INPUT_CLASS =
  'rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15'

const EMPTY_FORM = {
  name: '',
  department_id: '',
  description: '',
  default_priority: 'normal',
  is_active: true,
}

export function TicketCategoriesTab() {
  const dispatch = useAppDispatch()
  const categories = useAppSelector((state) => state.ticketSettings.categories)
  const status = useAppSelector((state) => state.ticketSettings.categoriesStatus)
  const departments = useAppSelector((state) => state.departments.items)
  const error = useAppSelector((state) => state.ticketSettings.error)
  const actionStatus = useAppSelector((state) => state.ticketSettings.actionStatus)
  const actionError = useAppSelector((state) => state.ticketSettings.actionError)

  const [isFormOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    dispatch(loadCategories())
    dispatch(loadDepartments())
  }, [dispatch])

  function openCreate() {
    dispatch(ticketSettingsErrorCleared())
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  function openEdit(category) {
    dispatch(ticketSettingsErrorCleared())
    setEditingId(category.id)
    setForm({
      name: category.name || '',
      department_id: category.department?.id || '',
      description: category.description || '',
      default_priority: category.default_priority || 'normal',
      is_active: category.is_active,
    })
    setFormOpen(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const body = {
      name: form.name,
      department_id: form.department_id ? Number(form.department_id) : null,
      description: form.description || null,
      default_priority: form.default_priority,
      is_active: form.is_active,
    }

    const action = editingId
      ? await dispatch(editCategory({ id: editingId, data: body }))
      : await dispatch(addCategory(body))

    if (!action.error) setFormOpen(false)
  }

  async function handleDelete(category) {
    if (!window.confirm(`هل تريد حذف الفئة "${category.name}"؟`)) return

    await dispatch(removeCategory(category.id))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-brand-gray/15 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(17,45,95,0.06)]">
        <p className="m-0 text-xs font-semibold text-brand-gray/60">
          الفئة بدون قسم متاحة لكل الأقسام. تُستخدم الفئة لتحديد سياسة SLA المناسبة.
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="shrink-0 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-navy"
        >
          + فئة جديدة
        </button>
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
            {editingId ? 'تعديل فئة' : 'فئة جديدة'}
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
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className={INPUT_CLASS}
            />
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            القسم
            <select
              value={form.department_id}
              onChange={(event) => setForm({ ...form, department_id: event.target.value })}
              className={INPUT_CLASS}
            >
              <option value="">كل الأقسام</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            الأولوية الافتراضية
            <select
              value={form.default_priority}
              onChange={(event) => setForm({ ...form, default_priority: event.target.value })}
              className={INPUT_CLASS}
            >
              {PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {PRIORITY_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm font-bold text-brand-gray">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
            />
            مفعّلة
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray sm:col-span-2">
            الوصف
            <textarea
              rows={2}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className={INPUT_CLASS}
            />
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
              <th className="px-4 py-3">القسم</th>
              <th className="px-4 py-3">الأولوية الافتراضية</th>
              <th className="px-4 py-3">الوصف</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {status === 'loading' ? (
              <TableSkeletonRows rows={4} columns={6} />
            ) : categories.length === 0 ? (
              <TableEmptyState colSpan={6} icon={TicketIcon} message="لا توجد فئات بعد" />
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="border-b border-brand-gray/8 transition last:border-0 hover:bg-brand-gray/4">
                  <td className="px-4 py-3 font-bold text-brand-navy">{category.name}</td>
                  <td className="px-4 py-3 font-semibold text-brand-gray">
                    {category.department?.name || <span className="text-brand-gray/50">كل الأقسام</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${PRIORITY_BADGE[category.default_priority]}`}>
                      {PRIORITY_LABELS[category.default_priority]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-gray">{category.description || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        category.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-gray/8 text-brand-gray/60'
                      }`}
                    >
                      {category.is_active ? 'مفعّلة' : 'معطّلة'}
                    </span>
                  </td>
                  <td className="flex flex-wrap gap-2 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openEdit(category)}
                      className="rounded-lg border border-brand-gray/15 px-3 py-1.5 text-xs font-bold text-brand-primary transition hover:bg-brand-gray/8"
                    >
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
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
