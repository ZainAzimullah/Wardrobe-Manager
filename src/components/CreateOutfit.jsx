import { useState } from 'react'
import { useWardrobe } from '../context/WardrobeContext'
import { track } from '../utils/analytics'
import { generateId } from '../utils/ids'
import { colourStyle } from '../utils/colours'

export default function CreateOutfit({ navigate, params }) {
  const { tops, bottoms, outfits, addOutfit } = useWardrobe()
  const [name, setName] = useState('')
  const [selectedTop, setSelectedTop] = useState(params.selectedTop || null)
  const [selectedBottom, setSelectedBottom] = useState(params.selectedBottom || null)

  const hasTops = tops.length > 0
  const hasBottoms = bottoms.length > 0
  const canSave = selectedTop && selectedBottom

  function handleSave() {
    if (!canSave) return

    const outfitName = name.trim() || `Outfit ${outfits.length + 1}`
    const outfit = {
      id: generateId('out'),
      name: outfitName,
      topId: selectedTop.id,
      bottomId: selectedBottom.id,
      createdAt: new Date().toISOString(),
    }

    addOutfit(outfit)
    track('outfit_created', { hasCustomName: !!name.trim() })
    navigate('outfit-detail', { outfitId: outfit.id })
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
      <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-6">
        <button onClick={() => navigate('home')} className="text-gray-500 text-sm">
          ‹ Back
        </button>
        <h1 className="font-semibold text-gray-900">Create Outfit</h1>
        <div className="w-10" />
      </div>

      {(!hasTops || !hasBottoms) && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
          <p className="text-amber-800 font-medium text-sm mb-1">
            {!hasTops && !hasBottoms
              ? 'You need at least one top and one bottom.'
              : !hasTops
              ? 'You need at least one top.'
              : 'You need at least one bottom.'}
          </p>
          <p className="text-amber-700 text-sm mb-3">Add items to your wardrobe first.</p>
          <button
            onClick={() => {
              track('add_item_cta_tapped', { source: 'create_outfit_guard' })
              navigate('add-item')
            }}
            className="text-amber-900 font-medium underline text-sm"
          >
            Add an item →
          </button>
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Outfit name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Monday work look"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Top</label>
          <button
            onClick={() => navigate('item-picker', { type: 'top', selectedTop, selectedBottom })}
            disabled={!hasTops}
            className={`w-full border rounded-xl p-4 text-left transition-colors ${
              selectedTop ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'
            } disabled:opacity-40`}
          >
            {selectedTop ? (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex-shrink-0" style={colourStyle(selectedTop.colour)} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedTop.name}</p>
                  <p className="text-xs text-gray-500">{selectedTop.colour}</p>
                </div>
                <span className="ml-auto text-xs text-gray-400">Change</span>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Choose a top →</p>
            )}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Bottom</label>
          <button
            onClick={() => navigate('item-picker', { type: 'bottom', selectedTop, selectedBottom })}
            disabled={!hasBottoms}
            className={`w-full border rounded-xl p-4 text-left transition-colors ${
              selectedBottom ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'
            } disabled:opacity-40`}
          >
            {selectedBottom ? (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex-shrink-0" style={colourStyle(selectedBottom.colour)} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedBottom.name}</p>
                  <p className="text-xs text-gray-500">{selectedBottom.colour}</p>
                </div>
                <span className="ml-auto text-xs text-gray-400">Change</span>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Choose a bottom →</p>
            )}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save Outfit
        </button>
      </div>
    </div>
  )
}
