function pluralizeArabic(count, forms) {
  const [singular, dual, plural, many] = forms

  if (count === 1) return singular
  if (count === 2) return dual
  if (count >= 3 && count <= 10) return `${count} ${plural}`

  return `${count} ${many}`
}

export function timeAgoAr(dateInput) {
  if (!dateInput) return ''

  const date = new Date(dateInput)
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))

  if (seconds < 60) return 'الآن'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `منذ ${pluralizeArabic(minutes, ['دقيقة', 'دقيقتين', 'دقائق', 'دقيقة'])}`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `منذ ${pluralizeArabic(hours, ['ساعة', 'ساعتين', 'ساعات', 'ساعة'])}`
  }

  const days = Math.floor(hours / 24)
  return `منذ ${pluralizeArabic(days, ['يوم', 'يومين', 'أيام', 'يوماً'])}`
}
