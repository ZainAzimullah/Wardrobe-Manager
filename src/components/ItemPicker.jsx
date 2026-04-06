import { useEffect } from 'react'
import { useWardrobe } from '../context/WardrobeContext'
import { track } from '../utils/analytics'
import { colourStyle } from '../utils/colours'

export default function ItemPicker({ navigate, params }) {
  const { tops, bottoms } = useWardrobe()
  const { type, selectedTop, selectedBottom } = params
  const isTops = type === 'top'
  const items = isTops ? tops : bottoms
  const currentSelected = isTops ? selectedTop : selectedBottom

  useEffect(() => {
    if (items.length === 0) {
      track('empty_state_seen', { screen: 'item_picker', type })
    }
  }, [items.length, type])

  function handleSelect(item) {
    if (isTops) {
      navigate('create-outfit', { selectedTop: item, selectedBottom })
    } else {
      navigate('create-outfit', { selectedTop, selectedBottom: item })
    }
  }

  function handleDismiss() {
    navigate('create-outfit', { selectedTop, selectedBottom })
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
      <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-4">
        <button onClick={handleDismiss} className="text-gray-500 text-sm w-10">
          ✕
        </button>
        <h1 className="font-semibold text-gray-900">
          Choose a {isTops ? 'Top' : 'Bottom'}
        </h1>
        <div className="w-10" />
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-700 font-medium mb-1">
            No {isTops ? 'tops' : 'bottoms'} added yet.
          </p>
          <p className="text-gray-500 text-sm mb-6">Add one to your wardrobe first.</p>
          <button
            onClick={() => {
              track('add_item_cta_tapped', { source: 'item_picker_empty' })
              navigate('add-item')
            }}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-medium"
          >
            Add an item
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const isSelected = currentSelected?.id === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${
                  isSelected ? 'border-gray-900 bg-gray-50' : 'border-gray-100 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-full flex-shrink-0" style={colourStyle(item.colour)} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.colour}</p>
                </div>
                {isSelected && <span className="ml-auto text-gray-900 text-sm">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
