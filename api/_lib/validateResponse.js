import {
  RESPONSE_KEYS,
  EXPLANATION_MAX_LENGTH,
  UNMET_REQUIREMENT_MAX_LENGTH,
} from './schema.js'

// Validation of the model payload before anything reaches the render path.
// Pure: takes the payload and the wardrobe AS SENT, returns a result. The sent
// wardrobe is the authority — not live localStorage, which may have changed
// between the request and the response.

function fail(reason) {
  return { ok: false, reason }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export function validateResponse(payload, wardrobe) {
  // 1. Shape.
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return fail('Response is not an object')
  }

  for (const key of RESPONSE_KEYS) {
    if (!(key in payload)) return fail(`Response is missing "${key}"`)
  }

  const unknown = Object.keys(payload).filter((k) => !RESPONSE_KEYS.includes(k))
  if (unknown.length > 0) return fail(`Response has unknown keys: ${unknown.join(', ')}`)

  // 2. Discriminator.
  if (payload.result !== 'recommendation' && payload.result !== 'no_match') {
    return fail('result must be "recommendation" or "no_match"')
  }

  // 5 (checked early — applies to both branches).
  if (!isNonEmptyString(payload.explanation)) return fail('explanation must be a non-empty string')
  if (payload.explanation.length > EXPLANATION_MAX_LENGTH) {
    return fail(`explanation exceeds ${EXPLANATION_MAX_LENGTH} characters`)
  }

  // 3. No-match branch. An identifier present alongside no_match is a
  // validation failure — it is not silently dropped.
  if (payload.result === 'no_match') {
    if (payload.topId !== null) return fail('no_match must not carry a topId')
    if (payload.bottomId !== null) return fail('no_match must not carry a bottomId')
    if (!isNonEmptyString(payload.unmetRequirement)) {
      return fail('no_match requires a non-empty unmetRequirement')
    }
    if (payload.unmetRequirement.length > UNMET_REQUIREMENT_MAX_LENGTH) {
      return fail(`unmetRequirement exceeds ${UNMET_REQUIREMENT_MAX_LENGTH} characters`)
    }

    return {
      ok: true,
      result: {
        status: 'no_match',
        unmetRequirement: payload.unmetRequirement.trim(),
      },
    }
  }

  // 4. Recommendation branch.
  if (payload.unmetRequirement !== null) {
    return fail('recommendation must have a null unmetRequirement')
  }
  if (!isNonEmptyString(payload.topId)) return fail('recommendation requires a topId')
  if (!isNonEmptyString(payload.bottomId)) return fail('recommendation requires a bottomId')
  if (payload.topId === payload.bottomId) {
    return fail('topId and bottomId must be different items')
  }

  const byId = new Map(
    (Array.isArray(wardrobe) ? wardrobe : [])
      .filter((item) => item && typeof item === 'object' && typeof item.id === 'string')
      .map((item) => [item.id, item]),
  )

  const topItem = byId.get(payload.topId)
  if (!topItem) return fail(`topId "${payload.topId}" is not in the supplied wardrobe`)

  const bottomItem = byId.get(payload.bottomId)
  if (!bottomItem) return fail(`bottomId "${payload.bottomId}" is not in the supplied wardrobe`)

  if (topItem.type !== 'top') return fail(`topId "${payload.topId}" is not a top`)
  if (bottomItem.type !== 'bottom') return fail(`bottomId "${payload.bottomId}" is not a bottom`)

  return {
    ok: true,
    result: {
      status: 'ok',
      topId: payload.topId,
      bottomId: payload.bottomId,
      explanation: payload.explanation.trim(),
    },
  }
}

// Maps a provider-level failure to a client error code. Kept here so the slice 3
// suite can assert the mapping before orchestration exists in slice 4.
// None of these outcomes is retried: a retry is only warranted when a response
// was received but failed validation.
export function classifyProviderError(err) {
  if (!err || typeof err !== 'object') return 'provider_error'

  // Real SDK error instances (e.g. APIConnectionTimeoutError) always report
  // err.name === 'Error' — the constructor never overrides it. The actual
  // subclass only survives on err.constructor.name. Checking both keeps this
  // working for real SDK errors and for the plain { name: '...' } doubles used
  // in this file's own test suite, without importing the SDK into this module.
  const label = [
    typeof err.name === 'string' ? err.name : '',
    err.constructor && typeof err.constructor.name === 'string' ? err.constructor.name : '',
  ]
    .join(' ')
    .toLowerCase()
  const status = err.status

  if (label.includes('timeout') || err.code === 'ETIMEDOUT' || status === 408 || status === 504) {
    return 'timeout'
  }
  if (status === 401 || status === 403) return 'config_error'

  return 'provider_error'
}
