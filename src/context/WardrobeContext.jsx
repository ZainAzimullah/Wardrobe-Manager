import { createContext, useContext, useState, useCallback } from 'react'
import {
  loadClothingItems,
  saveClothingItems,
  loadOutfits,
  saveOutfits,
  updateOutfits,
} from '../utils/storage'

const WardrobeContext = createContext(null)

export function WardrobeProvider({ children }) {
  const [clothingItems, setClothingItems] = useState(() => loadClothingItems())
  const [outfits, setOutfits] = useState(() => loadOutfits())

  const addClothingItem = useCallback((item) => {
    const updated = [...loadClothingItems(), item]
    saveClothingItems(updated)
    setClothingItems(loadClothingItems())
  }, [])

  const addOutfit = useCallback((outfit) => {
    const raw = JSON.parse(localStorage.getItem('wardrobe_outfits') || '[]')
    const updated = [...raw, outfit]
    saveOutfits(updated)
    setOutfits(loadOutfits())
  }, [])

  // Records the most recent wear only. Any previous lastWornAt is overwritten.
  // Returns the storage result so the caller can surface a failure.
  const markOutfitWorn = useCallback((outfitId) => {
    const wornAt = new Date().toISOString()
    const result = updateOutfits((current) =>
      current.map((o) => (o.id === outfitId ? { ...o, lastWornAt: wornAt } : o)),
    )
    if (result.ok) setOutfits(loadOutfits())
    return result
  }, [])

  const getOutfitWithItems = useCallback(
    (outfitId) => {
      const outfit = outfits.find((o) => o.id === outfitId)
      if (!outfit) return null
      return {
        ...outfit,
        top: clothingItems.find((i) => i.id === outfit.topId) ?? null,
        bottom: clothingItems.find((i) => i.id === outfit.bottomId) ?? null,
      }
    },
    [outfits, clothingItems],
  )

  const tops = clothingItems.filter((i) => i.type === 'top')
  const bottoms = clothingItems.filter((i) => i.type === 'bottom')

  return (
    <WardrobeContext.Provider
      value={{
        clothingItems,
        outfits,
        tops,
        bottoms,
        addClothingItem,
        addOutfit,
        markOutfitWorn,
        getOutfitWithItems,
      }}
    >
      {children}
    </WardrobeContext.Provider>
  )
}

export function useWardrobe() {
  return useContext(WardrobeContext)
}
