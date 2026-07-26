import { describe, it, expect } from 'vitest'
import { validateResponse, classifyProviderError } from './validateResponse.js'
import { EXPLANATION_MAX_LENGTH } from './schema.js'
import {
  APIConnectionTimeoutError,
  AuthenticationError,
  RateLimitError,
} from '@anthropic-ai/sdk/error.mjs'

// The wardrobe AS SENT — the authority for every identifier check.
const WARDROBE = [
  { id: 'top_01', name: 'White Oxford shirt', type: 'top', colour: 'White' },
  { id: 'top_02', name: 'Navy merino polo', type: 'top', colour: 'Navy' },
  { id: 'bottom_01', name: 'Charcoal wool trousers', type: 'bottom', colour: 'Grey' },
  { id: 'bottom_02', name: 'Beige chinos', type: 'bottom', colour: 'Other' },
]

function recommendation(overrides = {}) {
  return {
    result: 'recommendation',
    topId: 'top_01',
    bottomId: 'bottom_01',
    explanation: 'The Oxford shirt and wool trousers suit a cold office day.',
    unmetRequirement: null,
    ...overrides,
  }
}

function noMatch(overrides = {}) {
  return {
    result: 'no_match',
    topId: null,
    bottomId: null,
    explanation: 'Nothing in the wardrobe meets a black-tie dress code.',
    unmetRequirement: 'No formal eveningwear is available.',
    ...overrides,
  }
}

describe('validateResponse — baseline', () => {
  it('accepts a valid recommendation', () => {
    const result = validateResponse(recommendation(), WARDROBE)
    expect(result.ok).toBe(true)
    expect(result.result).toEqual({
      status: 'ok',
      topId: 'top_01',
      bottomId: 'bottom_01',
      explanation: 'The Oxford shirt and wool trousers suit a cold office day.',
    })
  })

  it('accepts a valid no-match', () => {
    const result = validateResponse(noMatch(), WARDROBE)
    expect(result.ok).toBe(true)
    expect(result.result.status).toBe('no_match')
    expect(result.result.unmetRequirement).toBe('No formal eveningwear is available.')
  })

  it('never leaks the raw payload into the result', () => {
    const result = validateResponse(recommendation(), WARDROBE)
    expect(Object.keys(result.result).sort()).toEqual([
      'bottomId',
      'explanation',
      'status',
      'topId',
    ])
  })
})

// The twelve invalid-response cases from evaluation plan section 7.
describe('validateResponse — evaluation plan invalid-response cases', () => {
  it('1. rejects an unknown top identifier', () => {
    const result = validateResponse(recommendation({ topId: 'top_99' }), WARDROBE)
    expect(result.ok).toBe(false)
  })

  it('2. rejects an unknown bottom identifier', () => {
    const result = validateResponse(recommendation({ bottomId: 'bottom_99' }), WARDROBE)
    expect(result.ok).toBe(false)
  })

  it('3. rejects two tops and no bottom', () => {
    const result = validateResponse(recommendation({ bottomId: 'top_02' }), WARDROBE)
    expect(result.ok).toBe(false)
  })

  it('4. rejects two bottoms and no top', () => {
    const result = validateResponse(recommendation({ topId: 'bottom_02' }), WARDROBE)
    expect(result.ok).toBe(false)
  })

  it.each([
    ['missing', (p) => { delete p.explanation; return p }],
    ['empty', (p) => ({ ...p, explanation: '' })],
    ['whitespace only', (p) => ({ ...p, explanation: '   ' })],
    ['not a string', (p) => ({ ...p, explanation: 42 })],
  ])('5. rejects an explanation that is %s', (_label, mutate) => {
    expect(validateResponse(mutate(recommendation()), WARDROBE).ok).toBe(false)
  })

  it.each([
    ['a JSON string rather than an object', '{"result":"recommendation"}'],
    ['an array', []],
    ['a number', 7],
    ['missing required keys', { result: 'recommendation', topId: 'top_01' }],
    ['carrying unknown keys', { ...recommendation(), sneaky: 'value' }],
  ])('6. rejects malformed structured output: %s', (_label, payload) => {
    expect(validateResponse(payload, WARDROBE).ok).toBe(false)
  })

  it('7. rejects a valid identifier assigned to the wrong category', () => {
    const result = validateResponse(
      recommendation({ topId: 'bottom_01', bottomId: 'top_01' }),
      WARDROBE,
    )
    expect(result.ok).toBe(false)
  })

  // Cases 8 and 9 assert the documented boundary of this validator rather than
  // rejection. Writing them as rejections would encode a guarantee the system
  // does not make — see technical plan section 7.3.
  it('8. passes an extra invented item mentioned only in descriptive text; identifiers still validate', () => {
    const payload = recommendation({
      explanation: 'Wear the Oxford shirt with the wool trousers and a brown leather belt.',
    })
    const result = validateResponse(payload, WARDROBE)

    expect(result.ok).toBe(true)
    // The guarantee that IS made: only supplied identifiers are ever returned.
    expect(result.result.topId).toBe('top_01')
    expect(result.result.bottomId).toBe('bottom_01')
    // The invented garment is confined to prose and is rubric-scored, not
    // machine-detected. Nothing in the structured result references it.
    expect(Object.values(result.result)).not.toContain('belt')
  })

  it('9. passes a structurally valid success even when no-match was the correct outcome; correctness is scenario-level', () => {
    const payload = recommendation({
      explanation: 'This is the smartest combination available for a black-tie wedding.',
    })
    const result = validateResponse(payload, WARDROBE)

    // Structurally sound, so this validator accepts it. Whether no_match was
    // the RIGHT answer is judged by the evaluation scenario, not here.
    expect(result.ok).toBe(true)
    expect(result.result.status).toBe('ok')
  })

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['an empty object', {}],
    ['an empty string', ''],
  ])('10. rejects an empty response: %s', (_label, payload) => {
    expect(validateResponse(payload, WARDROBE).ok).toBe(false)
  })

  it('11. maps a provider error to provider_error and does not retry', () => {
    expect(classifyProviderError({ name: 'APIError', status: 500 })).toBe('provider_error')
    expect(classifyProviderError({ name: 'RateLimitError', status: 429 })).toBe('provider_error')
    expect(classifyProviderError(new Error('boom'))).toBe('provider_error')
  })

  it('12. maps a request timeout to timeout and does not retry', () => {
    expect(classifyProviderError({ name: 'APIConnectionTimeoutError' })).toBe('timeout')
    expect(classifyProviderError({ code: 'ETIMEDOUT' })).toBe('timeout')
    expect(classifyProviderError({ name: 'APIError', status: 504 })).toBe('timeout')
  })
})

