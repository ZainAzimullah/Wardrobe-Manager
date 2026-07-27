#!/usr/bin/env node
// Evaluation harness — docs/v2-technical-plan.md §9.3, docs/v2-evaluation-plan.md.
//
// Imports the shipped production modules directly (no HTTP, no browser, no
// React) so the evaluation measures the exact code path the live endpoint
// runs: the same request projection (validateRequest), the same model call
// and structured-output schema, the same semantic validator, and the same
// one-controlled-retry policy (getRecommendation). This script is the only
// consumer of api/_lib that requires a real ANTHROPIC_API_KEY and incurs cost
// — it is never invoked by the Vitest suite.
//
// Usage:
//   node evals/run-evals.mjs --runs 2
//   node evals/run-evals.mjs --runs 2 --round r01

import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { validateRequest } from '../api/_lib/validateRequest.js'
import { getRecommendation } from '../api/_lib/recommend.js'
import { MODEL_ID, EFFORT } from '../api/_lib/model.js'
import { PROMPT_VERSION } from '../api/_lib/prompt.js'
import { SCHEMA_VERSION } from '../api/_lib/schema.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DEFAULT_RUNS = 2
const MIN_RUNS = 1
// A safety cap, not a value from either plan document: 12 scenarios x 10 runs
// is already 120 paid calls, which is far beyond the documented 2-run final
// evaluation. Prevents a typo (e.g. --runs 200) from an expensive accident.
const MAX_RUNS = 10

const HUMAN_SCORE_FIELDS = [
  'occasionSuitability',
  'weatherSuitability',
  'outfitCoherence',
  'constraintAdherence',
  'explanationQuality',
  'wardrobeSpecificity',
]

function parseArgs(argv) {
  const args = { runs: DEFAULT_RUNS, round: null }
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i]
    if (flag === '--runs') {
      const raw = argv[++i]
      const parsed = Number(raw)
      if (!Number.isInteger(parsed) || parsed < MIN_RUNS || parsed > MAX_RUNS) {
        console.error(
          `--runs must be an integer between ${MIN_RUNS} and ${MAX_RUNS} (got "${raw}").`,
        )
        process.exit(1)
      }
      args.runs = parsed
    } else if (flag === '--round') {
      const raw = argv[++i]
      if (!raw || /[^a-zA-Z0-9_-]/.test(raw)) {
        console.error('--round must be a non-empty filesystem-safe string (letters, digits, - or _).')
        process.exit(1)
      }
      args.round = raw
    } else {
      console.error(`Unknown argument: ${flag}`)
      console.error('Usage: node evals/run-evals.mjs --runs 2 [--round r01]')
      process.exit(1)
    }
  }
  return args
}

function defaultRoundId() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function loadJSON(fileName) {
  return JSON.parse(readFileSync(path.join(__dirname, fileName), 'utf8'))
}

// Every applicable check is already enforced by the production validator
// inside getRecommendation() (schema shape, identifier existence, category,
// no invented ids) — this function does not re-implement any of that. It only
// adds the scenario-specific checks the production validator has no way to
// know: whether the result type matches what the scenario expects, and
// whether any scenario-forbidden id was returned. `null` means "not
// applicable" (e.g. no top/bottom id exists to check when the result is a
// no-match, or the call never reached a completed response at all).
function computeChecks(scenario, result, fixture) {
  const isError = result.status === 'error'
  const isOk = result.status === 'ok'
  const isNoMatch = result.status === 'no_match'

  // validateResponse's shape and semantic checks are one atomic gate in
  // production — a structural problem (missing key) and a semantic problem
  // (unknown id) both surface as the same 'invalid_response' outcome. These
  // two columns are therefore always equal; kept separate only because the
  // evaluation plan names them as distinct rubric rows.
  const structuralOutcomeKnown = !isError || result.code === 'invalid_response'
  const schemaValid = structuralOutcomeKnown ? isOk || isNoMatch : null
  const semanticValid = schemaValid

  const topIdValid = isOk ? fixture.some((item) => item.id === result.topId) : null
  const bottomIdValid = isOk ? fixture.some((item) => item.id === result.bottomId) : null
  const topTypeValid = isOk
    ? fixture.find((item) => item.id === result.topId)?.type === 'top'
    : null
  const bottomTypeValid = isOk
    ? fixture.find((item) => item.id === result.bottomId)?.type === 'bottom'
    : null

  // Guaranteed true for any displayed result (ok/no_match) because
  // getRecommendation only returns those statuses after validateResponse has
  // already confirmed every id traces back to the sent wardrobe. Unknown for
  // a failed (invalid_response) attempt: the raw pre-validation payload is
  // intentionally not surfaced outside getRecommendation, so we cannot tell
  // whether an invented id was the specific cause of that failure.
  const noInventedIds = isOk || isNoMatch ? true : null

  const expectedResultMatches = isError
    ? false
    : scenario.expect === 'either'
      ? isOk || isNoMatch
      : scenario.expect === 'recommendation'
        ? isOk
        : isNoMatch

  const forbiddenIds = Array.isArray(scenario.forbiddenIds) ? scenario.forbiddenIds : []
  const forbiddenIdsRespected = isError
    ? null
    : !forbiddenIds.includes(result.topId) && !forbiddenIds.includes(result.bottomId)

  const noMatchCorrect =
    scenario.expect !== 'no_match' ? null : isError ? false : isNoMatch

  const hardConstraintsRespected = isError
    ? null
    : Boolean(expectedResultMatches && forbiddenIdsRespected)

  const automatedPass = !isError && Boolean(expectedResultMatches && forbiddenIdsRespected)

  return {
    schemaValid,
    semanticValid,
    topIdValid,
    bottomIdValid,
    topTypeValid,
    bottomTypeValid,
    noInventedIds,
    expectedResultMatches,
    forbiddenIdsRespected,
    hardConstraintsRespected,
    noMatchCorrect,
    automatedPass,
  }
}

