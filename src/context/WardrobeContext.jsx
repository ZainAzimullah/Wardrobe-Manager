import { createContext, useContext, useState, useCallback } from 'react'
import {
  loadClothingItems,
  saveClothingItems,
  loadOutfits,
  saveOutfits,
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
      value={{ clothingItems, outfits, tops, bottoms, addClothingItem, addOutfit, getOutfitWithItems }}
    >
      {children}
    </WardrobeContext.Provider>
  )
}

export function useWardrobe() {
  return useContext(WardrobeContext)
}
