function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// "Today" / "Yesterday" / "12 Apr" / "12 Apr 2025" for an ISO timestamp.
export function formatWornDate(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86400000)

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'

  const sameYear = date.getFullYear() === now.getFullYear()
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}
