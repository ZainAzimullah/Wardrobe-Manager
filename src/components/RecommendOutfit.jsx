import { useState } from 'react'
import { useWardrobe } from '../context/WardrobeContext'
import ItemThumb from './ItemThumb'
import { requestRecommendation, MOCK_STATES } from '../utils/recommendMock'
import { isDeveloper } from '../utils/devFixture'

const OCCASION_CHIPS = [
  'Office day',
  'Presentation',
  'Client dinner',
  'Smart-casual event',
  'Casual outing',
  'Coffee or catch-up',
]

// Mirrors PRD RI-5. The interface enforces these for feedback; the server
// enforces the same limits for safety.
const LIMITS = {
  occasion: 120,
  weather: 80,
  preferences: 300,
}

const ERROR_COPY = {
  invalid_response: {
    title: 'That suggestion didn’t look right',
    body: 'The response could not be checked against your wardrobe, so it was not shown. Try again.',
  },
  timeout: {
    title: 'That took too long',
    body: 'The suggestion did not arrive in time. Try again.',
  },
  provider_error: {
    title: 'Couldn’t get a suggestion',
    body: 'The service is unavailable right now. Try again in a moment.',
  },
  config_error: {
    title: 'Suggestions aren’t available',
    body: 'The app is not set up to make suggestions yet.',
  },
}

// The five whitelisted fields sent to the server. Built inline rather than
// imported from api/_lib/prompt.js on purpose: that module carries the system
// prompt, which must never reach the client bundle. The server re-projects
// authoritatively, so this is defence in depth rather than duplication.
function projectForRequest(items) {
  return items.map((item) => {
    const projected = {
      id: item.id,
      name: item.name,
      type: item.type,
      colour: item.colour,
    }
    if (item.details) projected.details = item.details
    return projected
  })
}

