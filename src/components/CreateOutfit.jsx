import { useRef, useState } from 'react'
import { useWardrobe } from '../context/WardrobeContext'
import { track } from '../utils/analytics'
import { generateId } from '../utils/ids'
import { colourStyle } from '../utils/colours'

const STORAGE_ERRORS = {
  quota: 'Your device storage is full, so this could not be saved.',
  unavailable: 'Your browser is blocking storage, so this could not be saved.',
  unknown: 'Something went wrong and this could not be saved.',
}

export default function CreateOutfit({ navigate, params }) {
  const { tops, bottoms, outfits, addOutfit } = useWardrobe()
  const [name, setName] = useState('')
  const [selectedTop, setSelectedTop] = useState(params.selectedTop || null)
  const [selectedBottom, setSelectedBottom] = useState(params.selectedBottom || null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  // Synchronous re-entrancy guard: setIsSaving only disables the button after
  // a re-render, which isn't fast enough to stop a rapid double click.
  const savingRef = useRef(false)

  const hasTops = tops.length > 0
  const hasBottoms = bottoms.length > 0
  const canSave = selectedTop && selectedBottom && !isSaving

  function handleSave() {
    if (!canSave || savingRef.current) return
    savingRef.current = true
    setIsSaving(true)
    setSaveError(null)

    const outfitName = name.trim() || `Outfit ${outfits.length + 1}`
    const outfit = {
      id: generateId('out'),
      name: outfitName,
      topId: selectedTop.id,
      bottomId: selectedBottom.id,
      createdAt: new Date().toISOString(),
    }

    const result = addOutfit(outfit)

    if (!result.ok) {
      savingRef.current = false
      setIsSaving(false)
      setSaveError(result.error)
      return
    }

    // outfit_created reflects a real save, not just a tap — mirrors the
    // outfit_worn_confirmed pattern in OutfitDetail.jsx.
    track('outfit_created', { hasCustomName: !!name.trim() })
    if (params.fromRecommendation) {
      track('recommendation_saved')
    }
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
            onClick={() =>
              navigate('item-picker', {
                type: 'top',
                selectedTop,
                selectedBottom,
                fromRecommendation: params.fromRecommendation,
              })
            }
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
            onClick={() =>
              navigate('item-picker', {
                type: 'bottom',
                selectedTop,
                selectedBottom,
                fromRecommendation: params.fromRecommendation,
              })
            }
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

      {saveError && (
        <div role="alert" className="bg-red-50 border border-red-100 rounded-xl p-4 mt-6">
          <p className="text-red-800 font-medium text-sm mb-1">Couldn’t save this outfit</p>
          <p className="text-red-700 text-sm">
            {STORAGE_ERRORS[saveError] ?? STORAGE_ERRORS.unknown}
          </p>
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving…' : 'Save Outfit'}
        </button>
      </div>
    </div>
  )
}