// Real @anthropic-ai/sdk error instances all report `.name === 'Error'` — the
// subclass name only survives on `.constructor.name`. These cases construct
// the actual SDK classes (not plain-object doubles) so a regression here —
// e.g. reverting to a name-only check — fails the suite instead of only
// misbehaving in production.
describe('validateResponse — classifyProviderError against real SDK error instances', () => {
  it('maps a real APIConnectionTimeoutError to timeout', () => {
    const err = new APIConnectionTimeoutError()
    expect(err.name).toBe('Error') // documents the surprising SDK behaviour this guards against
    expect(classifyProviderError(err)).toBe('timeout')
  })

  it('maps a real AuthenticationError to config_error', () => {
    const err = new AuthenticationError(
      401,
      { error: { message: 'bad key' } },
      'Invalid API key',
      new Headers(),
    )
    expect(classifyProviderError(err)).toBe('config_error')
  })

  it('maps a real RateLimitError to provider_error', () => {
    const err = new RateLimitError(
      429,
      { error: { message: 'slow down' } },
      'rate limited',
      new Headers(),
    )
    expect(classifyProviderError(err)).toBe('provider_error')
  })
})

describe('validateResponse — additional guards', () => {
  it('rejects the same identifier used as both top and bottom', () => {
    const result = validateResponse(
      recommendation({ topId: 'top_01', bottomId: 'top_01' }),
      WARDROBE,
    )
    expect(result.ok).toBe(false)
  })

  it.each([
    ['a topId', { topId: 'top_01' }],
    ['a bottomId', { bottomId: 'bottom_01' }],
  ])('rejects a no_match carrying %s', (_label, overrides) => {
    expect(validateResponse(noMatch(overrides), WARDROBE).ok).toBe(false)
  })

  it.each([
    ['missing', { unmetRequirement: null }],
    ['empty', { unmetRequirement: '' }],
  ])('rejects a no_match with an unmetRequirement that is %s', (_label, overrides) => {
    expect(validateResponse(noMatch(overrides), WARDROBE).ok).toBe(false)
  })

  it('rejects a recommendation carrying a non-null unmetRequirement', () => {
    const payload = recommendation({ unmetRequirement: 'Nothing matched perfectly.' })
    expect(validateResponse(payload, WARDROBE).ok).toBe(false)
  })

  it.each([
    ['an unknown value', 'maybe'],
    ['null', null],
    ['a number', 1],
  ])('rejects a result discriminator that is %s', (_label, value) => {
    expect(validateResponse(recommendation({ result: value }), WARDROBE).ok).toBe(false)
  })

  it(`accepts an explanation of exactly ${EXPLANATION_MAX_LENGTH} characters`, () => {
    const payload = recommendation({ explanation: 'a'.repeat(EXPLANATION_MAX_LENGTH) })
    expect(validateResponse(payload, WARDROBE).ok).toBe(true)
  })

  it(`rejects an explanation of ${EXPLANATION_MAX_LENGTH + 1} characters`, () => {
    const payload = recommendation({ explanation: 'a'.repeat(EXPLANATION_MAX_LENGTH + 1) })
    expect(validateResponse(payload, WARDROBE).ok).toBe(false)
  })

  it.each([
    ['an empty wardrobe', []],
    ['a missing wardrobe', undefined],
    ['a non-array wardrobe', 'top_01'],
  ])('rejects any recommendation when the wardrobe is %s', (_label, wardrobe) => {
    expect(validateResponse(recommendation(), wardrobe).ok).toBe(false)
  })

  it('validates against the wardrobe as sent, not a different one', () => {
    const otherWardrobe = [
      { id: 'top_09', name: 'Other shirt', type: 'top', colour: 'White' },
      { id: 'bottom_09', name: 'Other trousers', type: 'bottom', colour: 'Grey' },
    ]
    expect(validateResponse(recommendation(), otherWardrobe).ok).toBe(false)
  })

  it('always reports a reason when it fails', () => {
    const result = validateResponse(recommendation({ topId: 'top_99' }), WARDROBE)
    expect(result.ok).toBe(false)
    expect(typeof result.reason).toBe('string')
    expect(result.reason.length).toBeGreaterThan(0)
  })
})
