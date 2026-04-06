import { createContext, useContext, useState, useCallback } from 'react'
import { getItems, addItem as storeAddItem, getOutfits, addOutfit as storeAddOutfit } from '../utils/storage'

const WardrobeContext = createContext(null)

export function WardrobeProvider({ children }) {
  const [items, setItems] = useState(() => getItems())
  const [outfits, setOutfits] = useState(() => getOutfits())

  const addItem = useCallback((item) => {
    storeAddItem(item)
    setItems(getItems())
  }, [])

  const addOutfit = useCallback((outfit) => {
    storeAddOutfit(outfit)
    setOutfits(getOutfits())
  }, [])

  const tops = items.filter((i) => i.type === 'top')
  const bottoms = items.filter((i) => i.type === 'bottom')

  return (
    <WardrobeContext.Provider value={{ items, outfits, tops, bottoms, addItem, addOutfit }}>
      {children}
    </WardrobeContext.Provider>
  )
}

export function useWardrobe() {
  return useContext(WardrobeContext)
}
