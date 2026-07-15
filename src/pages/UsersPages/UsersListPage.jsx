import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { loadDepartments } from '../../features/departments/departmentsSlice'
import {
  addUser,
  editUser,
  loadUsers,
  reassignUserDepartment,
  removeUser,
  usersErrorCleared,
} from '../../features/users/usersSlice'
import { SearchIcon } from '../../features/liveChat/components/chatIcons'
import { avatarColor, initials } from '../../lib/avatarColor'
import { UsersIcon } from '../../layouts/navIcons'
import { Pagination } from '../../components/Pagination'
import { TableEmptyState } from '../../components/TableEmptyState'
import { TableSkeletonRows } from '../../components/TableSkeletonRows'

const ROLE_LABELS = {
  admin: 'مدير',
  supervisor: 'مشرف',
  agent: 'موظف',
}

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
  role: 'agent',
  department_id: '',
}

export function UsersListPage() {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector((state) => state.auth.user)
  const isAdmin = currentUser?.role === 'admin'
  const isSupervisor = currentUser?.role === 'supervisor'
  const canCreate = isAdmin || isSupervisor

  const users = useAppSelector((state) => state.users.items)
  const meta = useAppSelector((state) => state.users.meta)
  const status = useAppSelector((state) => state.users.status)
  const error = useAppSelector((state) => state.users.error)
  const actionStatus = useAppSelector((state) => state.users.actionStatus)
  const actionError = useAppSelector((state) => state.users.actionError)
  const departments = useAppSelector((state) => state.departments.items)

  const [isFormOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingRow, setEditingRow] = useState(null)
  const [editRoleValue, setEditRoleValue] = useState('agent')
  const [editDepartmentValue, setEditDepartmentValue] = useState('')
  const [editActiveValue, setEditActiveValue] = useState(true)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    dispatch(loadDepartments())
  }, [dispatch])

  useEffect(() => {
    dispatch(loadUsers({ departmentId: departmentFilter || undefined, page }))
  }, [dispatch, departmentFilter, page])

  function handleDepartmentFilterChange(value) {
    setDepartmentFilter(value)
    setPage(1)
  }

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users
    const q = search.trim().toLowerCase()
    return users.filter(
      (user) => user.name?.toLowerCase().includes(q) || user.email?.toLowerCase().includes(q)
    )
  }, [users, search])

  // Supervisors can only ever create an agent in their own department -
  // mirrors StoreUserRequest::prepareForValidation() on the backend, which
  // silently overrides whatever role/department_id a supervisor submits.
  // Applied whenever the create form is opened, rather than in an effect,
  // to avoid a setState-in-effect render cascade.
  function openCreateForm() {
    dispatch(usersErrorCleared())
    setForm(
      isSupervisor
        ? { ...EMPTY_FORM, role: 'agent', department_id: currentUser?.department_id || '' }
        : EMPTY_FORM
    )
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
      email: form.email,
      phone: form.phone || null,
      password: form.password,
      password_confirmation: form.password_confirmation,
      role: form.role,
      department_id: form.department_id || null,
    }

    const action = await dispatch(addUser(body))

    if (!action.error) {
      closeForm()
    }
  }

  function startEdit(user) {
    setEditingRow(user.id)
    setEditRoleValue(user.role)
    setEditDepartmentValue(user.department_id || '')
    setEditActiveValue(user.is_active)
    dispatch(usersErrorCleared())
  }

  function cancelEdit() {
    setEditingRow(null)
  }

  async function saveEdit(user) {
    const action = await dispatch(
      editUser({
        id: user.id,
        data: {
          role: editRoleValue,
          is_active: editActiveValue,
        },
      })
    )

    if (editDepartmentValue !== (user.department_id || '')) {
      await dispatch(
        reassignUserDepartment({ id: user.id, departmentId: editDepartmentValue || null })
      )
    }

    if (!action.error) {
      setEditingRow(null)
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`هل تريد حذف المستخدم "${user.name}"؟`)) return

    await dispatch(removeUser(user.id))
  }

  return (
    <div dir="rtl" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-brand-gray/15 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(17,45,95,0.06)] max-sm:flex-col max-sm:items-stretch">
        <div className="flex items-center gap-2.5">
          <h1 className="m-0 text-lg font-black text-brand-navy">المستخدمون</h1>
          <span className="rounded-full bg-brand-gray/8 px-2.5 py-1 text-xs font-bold text-brand-gray/60">{meta?.total ?? users.length}</span>
        </div>

        {canCreate ? (
          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-navy"
          >
            + إضافة مستخدم
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-center text-sm font-bold text-red-700">{error}</p>
      ) : null}

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-brand-gray/15 bg-white p-4 shadow-[0_10px_30px_rgba(17,45,95,0.06)]">
        <div className="relative flex-1 min-w-60">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-brand-gray/60" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="بحث بالاسم أو البريد..."
            className="w-full rounded-lg border border-brand-gray/15 bg-white py-3 pr-4 pl-11 text-sm font-semibold text-brand-navy placeholder:text-brand-gray/60 focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
          />
        </div>

        {isAdmin ? (
          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            القسم
            <select
              value={departmentFilter}
              onChange={(event) => handleDepartmentFilterChange(event.target.value)}
              className="rounded-lg border border-brand-gray/15 px-3 py-2.5 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
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
      </div>

      {isFormOpen ? (
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-lg border border-brand-gray/15 bg-white p-5 shadow-[0_10px_30px_rgba(17,45,95,0.06)] sm:grid-cols-2"
        >
          <h2 className="m-0 text-base font-black text-brand-navy sm:col-span-2">مستخدم جديد</h2>

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
            البريد الإلكتروني
            <input
              required
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
            كلمة المرور
            <input
              required
              type="password"
              minLength={8}
              value={form.password}
              onChange={(event) => handleChange('password', event.target.value)}
              className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
            />
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            تأكيد كلمة المرور
            <input
              required
              type="password"
              minLength={8}
              value={form.password_confirmation}
              onChange={(event) => handleChange('password_confirmation', event.target.value)}
              className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
            />
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            الدور الوظيفي
            {isSupervisor ? (
              <input
                disabled
                value={ROLE_LABELS.agent}
                className="rounded-lg border border-brand-gray/15 bg-brand-gray/6 px-3 py-2 text-sm font-semibold text-brand-gray/60"
              />
            ) : (
              <select
                value={form.role}
                onChange={(event) => handleChange('role', event.target.value)}
                className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
              >
                <option value="agent">{ROLE_LABELS.agent}</option>
                <option value="supervisor">{ROLE_LABELS.supervisor}</option>
              </select>
            )}
          </label>

          <label className="grid gap-1 text-sm font-bold text-brand-gray">
            القسم
            {isSupervisor ? (
              <input
                disabled
                value={departments.find((d) => d.id === currentUser?.department_id)?.name || '—'}
                className="rounded-lg border border-brand-gray/15 bg-brand-gray/6 px-3 py-2 text-sm font-semibold text-brand-gray/60"
              />
            ) : (
              <select
                value={form.department_id}
                onChange={(event) => handleChange('department_id', event.target.value)}
                className="rounded-lg border border-brand-gray/15 px-3 py-2 text-sm font-semibold focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
              >
                <option value="">بدون قسم</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            )}
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
          <table className="w-full min-w-180 text-right text-sm">
            <thead>
              <tr className="border-b border-brand-gray/15 text-xs font-bold text-brand-gray/60">
                <th className="px-4 py-3">الاسم</th>
                <th className="px-4 py-3">البريد الإلكتروني</th>
                <th className="px-4 py-3">الدور</th>
                <th className="px-4 py-3">القسم</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">متصل الآن</th>
                {isAdmin ? <th className="px-4 py-3">إجراءات</th> : null}
              </tr>
            </thead>
            <tbody>
              {status === 'loading' ? (
                <TableSkeletonRows rows={6} columns={isAdmin ? 7 : 6} />
              ) : filteredUsers.length === 0 ? (
                <TableEmptyState colSpan={isAdmin ? 7 : 6} icon={UsersIcon} message="لا يوجد مستخدمون بعد" />
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-brand-gray/8 last:border-0 align-top transition hover:bg-brand-gray/4">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-black ${avatarColor(user.name)}`}>
                          {initials(user.name)}
                        </div>
                        <span className="font-bold text-brand-navy">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand-gray">{user.email}</td>
                    <td className="px-4 py-3">
                      {isAdmin && editingRow === user.id ? (
                        <select
                          value={editRoleValue}
                          onChange={(event) => setEditRoleValue(event.target.value)}
                          className="rounded-lg border border-brand-gray/15 px-2 py-1 text-xs font-bold"
                        >
                          <option value="agent">{ROLE_LABELS.agent}</option>
                          <option value="supervisor">{ROLE_LABELS.supervisor}</option>
                          <option value="admin">{ROLE_LABELS.admin}</option>
                        </select>
                      ) : (
                        <span className="rounded-full bg-brand-accent/10 px-3 py-1 text-xs font-bold text-brand-primary">
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand-gray">
                      {isAdmin && editingRow === user.id ? (
                        <select
                          value={editDepartmentValue}
                          onChange={(event) => setEditDepartmentValue(event.target.value)}
                          className="rounded-lg border border-brand-gray/15 px-2 py-1 text-xs font-bold"
                        >
                          <option value="">بدون قسم</option>
                          {departments.map((department) => (
                            <option key={department.id} value={department.id}>
                              {department.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        user.department?.name || '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin && editingRow === user.id ? (
                        <label className="flex items-center gap-2 text-xs font-bold text-brand-gray">
                          <input
                            type="checkbox"
                            checked={editActiveValue}
                            onChange={(event) => setEditActiveValue(event.target.checked)}
                          />
                          نشط
                        </label>
                      ) : (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            user.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {user.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 text-xs font-bold text-brand-gray">
                        <span
                          className={`size-2 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-brand-gray/30'}`}
                        />
                        {user.is_online ? 'متصل' : 'غير متصل'}
                      </span>
                    </td>
                    {isAdmin ? (
                      <td className="flex flex-wrap gap-2 px-4 py-3">
                        {editingRow === user.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveEdit(user)}
                              className="rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-navy"
                            >
                              حفظ
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="rounded-lg border border-brand-gray/15 px-3 py-1.5 text-xs font-bold text-brand-gray transition hover:bg-brand-gray/8"
                            >
                              إلغاء
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(user)}
                              className="rounded-lg border border-brand-gray/15 px-3 py-1.5 text-xs font-bold text-brand-primary transition hover:bg-brand-gray/8"
                            >
                              تعديل
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(user)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                            >
                              حذف
                            </button>
                          </>
                        )}
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
