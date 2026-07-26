const ITEMS_KEY = 'wardrobe_items'
const OUTFITS_KEY = 'wardrobe_outfits'

function classifyStorageError(err) {
  if (!err) return 'unknown'
  // Chrome/Safari report code 22, Firefox 1014, and names vary by browser.
  const quota =
    err.name === 'QuotaExceededError' ||
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    err.code === 22 ||
    err.code === 1014
  if (quota) return 'quota'
  if (err.name === 'SecurityError') return 'unavailable'
  return 'unknown'
}

// Writes never throw. Callers get { ok: true } or { ok: false, error }
// so a full or unavailable store surfaces in the UI instead of crashing.
function writeKey(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return { ok: true }
  } catch (err) {
    return { ok: false, error: classifyStorageError(err) }
  }
}

export function loadClothingItems() {
  return JSON.parse(localStorage.getItem(ITEMS_KEY) || '[]')
}

export function saveClothingItems(items) {
  return writeKey(ITEMS_KEY, items)
}

export function loadOutfits() {
  const outfits = JSON.parse(localStorage.getItem(OUTFITS_KEY) || '[]')
  return outfits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function saveOutfits(outfits) {
  return writeKey(OUTFITS_KEY, outfits)
}

// Read-modify-write for existing outfits. Reads raw stored order rather than
// loadOutfits() so saving never reorders what is on disk.
export function updateOutfits(updater) {
  const current = JSON.parse(localStorage.getItem(OUTFITS_KEY) || '[]')
  return writeKey(OUTFITS_KEY, updater(current))
}
