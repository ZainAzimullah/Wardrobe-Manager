import { useEffect, useState } from 'react'
import { useWardrobe } from '../context/WardrobeContext'
import { track } from '../utils/analytics'
import { isDeveloper, loadEvaluationWardrobe } from '../utils/devFixture'

export default function HomeScreen({ navigate }) {
  const { clothingItems, outfits } = useWardrobe()
  const isEmpty = clothingItems.length === 0
  const showDevTools = isDeveloper()
  const [fixtureError, setFixtureError] = useState(null)

  useEffect(() => {
    if (isEmpty) track('empty_state_seen', { screen: 'home' })
  }, [isEmpty])

  async function handleLoadFixture() {
    if (clothingItems.length > 0) {
      const confirmed = window.confirm(
        `This replaces your current wardrobe (${clothingItems.length} item${
          clothingItems.length === 1 ? '' : 's'
        }) with the fixed evaluation fixture. This cannot be undone. Continue?`,
      )
      if (!confirmed) return
    }

    const result = await loadEvaluationWardrobe()
    if (result.ok) {
      // The context reads from localStorage on mount, so a reload is the
      // simplest way to pick up a wholesale wardrobe replacement.
      window.location.reload()
    } else {
      setFixtureError(result.error)
    }
  }

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
              {clothingItems.length} {clothingItems.length === 1 ? 'item' : 'items'}
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

        <button
          onClick={() => navigate('recommend')}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left flex items-center justify-between"
        >
          <div>
            <p className="font-semibold text-gray-900">Suggest an Outfit</p>
            <p className="text-sm text-gray-500 mt-0.5">Get a suggestion for an occasion</p>
          </div>
          <span className="text-gray-400 text-xl">›</span>
        </button>
      </div>

      {showDevTools && (
        <div className="mt-8 bg-gray-100 border border-gray-200 rounded-xl p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Developer
          </p>
          <button
            onClick={handleLoadFixture}
            className="text-sm font-medium text-gray-900 underline"
          >
            Load evaluation wardrobe
          </button>
          <p className="text-xs text-gray-500 mt-1.5">
            Replaces your wardrobe with the fixed 10-item evaluation fixture.
          </p>
          {fixtureError && (
            <p role="alert" className="text-xs text-red-700 mt-2">
              Couldn’t load the fixture ({fixtureError}).
            </p>
          )}
        </div>
      )}
    </div>
  )
}
