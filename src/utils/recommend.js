// The live recommendation endpoint. Same call signature as the slice 3 mock
// it replaces: requestRecommendation(request) => Promise<one of the three
// documented response shapes>.

const ENDPOINT = '/api/recommend'
// Above the endpoint's own 30s maxDuration (vercel.json), so a genuinely
// hung network request also resolves to a clear state instead of leaving
// the UI's loading state stuck indefinitely.
const CLIENT_TIMEOUT_MS = 35000

export async function requestRecommendation(request) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS)

  let response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      return { status: 'error', code: 'timeout' }
    }
    // fetch itself only rejects for network-level failures (offline, DNS,
    // connection refused) — a reachable server that answers with any HTTP
    // status, including 404, does not land here.
    return { status: 'error', code: 'provider_error' }
  }

  clearTimeout(timeoutId)

  // The server always returns one of the three documented shapes in the
  // body, whether the HTTP status is 200 or an error code — read it either way.
  try {
    return await response.json()
  } catch {
    // Reachable, but the body wasn't the documented JSON shape (e.g. a 404
    // from a dev server that isn't serving /api at all) — distinct from a
    // provider failure, so it gets the "couldn't be checked" copy instead of
    // "service unavailable".
    return { status: 'error', code: 'invalid_response' }
  }
}
