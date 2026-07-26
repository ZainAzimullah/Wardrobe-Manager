import { saveClothingItems } from './storage'

// Developer-only loader for the fixed evaluation wardrobe, so scenario
// evaluation and the final user evaluation run against exactly the same
// wardrobe the eval runner uses.
//
// Gated behind the same __developer flag analytics.js already uses, rather
// than inventing a second developer convention.
export function isDeveloper() {
  try {
    return localStorage.getItem('__developer') === 'true'
  } catch {
    return false
  }
}

// The fixture is dynamically imported so its ~2KB stays out of the main bundle
// for the overwhelming majority of users who never load it.
export async function loadEvaluationWardrobe() {
  try {
    const module = await import('../../evals/wardrobe-fixture.json')
    const items = module.default

    // Written through the existing storage helper so the slice 1 quota
    // handling applies here too — a full store fails cleanly.
    return saveClothingItems(items)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown' }
  }
}
