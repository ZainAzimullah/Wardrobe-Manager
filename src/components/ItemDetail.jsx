import { useWardrobe } from '../context/WardrobeContext'
import { colourStyle } from '../utils/colours'

export default function ItemDetail({ navigate, params }) {
  const { clothingItems } = useWardrobe()
  const item = clothingItems.find((i) => i.id === params.itemId)

  if (!item) {
    return (
      <div className="max-w-md mx-auto px-4 pt-10">
        <p className="text-gray-500 text-sm">Item not found.</p>
        <button onClick={() => navigate('wardrobe')} className="text-sm text-gray-900 mt-4 underline">
          ‹ Back to Wardrobe
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
      <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-6">
        <button onClick={() => navigate('wardrobe')} className="text-gray-500 text-sm">
          ‹ Back
        </button>
        <h1 className="font-semibold text-gray-900 truncate max-w-[200px]">{item.name}</h1>
        <div className="w-10" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full" style={colourStyle(item.colour)} />
        </div>
        <div className="flex flex-col gap-1">
          <Row label="Name" value={item.name} />
          <Row label="Type" value={item.type === 'top' ? 'Top' : 'Bottom'} />
          <Row label="Colour" value={item.colour} />
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">Editing items is coming soon.</p>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  )
}
