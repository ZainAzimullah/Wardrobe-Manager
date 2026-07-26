import { describe, it, expect } from 'vitest'
import { validateRequest, LIMITS } from './validateRequest.js'

const top = { id: 'top_01', name: 'White Oxford shirt', type: 'top', colour: 'White' }
const bottom = { id: 'bottom_01', name: 'Charcoal wool trousers', type: 'bottom', colour: 'Grey' }

function build(overrides = {}) {
  return { occasion: 'Office day', wardrobe: [top, bottom], ...overrides }
}

describe('validateRequest — shape', () => {
  it('accepts a minimal valid request', () => {
    const result = validateRequest(build())
    expect(result.ok).toBe(true)
    expect(result.request.occasion).toBe('Office day')
    expect(result.request.wardrobe).toHaveLength(2)
  })

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a string', 'occasion'],
    ['an array', []],
  ])('rejects a body that is %s', (_label, body) => {
    expect(validateRequest(body).ok).toBe(false)
  })

  it('reports bad_request as the error code', () => {
    expect(validateRequest(null).code).toBe('bad_request')
  })
})

describe('validateRequest — occasion (RI-1, RI-5)', () => {
  it('rejects a missing occasion', () => {
    const body = build()
    delete body.occasion
    expect(validateRequest(body).ok).toBe(false)
  })

  it('rejects an empty occasion', () => {
    expect(validateRequest(build({ occasion: '' })).ok).toBe(false)
  })

  it('rejects a whitespace-only occasion', () => {
    expect(validateRequest(build({ occasion: '   ' })).ok).toBe(false)
  })

  it('rejects a non-string occasion', () => {
    expect(validateRequest(build({ occasion: 42 })).ok).toBe(false)
  })

  it('trims surrounding whitespace', () => {
    const result = validateRequest(build({ occasion: '  Client dinner  ' }))
    expect(result.request.occasion).toBe('Client dinner')
  })

  it(`accepts exactly ${LIMITS.OCCASION_MAX} characters`, () => {
    const result = validateRequest(build({ occasion: 'a'.repeat(LIMITS.OCCASION_MAX) }))
    expect(result.ok).toBe(true)
  })

  it(`rejects ${LIMITS.OCCASION_MAX + 1} characters`, () => {
    const result = validateRequest(build({ occasion: 'a'.repeat(LIMITS.OCCASION_MAX + 1) }))
    expect(result.ok).toBe(false)
  })
})

describe('validateRequest — optional text (RI-2, RI-3, RI-5)', () => {
  it('accepts a request with no weather or preferences', () => {
    const result = validateRequest(build())
    expect(result.ok).toBe(true)
    expect(result.request.weather).toBeUndefined()
    expect(result.request.preferences).toBeUndefined()
  })

  it.each([
    ['weather', 'WEATHER_MAX'],
    ['preferences', 'PREFERENCES_MAX'],
  ])('accepts %s at exactly its limit', (field, limitKey) => {
    const result = validateRequest(build({ [field]: 'a'.repeat(LIMITS[limitKey]) }))
    expect(result.ok).toBe(true)
  })

  it.each([
    ['weather', 'WEATHER_MAX'],
    ['preferences', 'PREFERENCES_MAX'],
  ])('rejects %s one character over its limit', (field, limitKey) => {
    const result = validateRequest(build({ [field]: 'a'.repeat(LIMITS[limitKey] + 1) }))
    expect(result.ok).toBe(false)
  })

  it.each([null, '', '   '])('normalises an empty weather value (%p) to undefined', (value) => {
    const result = validateRequest(build({ weather: value }))
    expect(result.ok).toBe(true)
    expect(result.request.weather).toBeUndefined()
  })

  it('rejects a non-string preferences value', () => {
    expect(validateRequest(build({ preferences: { avoid: 'linen' } })).ok).toBe(false)
  })
})

