import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createDepartment, deleteDepartment, fetchDepartments, updateDepartment } from './departmentsAPI'

export const loadDepartments = createAsyncThunk('departments/loadDepartments', async (params = {}) => {
  return await fetchDepartments(params)
})

export const addDepartment = createAsyncThunk('departments/addDepartment', async (data) => {
  const payload = await createDepartment(data)

  return payload.data
})

export const editDepartment = createAsyncThunk('departments/editDepartment', async ({ id, data }) => {
  const payload = await updateDepartment(id, data)

  return payload.data
})

export const removeDepartment = createAsyncThunk('departments/removeDepartment', async (id) => {
  await deleteDepartment(id)

  return id
})

const initialState = {
  items: [],
  meta: null,
  status: 'idle',
  error: null,
  actionStatus: 'idle',
  actionError: null,
}

const departmentsSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    departmentsErrorCleared(state) {
      state.error = null
      state.actionError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDepartments.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadDepartments.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.data
        state.meta = action.payload.meta
      })
      .addCase(loadDepartments.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'تعذر تحميل الأقسام.'
      })
      .addCase(addDepartment.pending, (state) => {
        state.actionStatus = 'loading'
        state.actionError = null
      })
      .addCase(addDepartment.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.items.unshift(action.payload)
      })
      .addCase(addDepartment.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.actionError = action.error.message || 'تعذر إنشاء القسم.'
      })
      .addCase(editDepartment.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)

        if (index !== -1) state.items[index] = action.payload
      })
      .addCase(editDepartment.rejected, (state, action) => {
        state.actionError = action.error.message || 'تعذر تحديث القسم.'
      })
      .addCase(removeDepartment.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(removeDepartment.rejected, (state, action) => {
        state.actionError = action.error.message || 'تعذر حذف القسم. تأكد من عدم ارتباط مستخدمين به.'
      })
  },
})

export const { departmentsErrorCleared } = departmentsSlice.actions
export default departmentsSlice.reducer
