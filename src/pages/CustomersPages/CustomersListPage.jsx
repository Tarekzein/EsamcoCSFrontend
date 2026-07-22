import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { formatDate, SOURCE_OPTIONS, SOURCE_LABELS } from '../../features/customers/customerLabels'
import {
  addCustomer,
  customerSelected,
  customerSelectionCleared,
  customersErrorCleared,
  editCustomer,
  loadCustomer,
  loadCustomers,
  loadCustomerTimeline,
  removeCustomer,
} from '../../features/customers/customersSlice'
import { conversationSelected } from '../../features/liveChat/liveChatSlice'
import { avatarColor, initials } from '../../lib/avatarColor'
import { MailIcon, PhoneIcon, UsersIcon } from '../../layouts/navIcons'
import { currentPath, goBack, navigate } from '../../router/navigation'
import { Pagination } from '../../components/Pagination'
import { TableEmptyState } from '../../components/TableEmptyState'
import { TableSkeletonRows } from '../../components/TableSkeletonRows'
import { CustomerDetailView } from './CustomerDetailView'

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
  source: 'manual',
  tags: '',
  notes: '',
}

const SOURCE_BADGE_COLORS = {
  manual: 'bg-brand-gray/8 text-brand-gray/70',
  live_chat: 'bg-blue-50 text-blue-700',
  chatbot: 'bg-violet-50 text-violet-700',
  email: 'bg-amber-50 text-amber-700',
  phone: 'bg-emerald-50 text-emerald-700',
  portal: 'bg-sky-50 text-sky-700',
  api: 'bg-rose-50 text-rose-700',
}

