// Structured-output schema for the recommendation response.
// Data only — no logic, no imports. Consumed by the model request (slice 4)
// and by validateResponse for field enumeration.

export const SCHEMA_VERSION = 'v1'

// A flat shape discriminated by `result`, chosen over a nested union: easier to
// constrain at generation time, easier to validate, easier to read in
// evaluation output. Every field is required and explicitly nullable where
// absent, so a missing key is a validation failure rather than an ambiguity.
export const RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['result', 'topId', 'bottomId', 'explanation', 'unmetRequirement'],
  properties: {
    result: { type: 'string', enum: ['recommendation', 'no_match'] },
    topId: { anyOf: [{ type: 'string' }, { type: 'null' }] },
    bottomId: { anyOf: [{ type: 'string' }, { type: 'null' }] },
    explanation: { type: 'string' },
    unmetRequirement: { anyOf: [{ type: 'string' }, { type: 'null' }] },
  },
}

// The set of keys a valid payload may carry. Anything else is rejected rather
// than ignored, so an unexpected field is a signal instead of silent drift.
export const RESPONSE_KEYS = Object.freeze([
  'result',
  'topId',
  'bottomId',
  'explanation',
  'unmetRequirement',
])

// Length limits the JSON Schema cannot express — the API's structured-output
// schema support excludes string-length constraints, so the cap is a prompt
// instruction plus this application-side check.
export const EXPLANATION_MAX_LENGTH = 400
export const UNMET_REQUIREMENT_MAX_LENGTH = 400
