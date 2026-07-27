# Wardrobe Manager V2 — Evaluation Results

**Status:** No evaluation round has been run yet.

This document defines the evaluation method, the fixed thresholds, and the table results are recorded into. Nothing below is a result until `node evals/run-evals.mjs --runs 2` has actually been executed against the live model — do not read any row, score, or threshold comparison here as evidence until that has happened and the table is filled in.

See [V2 Evaluation Plan](./v2-evaluation-plan.md) for full methodology and [V2 Technical Plan](./v2-technical-plan.md) §9–10 for the implementation.

---

## 1. Purpose

This evaluation answers one question:

> Can Wardrobe Manager generate an outfit recommendation that is grounded in the user's wardrobe, appropriate for their context, and useful enough to reduce outfit decision effort?

It separates four layers, and this document covers layers 2 and 3 (the AI-quality evaluation runs by `run-evals.mjs`), not layer 1 (functional/manual checks) or layer 4 (the small final user evaluation):

1. The application successfully calling the model — not sufficient evidence on its own
2. The model returning technically valid, schema-conformant output
3. The recommendation being contextually appropriate for the scenario
4. The experience providing genuine user value (evaluated separately, see plan §17)

---

## 2. Fixed thresholds (evaluation plan §9)

### Technical validity

- 100% of displayed recommendations use valid wardrobe item identifiers
- 100% of displayed recommendations contain exactly one valid top and one valid bottom
- 100% of invalid mocked responses are blocked or handled safely (covered by `api/_lib/validateResponse.test.js`, not this runner)
- 0 displayed recommendations contain invented garments
- 100% of required no-match scenarios (s10, s11) return an appropriate no-match state

### Constraint adherence

- At least 80% of generated recommendations satisfy all explicit hard constraints
- No prompt-injection scenario (s12) may cause the system to recommend unavailable items

### Recommendation quality (human-scored, across successful recommendation rows)

- Average occasion suitability ≥ 4.0/5
- Average outfit coherence ≥ 4.0/5
- Average explanation quality ≥ 4.0/5
- Average wardrobe specificity ≥ 4.0/5
- Average weather suitability ≥ 4.0/5, where weather was supplied

---

## 3. Exact run command

```bash
node evals/run-evals.mjs --runs 2
```

- `--runs` defaults to `2` if omitted, matching the final evaluation's documented two-runs-per-scenario design (evaluation plan §10). Values must be an integer between 1 and 10.
- An optional `--round <id>` names the output files; otherwise a timestamp-based round id is generated automatically.
- Requires `ANTHROPIC_API_KEY` in the process environment. This script does not read `.env` automatically (no dependency was added for it) — either export the variable in your shell, or run `node --env-file=.env evals/run-evals.mjs --runs 2` (Node ≥20.6).
- Makes real, billed calls to the Anthropic API. It is never invoked by `npm test`.
- Refuses to overwrite an existing result file for the same round — pass a different `--round` instead.

---

## 4. Configuration recorded on every row

These are read directly from the shipped `api/_lib` modules by the runner — not retyped by hand, so they cannot drift from what actually ran:

| Field | Source |
|---|---|
| Model | `MODEL_ID` in `api/_lib/model.js` |
| Effort | `EFFORT` in `api/_lib/model.js` |
| Prompt version | `PROMPT_VERSION` in `api/_lib/prompt.js` |
| Schema version | `SCHEMA_VERSION` in `api/_lib/schema.js` |

Current values at time of writing (before any run): Model `claude-sonnet-5`, Effort `low`, Prompt version `v1`, Schema version `v1`. Increment `PROMPT_VERSION` per the rule in the technical plan §8 whenever the system prompt, selection rules, wardrobe projection, response schema, or no-match instructions change, and record the change below in §8.

---

## 5. Automated checks (computed by `evals/run-evals.mjs`, not hand-entered)

| Column | Meaning |
|---|---|
| `schemaValid` / `semanticValid` | The production `validateResponse()` accepted the payload. Production validation is atomic (one gate covers shape and semantics together), so these two columns always agree — kept separate only because the evaluation plan names them as distinct rubric rows. |
| `topIdValid` / `bottomIdValid` | Returned id exists in the fixture (guaranteed true whenever `schemaValid` is true; `null` when not applicable — e.g. a no-match row has no ids to check). |
| `topTypeValid` / `bottomTypeValid` | Returned id belongs to the correct category. |
| `noInventedIds` | No identifier outside the supplied wardrobe was used. `null` for a failed (`invalid_response`) row — the raw pre-validation payload is intentionally not surfaced outside `getRecommendation()`, so this specific row can't be attributed to an invented id versus another structural problem. |
| `expectedResultMatches` | The result type (`ok` / `no_match`) matches the scenario's `expect` field (`recommendation`, `no_match`, or `either`). |
| `forbiddenIdsRespected` | Neither returned id appears in the scenario's `forbiddenIds`. |
| `hardConstraintsRespected` | `expectedResultMatches && forbiddenIdsRespected` — the two hard constraints this runner can check mechanically. Some scenarios (s02, s08) phrase a hard constraint as a *combination* exclusion the `forbiddenIds` mechanism can't express without over-forbidding a single garment outright; those are checked by hand and noted in the scenario file. |
| `noMatchCorrect` | For s10/s11 only: did the system actually return `no_match`? `null` for every other scenario. |
| `automatedPass` | Overall pass/fail: false for any provider/config/timeout/invalid-response failure; otherwise `expectedResultMatches && forbiddenIdsRespected`. |

`latencyMs`, `attempts` (1 or 2) and `retryOccurred` are also recorded per row — timed by the runner around the same `getRecommendation()` call the live endpoint makes.

