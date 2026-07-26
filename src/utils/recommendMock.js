// SLICE 3 ONLY — replaced by src/utils/recommend.js in slice 4.
//
// Returns the three real endpoint response shapes so the UI is built against
// the actual contract rather than a placeholder. The signature matches the
// real module, so slice 4 is: add recommend.js, change one import, delete this.

const DELAY_MS = 700

const MOCK_STATES = [
  'success',
  'no_match',
  'invalid_response',
  'timeout',
  'provider_error',
  'config_error',
  'unresolvable',
]

export { MOCK_STATES }

function pickPair(wardrobe) {
  const top = wardrobe.find((i) => i.type === 'top')
  const bottom = wardrobe.find((i) => i.type === 'bottom')
  return { top, bottom }
}

export async function requestRecommendation(request, { mockState = 'success' } = {}) {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS))

  const { top, bottom } = pickPair(request.wardrobe ?? [])

  switch (mockState) {
    case 'no_match':
      return {
        status: 'no_match',
        unmetRequirement:
          'Nothing in your wardrobe meets a formal black-tie dress code — there is no eveningwear saved.',
      }

    case 'invalid_response':
      return { status: 'error', code: 'invalid_response' }

    case 'timeout':
      return { status: 'error', code: 'timeout' }

    case 'provider_error':
      return { status: 'error', code: 'provider_error' }

    case 'config_error':
      return { status: 'error', code: 'config_error' }

    // Returns identifiers that are not in the wardrobe, to exercise the
    // client-side re-resolution guard behind RD-3.
    case 'unresolvable':
      return {
        status: 'ok',
        topId: 'top_does_not_exist',
        bottomId: 'bottom_does_not_exist',
        explanation: 'This response references items that are not in your wardrobe.',
      }

    case 'success':
    default:
      return {
        status: 'ok',
        topId: top?.id ?? null,
        bottomId: bottom?.id ?? null,
        // Deliberately describes the garments loosely. The UI must render item
        // details from the wardrobe record, never from this text (RD-3).
        explanation:
          'These two work well together for the occasion and stay comfortable in the conditions you described.',
      }
  }
}
