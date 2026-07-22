import { createSlice } from '@reduxjs/toolkit'

// Only the static framing copy lives here now. The numbers come from
// GET /api/tickets/stats via ticketsSlice (state.tickets.stats), which is
// already scoped per role server-side - see TicketService::scopedFilters().
const initialState = {
  heroByRole: {
    admin: {
      title: 'لوحة تحكم المدير',
      description: 'نظرة عامة على أداء جميع الأقسام والمستخدمين في المؤسسة.',
    },
    supervisor: {
      title: 'لوحة تحكم المشرف',
      description: 'تابع أداء فريقك وتذاكر قسمك من مساحة واحدة منظمة.',
    },
    agent: {
      title: 'مرحباً بك في لوحة التحكم',
      description: 'تابع تذاكرك ومحادثاتك اليوم، وحافظ على سرعة الاستجابة لعملائك.',
    },
  },
}

const dashboardsSlice = createSlice({
  name: 'dashboards',
  initialState,
  reducers: {},
})

export default dashboardsSlice.reducer
