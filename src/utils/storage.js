const ITEMS_KEY = 'wardrobe_items'
const OUTFITS_KEY = 'wardrobe_outfits'

export function loadClothingItems() {
  return JSON.parse(localStorage.getItem(ITEMS_KEY) || '[]')
}

export function saveClothingItems(items) {
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
}

export function loadOutfits() {
  const outfits = JSON.parse(localStorage.getItem(OUTFITS_KEY) || '[]')
  return outfits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function saveOutfits(outfits) {
  localStorage.setItem(OUTFITS_KEY, JSON.stringify(outfits))
}
