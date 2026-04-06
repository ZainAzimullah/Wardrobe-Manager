import mixpanel from 'mixpanel-browser'

const TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN

if (TOKEN) {
  mixpanel.init(TOKEN, { track_pageview: false, persistence: 'localStorage' })
}

export function track(event, props = {}) {
  if (!TOKEN) return
  try {
    mixpanel.track(event, props)
  } catch {
    // analytics failure never breaks the app
  }
}
