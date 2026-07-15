import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createCustomer, deleteCustomer, fetchCustomer, fetchCustomers, fetchCustomerTimeline, updateCustomer } from './customersAPI'

export const loadCustomers = createAsyncThunk('customers/loadCustomers', async (params = {}) => {
  return await fetchCustomers(params)
})

export const addCustomer = createAsyncThunk('customers/addCustomer', async (data) => {
  const payload = await createCustomer(data)

  return payload.data
})

export const editCustomer = createAsyncThunk('customers/editCustomer', async ({ id, data }) => {
  const payload = await updateCustomer(id, data)

  return payload.data
})

export const removeCustomer = createAsyncThunk('customers/removeCustomer', async (id) => {
  await deleteCustomer(id)

  return id
})

export const loadCustomerTimeline = createAsyncThunk('customers/loadCustomerTimeline', async (id) => {
  const payload = await fetchCustomerTimeline(id)

  return payload.data
})

// Used when navigating straight to a customer's detail view (e.g. from
// the live-chat panel), where only the id is known - the list view's row
// click uses the synchronous customerSelected() action instead, since it
// already has the full customer object in hand.
export const loadCustomer = createAsyncThunk('customers/loadCustomer', async (id) => {
  const payload = await fetchCustomer(id)

  return payload.data
})

const initialState = {
  items: [],
  meta: null,
  status: 'idle',
  error: null,
  actionStatus: 'idle',
  actionError: null,
  selected: null,
  selectedStatus: 'idle',
  timeline: [],
  timelineStatus: 'idle',
}

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    customersErrorCleared(state) {
      state.error = null
      state.actionError = null
    },
    customerSelected(state, action) {
      state.selected = action.payload
      state.selectedStatus = 'succeeded'
    },
    customerSelectionCleared(state) {
      state.selected = null
      state.selectedStatus = 'idle'
      state.timeline = []
      state.timelineStatus = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCustomers.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadCustomers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.data
        state.meta = action.payload.meta
      })
      .addCase(loadCustomers.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'تعذر تحميل العملاء.'
      })
      .addCase(addCustomer.pending, (state) => {
        state.actionStatus = 'loading'
        state.actionError = null
      })
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded'
        state.items.unshift(action.payload)
      })
      .addCase(addCustomer.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.actionError = action.error.message || 'تعذر إنشاء العميل.'
      })
      .addCase(editCustomer.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)

        if (index !== -1) state.items[index] = action.payload
        if (state.selected?.id === action.payload.id) state.selected = action.payload
      })
      .addCase(editCustomer.rejected, (state, action) => {
        state.actionError = action.error.message || 'تعذر تحديث العميل.'
      })
      .addCase(removeCustomer.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(removeCustomer.rejected, (state, action) => {
        state.actionError = action.error.message || 'تعذر حذف العميل.'
      })
      .addCase(loadCustomerTimeline.pending, (state) => {
        state.timelineStatus = 'loading'
      })
      .addCase(loadCustomerTimeline.fulfilled, (state, action) => {
        state.timelineStatus = 'succeeded'
        state.timeline = action.payload
      })
      .addCase(loadCustomerTimeline.rejected, (state) => {
        state.timelineStatus = 'failed'
        state.timeline = []
      })
      .addCase(loadCustomer.pending, (state) => {
        state.selectedStatus = 'loading'
      })
      .addCase(loadCustomer.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded'
        state.selected = action.payload
      })
      .addCase(loadCustomer.rejected, (state) => {
        state.selectedStatus = 'failed'
      })
  },
})

export const { customersErrorCleared, customerSelected, customerSelectionCleared } = customersSlice.actions
export default customersSlice.reducer
