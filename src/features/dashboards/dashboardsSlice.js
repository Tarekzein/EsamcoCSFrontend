import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  statsByRole: {
    admin: {
      hero: {
        title: 'لوحة تحكم المدير',
        description: 'نظرة عامة على أداء جميع الأقسام والمستخدمين في المؤسسة.',
      },
      stats: [
        { label: 'إجمالي المستخدمين', value: '360', note: 'عبر جميع الأقسام', tone: 'emerald' },
        { label: 'التذاكر المفتوحة', value: '58', note: 'تحتاج مراجعة', tone: 'blue' },
        { label: 'متوسط زمن الاستجابة', value: '8 د', note: 'ضمن النطاق', tone: 'amber' },
      ],
    },
    supervisor: {
      hero: {
        title: 'لوحة تحكم المشرف',
        description: 'تابع أداء فريقك وتذاكر قسمك من مساحة واحدة منظمة.',
      },
      stats: [
        { label: 'الوكلاء في قسمي', value: '8', note: 'نشطون الآن', tone: 'emerald' },
        { label: 'تذاكر القسم المفتوحة', value: '24', note: 'تحتاج مراجعة', tone: 'blue' },
        { label: 'متوسط استجابة القسم', value: '7 د', note: 'ضمن النطاق', tone: 'amber' },
      ],
    },
    agent: {
      hero: {
        title: 'مرحباً بك في لوحة التحكم',
        description: 'تابع تذاكرك ومحادثاتك اليوم، وحافظ على سرعة الاستجابة لعملائك.',
      },
      stats: [
        { label: 'عملائي النشطون', value: '42', note: 'جاهز للمتابعة', tone: 'emerald' },
        { label: 'تذاكري المفتوحة', value: '6', note: 'تحتاج مراجعة', tone: 'blue' },
        { label: 'متوسط زمن استجابتي', value: '5 د', note: 'ضمن النطاق', tone: 'amber' },
      ],
    },
  },
}

const dashboardsSlice = createSlice({
  name: 'dashboards',
  initialState,
  reducers: {},
})

export default dashboardsSlice.reducer
