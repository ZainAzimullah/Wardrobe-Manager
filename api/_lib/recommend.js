import { callModel } from './model.js'
import { validateResponse } from './validateResponse.js'

// One original attempt plus exactly one retry — and only when the model DID
// respond but the response failed structural or semantic validation. A hard
// failure from callModel (config_error / provider_error / timeout) returns
// immediately below and never reaches the retry loop.
const MAX_ATTEMPTS = 2

// Orchestrates one recommendation request end to end. `request` is the
// already-validated, re-projected object from validateRequest() — its
// `wardrobe` is the authority validateResponse checks returned ids against.
//
// Returns exactly one of the three documented client-facing shapes:
//   { status: 'ok', topId, bottomId, explanation }
//   { status: 'no_match', unmetRequirement }
//   { status: 'error', code }
export async function getRecommendation(request) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const modelResult = await callModel(request)

    if (!modelResult.ok) {
      // config_error / provider_error / timeout — never retried.
      return { status: 'error', code: modelResult.code }
    }

    const validation = validateResponse(modelResult.payload, request.wardrobe)
    if (validation.ok) return validation.result

    // Falls through to the next loop iteration only while attempts remain —
    // this is the single controlled retry.
  }

  return { status: 'error', code: 'invalid_response' }
}
