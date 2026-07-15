import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { assignUserDepartment, createUser, deleteUser, fetchUsers, updateUser } from './usersAPI'

export const loadUsers = createAsyncThunk('users/loadUsers', async (params = {}) => {
  return await fetchUsers(params)
})

export const addUser = createAsyncThunk('users/addUser', async (data) => {
  const payload = await createUser(data)

  return payload.data
})

export const editUser = createAsyncThunk('users/editUser', async ({ id, data }) => {
  const payload = await updateUser(id, data)

  return payload.data
})

export const removeUser = createAsyncThunk('users/removeUser', async (id) => {
  await deleteUser(id)

  return id
})

export const reassignUserDepartment = createAsyncThunk(
  'users/reassignUserDepartment',
  async ({ id, departmentId }) => {
    const payload = await assignUserDepartment(id, departmentId)

    return payload.data
  }
)

const initialState = {
  items: [],
  meta: null,
  status: 'idle',
  error: null,
  actionStatus: 'idle',
  actionError: null,
}

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    usersErrorCleared(state) {
      state.error = null
      state.actionError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUsers.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.data
        state.meta = action.payload.meta
      })
      .addCase(loadUsers.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'تعذر تحميل المستخدمين.'
      })
      .addCase(addUser.pending, (state) => {
        state.actionStatus = 'loading'
        state.actionError = null
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.items.unshift(action.payload)
      })
      .addCase(addUser.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.actionError = action.error.message || 'تعذر إنشاء المستخدم.'
      })
      .addCase(editUser.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)

        if (index !== -1) state.items[index] = action.payload
      })
      .addCase(editUser.rejected, (state, action) => {
        state.actionError = action.error.message || 'تعذر تحديث المستخدم.'
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(removeUser.rejected, (state, action) => {
        state.actionError = action.error.message || 'تعذر حذف المستخدم.'
      })
      .addCase(reassignUserDepartment.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)

        if (index !== -1) state.items[index] = action.payload
      })
      .addCase(reassignUserDepartment.rejected, (state, action) => {
        state.actionError = action.error.message || 'تعذر نقل المستخدم إلى القسم.'
      })
  },
})

export const { usersErrorCleared } = usersSlice.actions
export default usersSlice.reducer
