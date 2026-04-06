import { useEffect } from 'react'
import { useWardrobe } from '../context/WardrobeContext'
import { track } from '../utils/analytics'
import { colourStyle } from '../utils/colours'

export default function WardrobeList({ navigate }) {
  const { tops, bottoms, clothingItems } = useWardrobe()
  const isEmpty = clothingItems.length === 0

  useEffect(() => {
    if (isEmpty) track('empty_state_seen', { screen: 'wardrobe' })
  }, [isEmpty])

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
      <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-4">
        <button onClick={() => navigate('home')} className="text-gray-500 text-sm w-10">
          ‹ Back
        </button>
        <h1 className="font-semibold text-gray-900">My Wardrobe</h1>
        <button
          onClick={() => {
            track('add_item_cta_tapped', { source: 'wardrobe_header' })
            navigate('add-item')
          }}
          className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg"
        >
          + Add
        </button>
      </div>

      {isEmpty ? (
        <div className="text-center py-16">
          <p className="text-gray-700 font-medium mb-1">Your wardrobe is empty</p>
          <p className="text-gray-500 text-sm mb-6">Add your first item to get started.</p>
          <button
            onClick={() => {
              track('add_item_cta_tapped', { source: 'wardrobe_empty_state' })
              navigate('add-item')
            }}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-medium"
          >
            Add your first item
          </button>
        </div>
      ) : (
        <>
          <Section title="Tops" items={tops} navigate={navigate} />
          <Section title="Bottoms" items={bottoms} navigate={navigate} />
        </>
      )}
    </div>
  )
}

function Section({ title, items, navigate }) {
  return (
    <div className="mb-6">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">No {title.toLowerCase()} added yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate('item-detail', { itemId: item.id })}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-left flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full flex-shrink-0" style={colourStyle(item.colour)} />
              <div>
                <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                <p className="text-xs text-gray-500">{item.colour}</p>
              </div>
              <span className="ml-auto text-gray-300 text-sm">›</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
