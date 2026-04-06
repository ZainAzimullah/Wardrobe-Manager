const ITEMS_KEY = 'wardrobe_items'
const OUTFITS_KEY = 'wardrobe_outfits'

export function getItems() {
  return JSON.parse(localStorage.getItem(ITEMS_KEY) || '[]')
}

export function addItem(item) {
  const items = getItems()
  items.push(item)
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
}

export function getOutfits() {
  const outfits = JSON.parse(localStorage.getItem(OUTFITS_KEY) || '[]')
  return outfits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function addOutfit(outfit) {
  const outfits = JSON.parse(localStorage.getItem(OUTFITS_KEY) || '[]')
  outfits.push(outfit)
  localStorage.setItem(OUTFITS_KEY, JSON.stringify(outfits))
}
