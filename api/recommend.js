import { validateRequest } from './_lib/validateRequest.js'
import { getRecommendation } from './_lib/recommend.js'

// Mirrors PRD RI-5 / technical plan §6. Checked before the body is used for
// anything, so an oversized request is rejected without ever reaching the model.
const MAX_BODY_BYTES = 64 * 1024

// HTTP status for each documented error code (technical plan §5.3).
const ERROR_STATUS = {
  bad_request: 400,
  invalid_response: 502,
  timeout: 504,
  provider_error: 502,
  config_error: 500,
}

function sendError(res, code, httpStatus) {
  // Never echoes the API key, the system prompt, or the provider's raw error —
  // only the documented { status, code } shape.
  res.status(httpStatus).json({ status: 'error', code })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    sendError(res, 'bad_request', ERROR_STATUS.bad_request)
    return
  }

  // Vercel's Node runtime parses a JSON request body into req.body
  // automatically. content-length lets us reject an oversized request before
  // that parsed body is used for anything; if the header is absent or
  // understates the size, the serialized-body check just below is the
  // fallback, bounded in turn by Vercel's own platform-level request size cap.
  const contentLength = Number(req.headers['content-length'] || 0)
  if (contentLength > MAX_BODY_BYTES) {
    sendError(res, 'bad_request', ERROR_STATUS.bad_request)
    return
  }

  let bodySize = 0
  try {
    bodySize = Buffer.byteLength(JSON.stringify(req.body ?? {}))
  } catch {
    sendError(res, 'bad_request', ERROR_STATUS.bad_request)
    return
  }
  if (bodySize > MAX_BODY_BYTES) {
    sendError(res, 'bad_request', ERROR_STATUS.bad_request)
    return
  }

  const validated = validateRequest(req.body)
  if (!validated.ok) {
    sendError(res, 'bad_request', ERROR_STATUS.bad_request)
    return
  }

  const result = await getRecommendation(validated.request)

  if (result.status === 'error') {
    sendError(res, result.code, ERROR_STATUS[result.code] ?? ERROR_STATUS.provider_error)
    return
  }

  // status is 'ok' or 'no_match' — both are a successful application outcome.
  res.status(200).json(result)
}