function csvEscape(value) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const CSV_COLUMNS = [
  ['runId', (r) => r.runId],
  ['round', (r) => r.round],
  ['timestamp', (r) => r.timestamp],
  ['scenarioId', (r) => r.scenarioId],
  ['runNumber', (r) => r.run],
  ['occasion', (r) => r.input.occasion],
  ['weather', (r) => r.input.weather],
  ['preferences', (r) => r.input.preferences],
  ['responseType', (r) => r.resultType],
  ['errorCode', (r) => r.errorCode],
  ['returnedTopId', (r) => r.topId],
  ['returnedBottomId', (r) => r.bottomId],
  ['explanation', (r) => r.explanation],
  ['unmetRequirement', (r) => r.unmetRequirement],
  ['schemaValid', (r) => r.checks.schemaValid],
  ['semanticValid', (r) => r.checks.semanticValid],
  ['topIdValid', (r) => r.checks.topIdValid],
  ['bottomIdValid', (r) => r.checks.bottomIdValid],
  ['topTypeValid', (r) => r.checks.topTypeValid],
  ['bottomTypeValid', (r) => r.checks.bottomTypeValid],
  ['noInventedIds', (r) => r.checks.noInventedIds],
  ['expectedResultMatches', (r) => r.checks.expectedResultMatches],
  ['forbiddenIdsRespected', (r) => r.checks.forbiddenIdsRespected],
  ['hardConstraintsRespected', (r) => r.checks.hardConstraintsRespected],
  ['noMatchCorrect', (r) => r.checks.noMatchCorrect],
  ['automatedPass', (r) => r.checks.automatedPass],
  ['latencyMs', (r) => r.latencyMs],
  ['attempts', (r) => r.attempts],
  ['retryOccurred', (r) => r.retryOccurred],
  ['model', (r) => r.model],
  ['effort', (r) => r.effort],
  ['promptVersion', (r) => r.promptVersion],
  ['schemaVersion', (r) => r.schemaVersion],
  ['occasionSuitability', (r) => r.humanScores.occasionSuitability],
  ['weatherSuitability', (r) => r.humanScores.weatherSuitability],
  ['outfitCoherence', (r) => r.humanScores.outfitCoherence],
  ['constraintAdherence', (r) => r.humanScores.constraintAdherence],
  ['explanationQuality', (r) => r.humanScores.explanationQuality],
  ['wardrobeSpecificity', (r) => r.humanScores.wardrobeSpecificity],
  ['failureCategory', (r) => r.failureCategory],
  ['notes', (r) => r.notes],
]

