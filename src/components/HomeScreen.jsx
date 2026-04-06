import { useEffect } from 'react'
import { useWardrobe } from '../context/WardrobeContext'
import { track } from '../utils/analytics'

export default function HomeScreen({ navigate }) {
  const { items, outfits } = useWardrobe()
  const isEmpty = items.length === 0

  useEffect(() => {
    if (isEmpty) track('empty_state_seen', { screen: 'home' })
  }, [isEmpty])

  return (
    <div className="max-w-md mx-auto px-4 pt-10 pb-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Wardrobe Planner</h1>
      <p className="text-gray-500 text-sm mb-8">Plan outfits from clothes you already own.</p>

      {isEmpty && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 text-center">
          <p className="text-gray-700 font-medium mb-1">Your wardrobe is empty</p>
          <p className="text-gray-500 text-sm mb-4">Add your first item to get started.</p>
          <button
            onClick={() => {
              track('add_item_cta_tapped', { source: 'home_empty_state' })
              navigate('add-item')
            }}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium text-sm"
          >
            Add your first item
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={() => {
            track('wardrobe_opened')
            navigate('wardrobe')
          }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left flex items-center justify-between"
        >
          <div>
            <p className="font-semibold text-gray-900">My Wardrobe</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <span className="text-gray-400 text-xl">›</span>
        </button>

        <button
          onClick={() => navigate('saved-outfits')}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left flex items-center justify-between"
        >
          <div>
            <p className="font-semibold text-gray-900">Saved Outfits</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {outfits.length} {outfits.length === 1 ? 'outfit' : 'outfits'}
            </p>
          </div>
          <span className="text-gray-400 text-xl">›</span>
        </button>

        <button
          onClick={() => navigate('create-outfit')}
          className="bg-gray-900 text-white rounded-2xl p-5 text-left flex items-center justify-between"
        >
          <div>
            <p className="font-semibold">Create Outfit</p>
            <p className="text-sm text-gray-400 mt-0.5">Pick a top + bottom</p>
          </div>
          <span className="text-gray-400 text-xl">›</span>
        </button>
      </div>
    </div>
  )
}
