import mixpanel from 'mixpanel-browser'

const TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN

function getOrCreateUserId() {
  const key = '__mp_uid'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

if (TOKEN) {
  mixpanel.init(TOKEN, { track_pageview: false, persistence: 'localStorage' })
  mixpanel.identify(getOrCreateUserId())
}

export function track(event, props = {}) {
  if (!TOKEN) return
  try {
    mixpanel.track(event, props)
  } catch {
    // analytics failure never breaks the app
  }
}
