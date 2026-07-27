import { describe, it, expect, vi, beforeEach } from 'vitest'

// callModel is the only network-touching dependency of getRecommendation, so
// mocking it in isolation exercises the retry/attempts bookkeeping with no
// SDK, no network and no API key — the same technique used to verify this
// behaviour by hand in slice 4, made permanent here since this file now
// changes production behaviour (the attempts field the eval runner reads).
vi.mock('./model.js', () => ({ callModel: vi.fn() }))

const { callModel } = await import('./model.js')
const { getRecommendation } = await import('./recommend.js')

const WARDROBE = [
  { id: 'top_01', name: 'Shirt', type: 'top', colour: 'White' },
  { id: 'bottom_01', name: 'Trousers', type: 'bottom', colour: 'Grey' },
]
const REQUEST = { occasion: 'Office day', wardrobe: WARDROBE }

function okPayload() {
  return {
    result: 'recommendation',
    topId: 'top_01',
    bottomId: 'bottom_01',
    explanation: 'A smart combination.',
    unmetRequirement: null,
  }
}

beforeEach(() => {
  callModel.mockReset()
})

describe('getRecommendation — attempts bookkeeping', () => {
  it('reports attempts: 1 when the first response validates', async () => {
    callModel.mockResolvedValueOnce({ ok: true, payload: okPayload() })

    const result = await getRecommendation(REQUEST)

    expect(result).toMatchObject({ status: 'ok', attempts: 1 })
    expect(callModel).toHaveBeenCalledTimes(1)
  })

  it('reports attempts: 2 after one controlled retry succeeds', async () => {
    callModel
      .mockResolvedValueOnce({ ok: true, payload: { result: 'recommendation' } }) // fails validation
      .mockResolvedValueOnce({ ok: true, payload: okPayload() })

    const result = await getRecommendation(REQUEST)

    expect(result).toMatchObject({ status: 'ok', attempts: 2 })
    expect(callModel).toHaveBeenCalledTimes(2)
  })

  it('reports attempts: 2 and invalid_response when both attempts fail validation', async () => {
    callModel.mockResolvedValue({ ok: true, payload: { result: 'recommendation' } })

    const result = await getRecommendation(REQUEST)

    expect(result).toEqual({ status: 'error', code: 'invalid_response', attempts: 2 })
    expect(callModel).toHaveBeenCalledTimes(2)
  })

  it('reports attempts: 1 and never retries a hard provider failure', async () => {
    callModel.mockResolvedValueOnce({ ok: false, code: 'timeout' })

    const result = await getRecommendation(REQUEST)

    expect(result).toEqual({ status: 'error', code: 'timeout', attempts: 1 })
    expect(callModel).toHaveBeenCalledTimes(1)
  })
})