describe('validateRequest — wardrobe size (RI-4, RI-5)', () => {
  it('rejects a non-array wardrobe', () => {
    expect(validateRequest(build({ wardrobe: 'everything' })).ok).toBe(false)
  })

  it('rejects fewer than the minimum items', () => {
    expect(validateRequest(build({ wardrobe: [top] })).ok).toBe(false)
  })

  it(`accepts exactly ${LIMITS.WARDROBE_MAX} items`, () => {
    const wardrobe = Array.from({ length: LIMITS.WARDROBE_MAX }, (_, i) =>
      i === 0 ? bottom : { ...top, id: `top_${i}` },
    )
    expect(validateRequest(build({ wardrobe })).ok).toBe(true)
  })

  it(`rejects ${LIMITS.WARDROBE_MAX + 1} items`, () => {
    const wardrobe = Array.from({ length: LIMITS.WARDROBE_MAX + 1 }, (_, i) =>
      i === 0 ? bottom : { ...top, id: `top_${i}` },
    )
    expect(validateRequest(build({ wardrobe })).ok).toBe(false)
  })

  it('rejects a wardrobe of only tops', () => {
    const wardrobe = [top, { ...top, id: 'top_02' }]
    expect(validateRequest(build({ wardrobe })).ok).toBe(false)
  })

  it('rejects a wardrobe of only bottoms', () => {
    const wardrobe = [bottom, { ...bottom, id: 'bottom_02' }]
    expect(validateRequest(build({ wardrobe })).ok).toBe(false)
  })
})

describe('validateRequest — wardrobe items', () => {
  it.each([
    ['a missing id', { ...top, id: undefined }],
    ['an empty id', { ...top, id: '  ' }],
    ['a missing name', { ...top, name: undefined }],
    ['a missing colour', { ...top, colour: undefined }],
    ['an invalid type', { ...top, type: 'shoes' }],
    ['a null item', null],
    ['a non-object item', 'top_01'],
  ])('rejects an item with %s', (_label, item) => {
    expect(validateRequest(build({ wardrobe: [item, bottom] })).ok).toBe(false)
  })

  it('rejects duplicate item ids', () => {
    expect(validateRequest(build({ wardrobe: [top, { ...bottom, id: top.id }] })).ok).toBe(false)
  })

  it.each([
    ['id', 'ITEM_ID_MAX'],
    ['name', 'ITEM_NAME_MAX'],
    ['details', 'ITEM_DETAILS_MAX'],
  ])('rejects an item %s one character over its limit', (field, limitKey) => {
    const item = { ...top, [field]: 'a'.repeat(LIMITS[limitKey] + 1) }
    expect(validateRequest(build({ wardrobe: [item, bottom] })).ok).toBe(false)
  })

  it(`accepts details at exactly ${LIMITS.ITEM_DETAILS_MAX} characters`, () => {
    const item = { ...top, details: 'a'.repeat(LIMITS.ITEM_DETAILS_MAX) }
    expect(validateRequest(build({ wardrobe: [item, bottom] })).ok).toBe(true)
  })

  it('preserves details when present', () => {
    const item = { ...top, details: 'Cotton, smart, long-sleeved' }
    const result = validateRequest(build({ wardrobe: [item, bottom] }))
    expect(result.request.wardrobe[0].details).toBe('Cotton, smart, long-sleeved')
  })

  it('omits details when absent or empty', () => {
    const result = validateRequest(build({ wardrobe: [{ ...top, details: '' }, bottom] }))
    expect('details' in result.request.wardrobe[0]).toBe(false)
  })
})

describe('validateRequest — re-projection', () => {
  it('strips photo and createdAt from wardrobe items', () => {
    const item = {
      ...top,
      photo: 'data:image/jpeg;base64,AAAA',
      createdAt: '2026-01-01T00:00:00.000Z',
    }
    const result = validateRequest(build({ wardrobe: [item, bottom] }))
    expect(result.request.wardrobe[0]).toEqual({
      id: top.id,
      name: top.name,
      type: top.type,
      colour: top.colour,
    })
  })

  it('strips unknown keys from wardrobe items', () => {
    const item = { ...top, lastWornAt: '2026-01-01', secret: 'x' }
    const result = validateRequest(build({ wardrobe: [item, bottom] }))
    expect(Object.keys(result.request.wardrobe[0]).sort()).toEqual([
      'colour',
      'id',
      'name',
      'type',
    ])
  })

  it('strips unknown top-level keys from the request', () => {
    const result = validateRequest(build({ apiKey: 'sk-leak', debug: true }))
    expect(Object.keys(result.request).sort()).toEqual(['occasion', 'wardrobe'])
  })
})
