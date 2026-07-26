import Anthropic from '@anthropic-ai/sdk'
import { RESPONSE_SCHEMA } from './schema.js'
import { SYSTEM_PROMPT, buildUserMessage } from './prompt.js'
import { classifyProviderError } from './validateResponse.js'

// Model configuration per docs/v2-technical-plan.md §5.4. This is the only
// module in the application that imports the Anthropic SDK or touches the
// network — everything else in api/_lib is plain, SDK-free ESM.
export const MODEL_ID = 'claude-sonnet-5'
const EFFORT = 'low'
const MAX_TOKENS = 2000
// Below the function's 30s maxDuration (vercel.json) so a timeout surfaces
// as a recoverable client state rather than a platform 504.
const REQUEST_TIMEOUT_MS = 20000

let cachedClient = null

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null
  if (!cachedClient) cachedClient = new Anthropic({ apiKey })
  return cachedClient
}

// Calls the model for one recommendation attempt.
//
// Returns:
//   { ok: true, payload }              — a response was received. `payload`
//                                         is the parsed JSON object, or null
//                                         if the content was missing/malformed.
//                                         Either way this is handed to
//                                         validateResponse(), which already
//                                         treats null/malformed input as a
//                                         validation failure — so a garbled
//                                         model response and a schema
//                                         violation are handled by the same
//                                         one-retry path.
//   { ok: false, code }                — a hard failure: config_error,
//                                         provider_error or timeout. Never
//                                         retried by the caller.
export async function callModel(request) {
  const client = getClient()
  if (!client) return { ok: false, code: 'config_error' }

  let response
  try {
    response = await client.messages.create(
      {
        model: MODEL_ID,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        output_config: {
          effort: EFFORT,
          format: { type: 'json_schema', schema: RESPONSE_SCHEMA },
        },
        messages: [{ role: 'user', content: buildUserMessage(request) }],
      },
      { timeout: REQUEST_TIMEOUT_MS },
    )
  } catch (err) {
    return { ok: false, code: classifyProviderError(err) }
  }

  // A safety-classifier decline is a provider-level outcome, not a content
  // validation failure — per the technical plan it is never retried.
  if (response.stop_reason === 'refusal') {
    return { ok: false, code: 'provider_error' }
  }

  const textBlock = response.content.find((block) => block.type === 'text')
  if (!textBlock) return { ok: true, payload: null }

  try {
    return { ok: true, payload: JSON.parse(textBlock.text) }
  } catch {
    // Malformed structured output (evaluation plan case 6). Not a hard
    // failure at this layer — validateResponse rejects a null payload the
    // same way it rejects any other malformed shape, so the one-retry path
    // applies uniformly.
    return { ok: true, payload: null }
  }
}
