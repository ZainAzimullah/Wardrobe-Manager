import { useState } from 'react'
import { useWardrobe } from '../context/WardrobeContext'
import { track } from '../utils/analytics'
import { colourStyle } from '../utils/colours'

export default function OutfitDetail({ navigate, params }) {
  const { getOutfitWithItems } = useWardrobe()
  const [worn, setWorn] = useState(false)

  const resolved = getOutfitWithItems(params.outfitId)
  const outfit = resolved
  const top = resolved?.top ?? null
  const bottom = resolved?.bottom ?? null

  if (!outfit) {
    return (
      <div className="max-w-md mx-auto px-4 pt-10">
        <p className="text-gray-500 text-sm">Outfit not found.</p>
        <button onClick={() => navigate('saved-outfits')} className="text-sm text-gray-900 mt-4 underline">
          ‹ Back to Outfits
        </button>
      </div>
    )
  }

  function handleWear() {
    track('outfit_worn', { outfitId: outfit.id })
    setWorn(true)
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
      <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-6">
        <button onClick={() => navigate('saved-outfits')} className="text-gray-500 text-sm">
          ‹ Back
        </button>
        <h1 className="font-semibold text-gray-900 truncate max-w-[200px]">{outfit.name}</h1>
        <div className="w-10" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{outfit.name}</h2>
        <div className="flex flex-col gap-5">
          <ItemSection label="Top" item={top} />
          <div className="border-t border-gray-100" />
          <ItemSection label="Bottom" item={bottom} />
        </div>
      </div>

      {worn ? (
        <div className="w-full bg-green-50 border border-green-100 rounded-xl py-4 text-center">
          <p className="text-green-700 font-medium">✓ Outfit chosen for today</p>
        </div>
      ) : (
        <button
          onClick={handleWear}
          className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium text-sm"
        >
          Wear this
        </button>
      )}
    </div>
  )
}

function ItemSection({ label, item }) {
  if (!item) return null
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full flex-shrink-0" style={colourStyle(item.colour)} />
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="font-medium text-gray-900">{item.name}</p>
        <p className="text-sm text-gray-500">{item.colour}</p>
      </div>
    </div>
  )
}
