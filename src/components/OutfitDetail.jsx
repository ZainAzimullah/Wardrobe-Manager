import { useState } from 'react'
import { useWardrobe } from '../context/WardrobeContext'
import { track } from '../utils/analytics'
import { colourStyle } from '../utils/colours'
import { formatWornDate } from '../utils/dates'

const STORAGE_ERRORS = {
  quota: 'Your device storage is full, so this could not be saved.',
  unavailable: 'Your browser is blocking storage, so this could not be saved.',
  unknown: 'Something went wrong and this could not be saved.',
}

export default function OutfitDetail({ navigate, params }) {
  const { getOutfitWithItems, markOutfitWorn } = useWardrobe()
  // Only the transient failure is component state. The worn fact itself always
  // comes from the persisted record, so the UI cannot claim an unsaved success.
  const [saveError, setSaveError] = useState(null)

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

  const wornAt = outfit.lastWornAt ?? null

  function handleWear() {
    track('outfit_worn', { outfitId: outfit.id })

    const result = markOutfitWorn(outfit.id)

    if (result.ok) {
      setSaveError(null)
      track('outfit_worn_confirmed', { outfitId: outfit.id })
    } else {
      setSaveError(result.error)
    }
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

      {wornAt && (
        <div className="w-full bg-green-50 border border-green-100 rounded-xl py-4 px-4 text-center mb-3">
          <p className="text-green-800 font-medium">✓ Marked as worn</p>
          <p className="text-green-700 text-sm mt-0.5">
            Last worn: {formatWornDate(wornAt)}
          </p>
        </div>
      )}

      {saveError && (
        <div
          role="alert"
          className="w-full bg-red-50 border border-red-100 rounded-xl py-4 px-4 mb-3"
        >
          <p className="text-red-800 font-medium text-sm">
            Couldn’t save “Wear this”
          </p>
          <p className="text-red-700 text-sm mt-0.5 mb-3">
            {STORAGE_ERRORS[saveError] ?? STORAGE_ERRORS.unknown}
          </p>
          <button
            onClick={handleWear}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Try again
          </button>
        </div>
      )}

      <button
        onClick={handleWear}
        className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium text-sm"
      >
        {wornAt ? 'Wear this again' : 'Wear this'}
      </button>
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