---

## 6. Completing human scores

For every row where `resultType` is `ok` (a displayed recommendation), open the result CSV and fill in, using the five-point rubric in evaluation plan §8.2:

- `occasionSuitability` (1–5)
- `weatherSuitability` (1–5, or leave blank/mark N/A if the scenario supplied no weather)
- `outfitCoherence` (1–5)
- `constraintAdherence` (1–5) — also re-check the two combination-level constraints noted in `evals/scenarios.json` for s02/s08 here, since they aren't in `forbiddenIdsRespected`
- `explanationQuality` (1–5)
- `wardrobeSpecificity` (1–5)

Also fill in `failureCategory` for any row where `automatedPass` is false or the human reviewer disagrees with a displayed recommendation, using the taxonomy in evaluation plan §12 (Hallucination, Invalid identifier, Category error, Constraint failure, Occasion mismatch, Weather mismatch, False success, False no-match, Generic explanation, Inconsistent explanation, Prompt-boundary failure, Service failure, Parsing failure). Use `notes` for anything else worth recording.

Do not score `no_match` or `error` rows on the six quality dimensions — leave them blank.

---

## 7. Aggregation formulas

Let *R* be the set of rows where `resultType === 'ok'` (displayed recommendations), *N* the total row count, and *S* the set of scenario ids expected to be `no_match`.

- **Valid-identifier rate** = count(rows in *R* where `topIdValid && bottomIdValid`) ÷ count(*R*) — target 100%
- **Category-valid rate** = count(rows in *R* where `topTypeValid && bottomTypeValid`) ÷ count(*R*) — target 100%
- **Invented-garment count** = count(rows in *R* where `noInventedIds === false`) — target 0
- **No-match correctness** = count(rows where `scenarioId ∈ S` and `noMatchCorrect === true`) ÷ count(rows where `scenarioId ∈ S`) — target 100%
- **Hard-constraint adherence rate** = count(rows where `hardConstraintsRespected === true`) ÷ count(rows where `hardConstraintsRespected !== null`) — target ≥ 80%
- **Prompt-injection safety** = every row with `scenarioId === "s12"` has `noInventedIds !== false` and `expectedResultMatches === true` — target: no exceptions
- **Average occasion suitability** = mean of `occasionSuitability` over *R* — target ≥ 4.0
- **Average weather suitability** = mean of `weatherSuitability` over rows in *R* where weather was supplied — target ≥ 4.0
- **Average outfit coherence** = mean of `outfitCoherence` over *R* — target ≥ 4.0
- **Average explanation quality** = mean of `explanationQuality` over *R* — target ≥ 4.0
- **Average wardrobe specificity** = mean of `wardrobeSpecificity` over *R* — target ≥ 4.0

A threshold is "met" only once every applicable row has its human scores filled in — partial scoring should be reported as partial, not extrapolated.

---

## 8. Results

*No round has been run. This table is the template to complete after `node evals/run-evals.mjs --runs 2` produces `evals/results/<round>.json` / `.csv`.*

| Scenario | Run | Result type | Automated pass | Occasion | Weather | Coherence | Constraints | Explanation | Specificity | Failure category | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| s01 | 1 | | | | | | | | | | |
| s01 | 2 | | | | | | | | | | |
| s02 | 1 | | | | | | | | | | |
| s02 | 2 | | | | | | | | | | |
| s03 | 1 | | | | | | | | | | |
| s03 | 2 | | | | | | | | | | |
| s04 | 1 | | | | | | | | | | |
| s04 | 2 | | | | | | | | | | |
| s05 | 1 | | | | | | | | | | |
| s05 | 2 | | | | | | | | | | |
| s06 | 1 | | | | | | | | | | |
| s06 | 2 | | | | | | | | | | |
| s07 | 1 | | | | | | | | | | |
| s07 | 2 | | | | | | | | | | |
| s08 | 1 | | | | | | | | | | |
| s08 | 2 | | | | | | | | | | |
| s09 | 1 | | | | | | | | | | |
| s09 | 2 | | | | | | | | | | |
| s10 | 1 | | | | | | | | | | |
| s10 | 2 | | | | | | | | | | |
| s11 | 1 | | | | | | | | | | |
| s11 | 2 | | | | | | | | | | |
| s12 | 1 | | | | | | | | | | |
| s12 | 2 | | | | | | | | | | |

### Aggregate metrics

*To be completed using the formulas in §7 once every row above is filled in.*

| Metric | Value | Threshold | Met? |
|---|---|---|---|
| Valid-identifier rate | | 100% | |
| Category-valid rate | | 100% | |
| Invented-garment count | | 0 | |
| No-match correctness | | 100% | |
| Hard-constraint adherence rate | | ≥ 80% | |
| Prompt-injection safety (s12) | | No exceptions | |
| Average occasion suitability | | ≥ 4.0 | |
| Average weather suitability | | ≥ 4.0 | |
| Average outfit coherence | | ≥ 4.0 | |
| Average explanation quality | | ≥ 4.0 | |
| Average wardrobe specificity | | ≥ 4.0 | |

### Recurring failure patterns

*To be completed after reviewing `failureCategory` across all rows — group repeated categories here rather than listing every individual failure.*

---

## 9. Prompt and Product Change Log

Mirrors evaluation plan §14. Record only changes that materially affect model context, selection rules, structured output, validation, no-match behaviour, user input, or recommendation display — not wording-only edits.

| Version | Observed problem | Change made | Expected effect | Actual result |
|---|---|---|---|---|
| v1 | — | Initial implementation (slice 4 live model integration) | — | To be completed after the first evaluation round |
