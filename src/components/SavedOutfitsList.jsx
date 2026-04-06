import { useEffect } from 'react'
import { useWardrobe } from '../context/WardrobeContext'
import { track } from '../utils/analytics'
import { colourStyle } from '../utils/colours'

export default function SavedOutfitsList({ navigate }) {
  const { outfits, items } = useWardrobe()
  const isEmpty = outfits.length === 0

  useEffect(() => {
    if (isEmpty) track('empty_state_seen', { screen: 'saved_outfits' })
  }, [isEmpty])

  function getItem(id) {
    return items.find((i) => i.id === id)
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
      <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-4">
        <button onClick={() => navigate('home')} className="text-gray-500 text-sm">
          ‹ Back
        </button>
        <h1 className="font-semibold text-gray-900">Saved Outfits</h1>
        <div className="w-10" />
      </div>

      {isEmpty ? (
        <div className="text-center py-16">
          <p className="text-gray-700 font-medium mb-1">No outfits saved yet.</p>
          <p className="text-gray-500 text-sm mb-6">Create one to save time getting dressed.</p>
          <button
            onClick={() => navigate('create-outfit')}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-medium"
          >
            Create your first outfit
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {outfits.map((outfit) => {
            const top = getItem(outfit.topId)
            const bottom = getItem(outfit.bottomId)
            return (
              <button
                key={outfit.id}
                onClick={() => {
                  track('outfit_viewed', { outfitId: outfit.id })
                  navigate('outfit-detail', { outfitId: outfit.id })
                }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left"
              >
                <p className="font-semibold text-gray-900 mb-3">{outfit.name}</p>
                <div className="flex flex-col gap-2">
                  <ItemRow label="Top" item={top} />
                  <ItemRow label="Bottom" item={bottom} />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ItemRow({ label, item }) {
  if (!item) return null
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-12">{label}</span>
      <div className="w-5 h-5 rounded-full flex-shrink-0" style={colourStyle(item.colour)} />
      <span className="text-sm text-gray-700">{item.name}</span>
    </div>
  )
}
