import { useState } from 'react'
import { useWardrobe } from '../context/WardrobeContext'
import { track } from '../utils/analytics'
import { generateId } from '../utils/ids'
import { COLOURS } from '../utils/colours'

export default function AddItem({ navigate }) {
  const { addItem } = useWardrobe()
  const [name, setName] = useState('')
  const [type, setType] = useState('top')
  const [colour, setColour] = useState('White')
  const [error, setError] = useState('')

  function handleSave() {
    if (!name.trim()) {
      setError('Please enter a name')
      return
    }

    const item = {
      id: generateId('ci'),
      name: name.trim(),
      type,
      colour,
      createdAt: new Date().toISOString(),
    }

    addItem(item)
    track('item_added', { type, colour })
    navigate('wardrobe')
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
      <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-6">
        <button onClick={() => navigate('wardrobe')} className="text-gray-500 text-sm">
          ‹ Back
        </button>
        <h1 className="font-semibold text-gray-900">Add Item</h1>
        <div className="w-10" />
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            placeholder="e.g. White linen shirt"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
          <div className="flex gap-2">
            {['top', 'bottom'].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-colors ${
                  type === t
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                {t === 'top' ? 'Top' : 'Bottom'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Colour</label>
          <div className="flex flex-wrap gap-2">
            {COLOURS.map((c) => (
              <button
                key={c}
                onClick={() => setColour(c)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  colour === c
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save Item
        </button>
      </div>
    </div>
  )
}
