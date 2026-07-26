import { useRef, useState } from 'react'
import { useWardrobe } from '../context/WardrobeContext'
import { track } from '../utils/analytics'
import { generateId } from '../utils/ids'
import { COLOURS } from '../utils/colours'
import { processImageFile } from '../utils/image'

const PHOTO_ERRORS = {
  too_large: 'That photo is larger than 10MB. Choose a smaller photo.',
  unsupported: "That file couldn't be opened as a photo.",
  unknown: 'Something went wrong processing that photo.',
}

const SAVE_ERRORS = {
  quota: 'Your device storage is full, so this item could not be saved.',
  unavailable: 'Your browser is blocking storage, so this item could not be saved.',
  unknown: 'Something went wrong and this item could not be saved.',
}

const DETAILS_MAX_LENGTH = 200

export default function AddItem({ navigate }) {
  const { addClothingItem } = useWardrobe()
  const [name, setName] = useState('')
  const [type, setType] = useState('top')
  const [colour, setColour] = useState('White')
  const [details, setDetails] = useState('')
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState(null)

  // 'idle' | 'processing' | 'ready' | 'error'
  const [photoStatus, setPhotoStatus] = useState('idle')
  const [photoDataUrl, setPhotoDataUrl] = useState(null)
  const [photoError, setPhotoError] = useState(null)
  const [pendingFile, setPendingFile] = useState(null)
  const fileInputRef = useRef(null)

  async function processFile(file) {
    setPendingFile(file)
    setPhotoStatus('processing')
    setPhotoError(null)

    const result = await processImageFile(file)

    if (result.ok) {
      setPhotoDataUrl(result.dataUrl)
      setPhotoStatus('ready')
    } else {
      setPhotoDataUrl(null)
      setPhotoError(result.error)
      setPhotoStatus('error')
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    // Reset so selecting the same file again (e.g. after Remove) still fires onChange.
    e.target.value = ''
    if (!file) return
    processFile(file)
  }

  function handleRetryPhoto() {
    if (pendingFile) processFile(pendingFile)
  }

  function handleRemovePhoto() {
    setPhotoStatus('idle')
    setPhotoDataUrl(null)
    setPhotoError(null)
    setPendingFile(null)
  }

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

    if (details.trim()) item.details = details.trim()
    if (photoStatus === 'ready' && photoDataUrl) item.photo = photoDataUrl

    const result = addClothingItem(item)

    if (result.ok) {
      setSaveError(null)
      track('item_added', { type, colour })
      navigate('wardrobe')
    } else {
      setSaveError(result.error)
    }
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Details <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value.slice(0, DETAILS_MAX_LENGTH))}
            placeholder="e.g. Merino wool, warm, smart-casual"
            rows={2}
            maxLength={DETAILS_MAX_LENGTH}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Photo <span className="text-gray-400 font-normal">(optional)</span>
          </label>

          {photoStatus === 'idle' && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border border-dashed border-gray-300 rounded-xl py-6 text-sm text-gray-500 text-center"
            >
              + Add a photo
            </button>
          )}

          {photoStatus === 'processing' && (
            <div role="status" className="w-full border border-gray-200 rounded-xl py-6 text-center">
              <p className="text-sm text-gray-500">Processing photo…</p>
            </div>
          )}

          {photoStatus === 'ready' && photoDataUrl && (
            <div className="flex items-center gap-3">
              <img
                src={photoDataUrl}
                alt="Preview of selected clothing photo"
                className="w-20 h-20 rounded-xl object-cover border border-gray-200 flex-shrink-0"
              />
              <div className="flex flex-col items-start gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-gray-900 underline"
                >
                  Change photo
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-sm text-red-600 underline"
                >
                  Remove photo
                </button>
              </div>
            </div>
          )}

          {photoStatus === 'error' && (
            <div role="alert" className="w-full bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-red-800 text-sm font-medium mb-2">
                {PHOTO_ERRORS[photoError] ?? PHOTO_ERRORS.unknown}
              </p>
              <div className="flex gap-4">
                {pendingFile && (
                  <button
                    type="button"
                    onClick={handleRetryPhoto}
                    className="text-sm font-medium text-red-700 underline"
                  >
                    Try again
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-medium text-gray-700 underline"
                >
                  Choose a different photo
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {saveError && (
        <div role="alert" className="mt-6 bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-red-800 text-sm font-medium mb-3">
            {SAVE_ERRORS[saveError] ?? SAVE_ERRORS.unknown}
          </p>
          <button
            onClick={handleSave}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Try again
          </button>
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={handleSave}
          disabled={!name.trim() || photoStatus === 'processing'}
          className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save Item
        </button>
      </div>
    </div>
  )
}