function toCSV(rows) {
  const header = CSV_COLUMNS.map(([name]) => csvEscape(name)).join(',')
  const lines = rows.map((row) =>
    CSV_COLUMNS.map(([, get]) => csvEscape(get(row))).join(','),
  )
  return [header, ...lines].join('\r\n') + '\r\n'
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      'ANTHROPIC_API_KEY is not set. Export it in your shell (export ANTHROPIC_API_KEY=...) ' +
        'or run with Node’s env-file flag (node --env-file=.env evals/run-evals.mjs --runs 2) before running the evaluation.',
    )
    process.exit(1)
  }

  const { runs, round } = parseArgs(process.argv.slice(2))
  const roundId = round || defaultRoundId()

  const fixture = loadJSON('wardrobe-fixture.json')
  const scenarios = loadJSON('scenarios.json')

  if (!Array.isArray(fixture) || fixture.length === 0) {
    console.error('evals/wardrobe-fixture.json is empty or invalid.')
    process.exit(1)
  }
  if (!Array.isArray(scenarios) || scenarios.length === 0) {
    console.error('evals/scenarios.json is empty or invalid.')
    process.exit(1)
  }

  const resultsDir = path.join(__dirname, 'results')
  const jsonPath = path.join(resultsDir, `${roundId}.json`)
  const csvPath = path.join(resultsDir, `${roundId}.csv`)
  if (existsSync(jsonPath) || existsSync(csvPath)) {
    console.error(
      `Result files for round "${roundId}" already exist under evals/results/ — refusing to overwrite. Pass a different --round.`,
    )
    process.exit(1)
  }

  console.log(
    `Evaluation round ${roundId}: ${scenarios.length} scenarios x ${runs} run(s) = ${
      scenarios.length * runs
    } calls`,
  )
  console.log(`Model ${MODEL_ID} · effort ${EFFORT} · prompt ${PROMPT_VERSION} · schema ${SCHEMA_VERSION}`)

  const rows = []

  for (const scenario of scenarios) {
    for (let run = 1; run <= runs; run++) {
      const body = { occasion: scenario.occasion, wardrobe: fixture }
      if (scenario.weather) body.weather = scenario.weather
      if (scenario.preferences) body.preferences = scenario.preferences

      const validated = validateRequest(body)

      let result
      let latencyMs
      if (!validated.ok) {
        // Should not happen with well-formed scenarios/fixture — recorded as
        // a failed row rather than thrown, so one bad scenario cannot abort
        // the whole round.
        result = { status: 'error', code: 'bad_request', attempts: 0 }
        latencyMs = 0
      } else {
        const start = performance.now()
        result = await getRecommendation(validated.request)
        latencyMs = Math.round(performance.now() - start)
      }

      const checks = computeChecks(scenario, result, fixture)
      const humanScores = Object.fromEntries(HUMAN_SCORE_FIELDS.map((f) => [f, null]))

      const row = {
        runId: `${roundId}-${scenario.id}-${run}`,
        round: roundId,
        timestamp: new Date().toISOString(),
        scenarioId: scenario.id,
        run,
        input: {
          occasion: scenario.occasion,
          weather: scenario.weather ?? null,
          preferences: scenario.preferences ?? null,
        },
        resultType: result.status,
        errorCode: result.status === 'error' ? result.code : null,
        topId: result.topId ?? null,
        bottomId: result.bottomId ?? null,
        explanation: result.explanation ?? null,
        unmetRequirement: result.unmetRequirement ?? null,
        checks,
        latencyMs,
        attempts: typeof result.attempts === 'number' ? result.attempts : null,
        retryOccurred: typeof result.attempts === 'number' ? result.attempts > 1 : null,
        model: MODEL_ID,
        effort: EFFORT,
        promptVersion: PROMPT_VERSION,
        schemaVersion: SCHEMA_VERSION,
        humanScores,
        failureCategory: null,
        notes: '',
      }

      rows.push(row)

      const label = result.status === 'error' ? `error (${result.code})` : result.status
      console.log(
        `  ${scenario.id} run ${run}: ${label} — ${latencyMs}ms${
          row.retryOccurred ? ' [retried]' : ''
        }`,
      )
    }
  }

  mkdirSync(resultsDir, { recursive: true })
  writeFileSync(jsonPath, JSON.stringify(rows, null, 2))
  writeFileSync(csvPath, toCSV(rows))

  const passCount = rows.filter((r) => r.checks.automatedPass).length
  console.log(
    `\nWrote ${rows.length} rows to ${path.relative(process.cwd(), jsonPath)} and ${path.relative(
      process.cwd(),
      csvPath,
    )}`,
  )
  console.log(`Automated pass: ${passCount}/${rows.length}`)
  console.log('Human scores and failure categories are blank — complete them in the CSV.')
}

main().catch((err) => {
  console.error('Evaluation run failed unexpectedly:')
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