export default function RecommendOutfit({ navigate }) {
  const { clothingItems, tops, bottoms } = useWardrobe()

  const [occasion, setOccasion] = useState('')
  const [weather, setWeather] = useState('')
  const [preferences, setPreferences] = useState('')

  // 'idle' | 'loading' | 'success' | 'no_match' | 'error'
  const [phase, setPhase] = useState('idle')
  const [result, setResult] = useState(null)
  const [errorCode, setErrorCode] = useState(null)

  const [mockState, setMockState] = useState('success')
  const showDevTools = isDeveloper()

  const hasTops = tops.length > 0
  const hasBottoms = bottoms.length > 0
  const wardrobeReady = hasTops && hasBottoms
  const canSubmit = occasion.trim().length > 0 && phase !== 'loading'

  async function handleSubmit() {
    if (!canSubmit) return

    setPhase('loading')
    setResult(null)
    setErrorCode(null)

    const request = {
      occasion: occasion.trim(),
      wardrobe: projectForRequest(clothingItems),
    }
    if (weather.trim()) request.weather = weather.trim()
    if (preferences.trim()) request.preferences = preferences.trim()

    const response = await requestRecommendation(request, { mockState })

    if (response.status === 'no_match') {
      setResult(response)
      setPhase('no_match')
      return
    }

    if (response.status === 'error') {
      setErrorCode(response.code)
      setPhase('error')
      return
    }

    // Client-side re-resolution (RD-3). Identifiers are checked against the
    // live wardrobe; anything unresolvable is an error state, never a partial
    // render. Every displayed detail then comes from the local record.
    const top = clothingItems.find((i) => i.id === response.topId)
    const bottom = clothingItems.find((i) => i.id === response.bottomId)

    if (!top || top.type !== 'top' || !bottom || bottom.type !== 'bottom') {
      setErrorCode('invalid_response')
      setPhase('error')
      return
    }

    setResult({ top, bottom, explanation: response.explanation })
    setPhase('success')
  }

  function handleStartOver() {
    setPhase('idle')
    setResult(null)
    setErrorCode(null)
  }

  return (
    <div className="max-w-md mx-auto px-4 pb-8">
      <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-6">
        <button onClick={() => navigate('home')} className="text-gray-500 text-sm">
          ‹ Back
        </button>
        <h1 className="font-semibold text-gray-900">Suggest an Outfit</h1>
        <div className="w-10" />
      </div>

      {showDevTools && (
        <div className="mb-6 bg-gray-100 border border-gray-200 rounded-xl p-3">
          <label
            htmlFor="mock-state"
            className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
          >
            Developer — mock response
          </label>
          <select
            id="mock-state"
            value={mockState}
            onChange={(e) => setMockState(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {MOCK_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {!wardrobeReady ? (
        <InsufficientWardrobe hasTops={hasTops} hasBottoms={hasBottoms} navigate={navigate} />
      ) : phase === 'idle' || phase === 'loading' ? (
        <>
          <div className="flex flex-col gap-5">
            <div>
              <label
                htmlFor="occasion"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                What’s the occasion?
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {OCCASION_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setOccasion(chip)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      occasion === chip
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 bg-white text-gray-700'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <input
                id="occasion"
                type="text"
                value={occasion}
                maxLength={LIMITS.occasion}
                onChange={(e) => setOccasion(e.target.value.slice(0, LIMITS.occasion))}
                placeholder="Or describe it yourself"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="weather" className="block text-sm font-medium text-gray-700 mb-1.5">
                Weather <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="weather"
                type="text"
                value={weather}
                maxLength={LIMITS.weather}
                onChange={(e) => setWeather(e.target.value.slice(0, LIMITS.weather))}
                placeholder="e.g. Cold and raining"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="preferences"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Anything else? <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="preferences"
                value={preferences}
                rows={2}
                maxLength={LIMITS.preferences}
                onChange={(e) => setPreferences(e.target.value.slice(0, LIMITS.preferences))}
                placeholder="e.g. I’ll be walking a lot, avoid linen"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {phase === 'loading' && (
            <div role="status" className="mt-6 text-center">
              <p className="text-sm text-gray-500">Putting an outfit together…</p>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {phase === 'loading' ? 'Thinking…' : 'Suggest an outfit'}
            </button>
          </div>
        </>
      ) : phase === 'success' ? (
        <SuccessResult result={result} onStartOver={handleStartOver} />
      ) : phase === 'no_match' ? (
        <NoMatchResult result={result} onStartOver={handleStartOver} />
      ) : (
        <ErrorResult errorCode={errorCode} onStartOver={handleStartOver} />
      )}
    </div>
  )
}

function InsufficientWardrobe({ hasTops, hasBottoms, navigate }) {
  const missing = !hasTops && !hasBottoms
    ? 'at least one top and one bottom'
    : !hasTops
      ? 'at least one top'
      : 'at least one bottom'

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
      <p className="text-amber-800 font-medium text-sm mb-1">
        You need {missing} first.
      </p>
      <p className="text-amber-700 text-sm mb-3">
        Suggestions come from clothes you’ve saved, so there needs to be something to choose from.
      </p>
      <button
        onClick={() => navigate('add-item')}
        className="text-amber-900 font-medium underline text-sm"
      >
        Add an item →
      </button>
    </div>
  )
}

function SuccessResult({ result, onStartOver }) {
  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
        <div className="flex flex-col gap-5">
          <ResultItem label="Top" item={result.top} />
          <div className="border-t border-gray-100" />
          <ResultItem label="Bottom" item={result.bottom} />
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Why this works</p>
        <p className="text-sm text-gray-700">{result.explanation}</p>
      </div>

      <button
        onClick={onStartOver}
        className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium text-sm"
      >
        Try another
      </button>
    </>
  )
}

// Every detail here comes from the wardrobe record, never from model text.
function ResultItem({ label, item }) {
  return (
    <div className="flex items-center gap-4">
      <ItemThumb item={item} size="md" />
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="font-medium text-gray-900">{item.name}</p>
        <p className="text-sm text-gray-500">{item.colour}</p>
      </div>
    </div>
  )
}

function NoMatchResult({ result, onStartOver }) {
  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <p className="font-medium text-gray-900 mb-2">No suitable outfit this time</p>
        <p className="text-sm text-gray-600">{result.unmetRequirement}</p>
      </div>

      <button
        onClick={onStartOver}
        className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium text-sm"
      >
        Try a different request
      </button>
    </>
  )
}

function ErrorResult({ errorCode, onStartOver }) {
  const copy = ERROR_COPY[errorCode] ?? ERROR_COPY.provider_error

  return (
    <>
      <div role="alert" className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
        <p className="text-red-800 font-medium text-sm mb-1">{copy.title}</p>
        <p className="text-red-700 text-sm">{copy.body}</p>
      </div>

      <button
        onClick={onStartOver}
        className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium text-sm"
      >
        Try again
      </button>
    </>
  )
}
