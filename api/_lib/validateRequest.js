// Inbound request validation. Pure: takes the parsed body, returns a result.
// Limits mirror PRD RI-5 so the product requirement and the implementation
// cannot drift apart. The interface enforces them for feedback; this enforces
// them for safety.

export const LIMITS = Object.freeze({
  OCCASION_MAX: 120,
  WEATHER_MAX: 80,
  PREFERENCES_MAX: 300,
  ITEM_ID_MAX: 64,
  ITEM_NAME_MAX: 120,
  ITEM_DETAILS_MAX: 200,
  WARDROBE_MIN: 2,
  WARDROBE_MAX: 60,
})

const VALID_TYPES = new Set(['top', 'bottom'])

function fail(reason) {
  return { ok: false, code: 'bad_request', reason }
}

// Optional free-text: absent, null and empty all normalise to undefined.
function normaliseOptionalText(value, max, label) {
  if (value === undefined || value === null || value === '') return { ok: true }
  if (typeof value !== 'string') return fail(`${label} must be a string`)

  const trimmed = value.trim()
  if (!trimmed) return { ok: true }
  if (trimmed.length > max) return fail(`${label} exceeds ${max} characters`)

  return { ok: true, value: trimmed }
}

export function validateRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return fail('Request body must be an object')
  }

  // Occasion — the only required field.
  if (typeof body.occasion !== 'string') return fail('occasion is required')
  const occasion = body.occasion.trim()
  if (!occasion) return fail('occasion is required')
  if (occasion.length > LIMITS.OCCASION_MAX) {
    return fail(`occasion exceeds ${LIMITS.OCCASION_MAX} characters`)
  }

  const weather = normaliseOptionalText(body.weather, LIMITS.WEATHER_MAX, 'weather')
  if (!weather.ok) return weather

  const preferences = normaliseOptionalText(
    body.preferences,
    LIMITS.PREFERENCES_MAX,
    'preferences',
  )
  if (!preferences.ok) return preferences

  // Wardrobe.
  if (!Array.isArray(body.wardrobe)) return fail('wardrobe must be an array')
  if (body.wardrobe.length < LIMITS.WARDROBE_MIN) {
    return fail(`wardrobe must contain at least ${LIMITS.WARDROBE_MIN} items`)
  }
  if (body.wardrobe.length > LIMITS.WARDROBE_MAX) {
    return fail(`wardrobe must contain at most ${LIMITS.WARDROBE_MAX} items`)
  }

  const wardrobe = []
  const seenIds = new Set()

  for (const raw of body.wardrobe) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return fail('Each wardrobe item must be an object')
    }

    if (typeof raw.id !== 'string' || !raw.id.trim()) return fail('Item id is required')
    const id = raw.id.trim()
    if (id.length > LIMITS.ITEM_ID_MAX) {
      return fail(`Item id exceeds ${LIMITS.ITEM_ID_MAX} characters`)
    }
    if (seenIds.has(id)) return fail(`Duplicate item id: ${id}`)
    seenIds.add(id)

    if (typeof raw.name !== 'string' || !raw.name.trim()) return fail('Item name is required')
    const name = raw.name.trim()
    if (name.length > LIMITS.ITEM_NAME_MAX) {
      return fail(`Item name exceeds ${LIMITS.ITEM_NAME_MAX} characters`)
    }

    if (!VALID_TYPES.has(raw.type)) return fail('Item type must be "top" or "bottom"')

    if (typeof raw.colour !== 'string' || !raw.colour.trim()) {
      return fail('Item colour is required')
    }
    const colour = raw.colour.trim()

    // Re-projected here rather than trusting the client's projection, so
    // unknown keys are dropped instead of forwarded to the model.
    const item = { id, name, type: raw.type, colour }

    if (raw.details !== undefined && raw.details !== null && raw.details !== '') {
      if (typeof raw.details !== 'string') return fail('Item details must be a string')
      const details = raw.details.trim()
      if (details.length > LIMITS.ITEM_DETAILS_MAX) {
        return fail(`Item details exceeds ${LIMITS.ITEM_DETAILS_MAX} characters`)
      }
      if (details) item.details = details
    }

    wardrobe.push(item)
  }

  if (!wardrobe.some((i) => i.type === 'top')) return fail('wardrobe must include at least one top')
  if (!wardrobe.some((i) => i.type === 'bottom')) {
    return fail('wardrobe must include at least one bottom')
  }

  const request = { occasion, wardrobe }
  if (weather.value) request.weather = weather.value
  if (preferences.value) request.preferences = preferences.value

  return { ok: true, request }
}