function SourceBadge({ source }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${SOURCE_BADGE_COLORS[source] || 'bg-brand-accent/10 text-brand-primary'}`}>
      {SOURCE_LABELS[source] || source}
    </span>
  )
}

export function CustomersListPage({ customerIdFromUrl }) {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector((state) => state.auth.user)
  const isAdmin = currentUser?.role === 'admin'

  const customers = useAppSelector((state) => state.customers.items)
  const meta = useAppSelector((state) => state.customers.meta)
  const status = useAppSelector((state) => state.customers.status)
  const error = useAppSelector((state) => state.customers.error)
  const actionStatus = useAppSelector((state) => state.customers.actionStatus)
  const actionError = useAppSelector((state) => state.customers.actionError)
  const selected = useAppSelector((state) => state.customers.selected)
  const selectedStatus = useAppSelector((state) => state.customers.selectedStatus)
  const timeline = useAppSelector((state) => state.customers.timeline)
  const timelineStatus = useAppSelector((state) => state.customers.timelineStatus)

  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [isFormOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [page, setPage] = useState(1)

  useEffect(() => {
    dispatch(loadCustomers({ search: search || undefined, source: sourceFilter || undefined, page }))
  }, [dispatch, page])

  // Arriving via a direct link (e.g. clicking a visitor's name in the live
  // chat panel) - only the id is known, so fetch the full record instead
  // of relying on a row already being loaded in the list.
  useEffect(() => {
    if (customerIdFromUrl) {
      dispatch(loadCustomer(customerIdFromUrl))
      dispatch(loadCustomerTimeline(customerIdFromUrl))
    }
  }, [dispatch, customerIdFromUrl])

  function handleFilter(event) {
    event.preventDefault()
    setPage(1)
    dispatch(loadCustomers({ search: search || undefined, source: sourceFilter || undefined, page: 1 }))
  }

  function openCreateForm() {
    dispatch(customersErrorCleared())
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  function openEditForm(customer) {
    dispatch(customersErrorCleared())
    setEditingId(customer.id)
    setForm({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      company: customer.company || '',
      source: customer.source || 'manual',
      tags: (customer.tags || []).join(', '),
      notes: customer.notes || '',
    })
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
  }

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const body = {
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      company: form.company || null,
      source: form.source,
      tags: form.tags
        ? form.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
      notes: form.notes || null,
    }

    const action = editingId
      ? await dispatch(editCustomer({ id: editingId, data: body }))
      : await dispatch(addCustomer(body))

    if (!action.error) {
      closeForm()
    }
  }

  async function handleDelete(customer) {
    if (!window.confirm(`هل تريد حذف العميل "${customer.name}"؟`)) return

    await dispatch(removeCustomer(customer.id))
  }

  function openDetails(customer) {
    dispatch(customerSelected(customer))
    dispatch(loadCustomerTimeline(customer.id))
    navigate(`/customers/${customer.id}`, { state: { from: currentPath() } })
  }

  function closeDetails() {
    dispatch(customerSelectionCleared())
    goBack('/customers')
  }

  function openConversation(conversationId) {
    dispatch(conversationSelected(conversationId))
    navigate(`/live-chat/${conversationId}`, { state: { from: currentPath() } })
  }

  if (customerIdFromUrl && String(selected?.id) !== String(customerIdFromUrl)) {
    return (
      <div dir="rtl" className="flex flex-col gap-4">
        <p className="m-0 rounded-lg border border-brand-gray/15 bg-white p-6 text-center text-sm font-bold text-brand-gray/60">
          {selectedStatus === 'failed' ? 'تعذر العثور على العميل.' : 'جارٍ التحميل...'}
        </p>
      </div>
    )
  }

  if (customerIdFromUrl && String(selected?.id) === String(customerIdFromUrl)) {
    return (
      <div dir="rtl">
        <CustomerDetailView
          customer={selected}
          timeline={timeline}
          timelineStatus={timelineStatus}
          onBack={closeDetails}
          onOpenConversation={openConversation}
        />
      </div>
    )
  }

  return (
    <div dir="rtl" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-brand-gray/15 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(17,45,95,0.06)] max-sm:flex-col max-sm:items-stretch">
        <div className="flex items-center gap-2.5">
          <h1 className="m-0 text-lg font-black text-brand-navy">العملاء</h1>
          <span className="rounded-full bg-brand-gray/8 px-2.5 py-1 text-xs font-bold text-brand-gray/60">{meta?.total ?? customers.length}</span>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-navy"
        >
          + إضافة عميل
        </button>
      </div>

      <form
        onSubmit={handleFilter}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-brand-gray/15 bg-white p-4 shadow-[0_10px_30px_rgba(17,45,95,0.06)]"
      >
        <label className="grid min-w-56 flex-1 gap-1 text-sm font-bold text-brand-gray">
          البحث
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="الاسم، البريد، أو الهاتف..."
            className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
          />
        </label>

        <label className="grid gap-1 text-sm font-bold text-brand-gray">
          المصدر
          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
          >
            <option value="">كل المصادر</option>
            {SOURCE_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
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

      {isFormOpen ? (
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-lg border border-brand-gray/15 bg-white p-5 shadow-[0_10px_30px_rgba(17,45,95,0.06)] sm:grid-cols-2"
        >
          <h2 className="m-0 text-base font-black text-brand-navy sm:col-span-2">
            {editingId ? 'تعديل عميل' : 'عميل جديد'}
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
              minLength={2}
              value={form.name}
              onChange={(event) => handleChange('name', event.target.value)}
              className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
            />
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            البريد الإلكتروني
            <input
              type="email"
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
              className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
            />
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            الهاتف
            <input
              value={form.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
              className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
            />
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            الشركة
            <input
              value={form.company}
              onChange={(event) => handleChange('company', event.target.value)}
              className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
            />
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            المصدر
            <select
              value={form.source}
              onChange={(event) => handleChange('source', event.target.value)}
              className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
            >
              {SOURCE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            الوسوم (مفصولة بفواصل)
            <input
              value={form.tags}
              onChange={(event) => handleChange('tags', event.target.value)}
              placeholder="مثال: VIP, شكوى متكررة"
              className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
            />
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray sm:col-span-2">
            ملاحظات
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) => handleChange('notes', event.target.value)}
              className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
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
              onClick={closeForm}
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
              <th className="px-4 py-3">العميل</th>
              <th className="px-4 py-3">التواصل</th>
              <th className="px-4 py-3">الشركة</th>
              <th className="px-4 py-3">المصدر</th>
              <th className="px-4 py-3">تاريخ الإنشاء</th>
              <th className="px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {status === 'loading' ? (
              <TableSkeletonRows rows={6} columns={6} />
            ) : customers.length === 0 ? (
              <TableEmptyState colSpan={6} icon={UsersIcon} message="لا يوجد عملاء بعد" />
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="border-b border-brand-gray/8 align-top transition last:border-0 hover:bg-brand-gray/4">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-black ${avatarColor(customer.name)}`}>
                        {initials(customer.name)}
                      </div>
                      <div className="grid gap-1">
                        <button
                          type="button"
                          onClick={() => openDetails(customer)}
                          className="text-right font-bold text-brand-navy hover:text-brand-primary hover:underline"
                        >
                          {customer.name}
                        </button>
                        {customer.tags?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {customer.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="rounded-full bg-brand-accent/10 px-2 py-0.5 text-[10px] font-bold text-brand-primary">
                                {tag}
                              </span>
                            ))}
                            {customer.tags.length > 2 ? (
                              <span className="rounded-full bg-brand-gray/8 px-2 py-0.5 text-[10px] font-bold text-brand-gray/60">
                                +{customer.tags.length - 2}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-gray">
                    <div className="grid gap-1">
                      {customer.email ? (
                        <span className="flex items-center gap-1.5 text-xs">
                          <MailIcon className="size-3.5 text-brand-gray/40" />
                          {customer.email}
                        </span>
                      ) : null}
                      {customer.phone ? (
                        <span className="flex items-center gap-1.5 text-xs">
                          <PhoneIcon className="size-3.5 text-brand-gray/40" />
                          {customer.phone}
                        </span>
                      ) : null}
                      {!customer.email && !customer.phone ? '—' : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-gray">{customer.company || '—'}</td>
                  <td className="px-4 py-3">
                    <SourceBadge source={customer.source} />
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-gray">{formatDate(customer.created_at)}</td>
                  <td className="flex flex-wrap gap-2 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openDetails(customer)}
                      className="rounded-lg border border-brand-gray/15 px-3 py-1.5 text-xs font-bold text-brand-primary transition hover:bg-brand-gray/8"
                    >
                      التفاصيل
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditForm(customer)}
                      className="rounded-lg border border-brand-gray/15 px-3 py-1.5 text-xs font-bold text-brand-primary transition hover:bg-brand-gray/8"
                    >
                      تعديل
                    </button>
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(customer)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                      >
                        حذف
                      </button>
                    ) : null}
                  </td>
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
