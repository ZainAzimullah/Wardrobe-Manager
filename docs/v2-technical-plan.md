# Wardrobe Manager V2 — Technical Plan

**Status:** Approved
**Iteration:** V2
**Scope:** Implementation approach for the three V2 workstreams
**Supersedes:** the open technical questions in [V2 PRD §21](./v2-prd.md)

This document records *how* V2 will be built and *why* each choice was made. It does not restate product requirements — see the [V2 PRD](./v2-prd.md), [V2 Opportunity Brief](./v2-opportunity-brief.md) and [V2 Evaluation Plan](./v2-evaluation-plan.md).

---

## 1. Current Architecture

### 1.1 Stack as built

| Layer | Implementation |
|---|---|
| Build | Vite 7, `"type": "module"` |
| UI | React 18, function components only |
| Styling | Tailwind CSS 3 |
| State | One `WardrobeContext` (`useState` + `useContext`) |
| Persistence | `localStorage`, two keys |
| Analytics | `mixpanel-browser`, no-ops without a token |
| Hosting | Vercel, static SPA |

Three runtime dependencies. No TypeScript, no test runner, no linter, no router library, no `vercel.json`, no `/api` directory.

### 1.2 Navigation

[`App.jsx`](../src/App.jsx) implements a hand-rolled router: `useState({ screen, params })` and a `screens` lookup object. There are no URLs, no history entries and no deep links; a refresh returns to Home and discards `params`.

One property of this router is load-bearing for V2: **`params` carries whole objects**. `ItemPicker` already navigates to `CreateOutfit` passing full item records as `params.selectedTop` / `params.selectedBottom`, and `CreateOutfit` reads them as its initial state. The recommendation screen reuses this exact mechanism to hand a result to the outfit builder.

### 1.3 State and persistence

`WardrobeContext` exposes `clothingItems`, `outfits`, derived `tops` / `bottoms`, and three functions: `addClothingItem`, `addOutfit`, `getOutfitWithItems`.

**The context API is append-only. There is no update or delete mutator anywhere in the application.** `storage.js` reads and writes two `localStorage` keys with bare `JSON.parse` / `JSON.stringify` and no error handling, so a `QuotaExceededError` currently propagates out of `addClothingItem` and breaks the add-item flow.

### 1.4 Where the three workstreams land

**"Wear this"** is component-local state. `OutfitDetail` holds `const [worn, setWorn] = useState(false)`; `handleWear` fires the `outfit_worn` Mixpanel event and flips that flag. Nothing is persisted, so the confirmation banner disappears on navigation. The MVP finding — five of six participants unclear what the action did — is a missing feature, not unclear copy.

**Images** do not exist in any form. There is no image field, no `<img>` tag, and no image URL anywhere in `src/`. Garments are represented by a coloured circle derived from `colourStyle(item.colour)`.

**AI recommendation** has no counterpart in the current code. It is the only workstream requiring new infrastructure.

---

## 2. Approved Decisions and Rationale

| # | Decision | Rationale |
|---|---|---|
| 1 | Add one optional `ClothingItem.details` free-text field | The model needs material, warmth, fit and formality to answer six of the twelve evaluation scenarios. One optional text input is the smallest change that supplies it; structured enums would mean two more pickers and more UI for the same signal. Named `details` so it is never confused with the request-level `preferences`. |
| 2 | Do not expand the colour palette; restate the fixture in supported colours with shade in `details` | The palette is a product decision and should not be reshaped to suit a test fixture. Keeping it fixed also makes the fixture enterable through the real Add Item screen, which the final user evaluation needs. |
| 3 | Photos as client-side downscaled JPEG data URLs in `localStorage` | Keeps the "no backend for user data" property intact. Any blob store or CDN would add infrastructure disproportionate to a contained experiment. |
| 4 | 512px max edge, JPEG quality 0.7; 10 MB maximum source file; capacity is a documented prototype limitation | A raw phone photo base64-encodes to several megabytes against a ~5MB origin budget. Downscaling brings a typical garment photo to roughly 40–80KB stored. The 10 MB source cap is checked before decoding, so an oversized file is rejected without allocating a decode buffer. The exact stored ceiling depends on image content, so the honest statement is a bounded prototype, not a guaranteed item count. |
| 5 | `claude-sonnet-5` at low effort; changes must be evaluation-driven | The task is small, bounded and schema-constrained. Starting at the lower cost point and letting the evaluation decide is the disciplined order; upgrading later is a one-line change with a recorded before/after. |
| 6 | One controlled retry, only on structural or semantic validation failure | A malformed or ungrounded response is often transient and worth one more attempt. Bad requests, auth failures and provider errors are not — retrying them wastes time and money and hides the real fault. |
| 7 | Persist `lastWornAt` only | Satisfies every "Wear this" requirement. A wear count or history implies a features (streaks, frequency, analytics) V2 is not testing. |
| 8 | Occasion chips plus free text. Initial chips: Office day, Presentation, Client dinner, Smart-casual event, Casual outing, Coffee or catch-up | Chips make the common path fast and keep evaluation phrasing consistent; free text preserves situations the chips do not cover. Six chips span the formality range the fixture supports without crowding a mobile screen. Free-text entry always remains available. |
| 9 | `vercel dev` for local development | The Vite dev server does not serve `/api`. `vercel dev` runs both with no custom proxy code to write or maintain. |
| 10 | Vitest for pure schema and validation modules only | Turns the evaluation plan's twelve invalid-response cases into a deterministic suite needing no API key and no network. One devDependency. No component or end-to-end testing. |
| 11 | Developer-only fixture loader | Scenario evaluation and the final user evaluation must run against the same wardrobe the runner uses. |
| 12 | No custom rate limiter; strict input, body and timeout limits instead | A single-instance in-memory limiter on serverless is close to decorative. Bounding each request is real protection; honestly documenting the exposure is better engineering than a limiter that does not work. |
| 13 | Photo states are processing / preview-ready / error / retry | Nothing is uploaded. Implementing literal upload progress would mean faking it. |
| 14 | Correct the image-URL wording | The documents described a feature that never existed. |
| 15 | Clarify repeatability wording | The model exposes no sampling controls, so identical output cannot be promised. Repeatability means a fixed recorded configuration. |

---

## 3. Data Model — Before and After

### ClothingItem

| Field | Before | After | Notes |
|---|---|---|---|
| `id` | `string` | unchanged | `ci_<ts>_<rand>`; opaque, never parsed |
| `name` | `string` | unchanged | |
| `type` | `'top' \| 'bottom'` | unchanged | |
| `colour` | one of 9 palette values | unchanged | **Palette not extended** (decision 2) |
| `createdAt` | ISO string | unchanged | |
| `details` | — | `string \| undefined` | **New.** Free text, ≤200 chars. Material, warmth, fit, formality, shade |
| `photo` | — | `string \| undefined` | **New.** `data:image/jpeg;base64,…`, ≤512px edge, q0.7. Source file ≤10 MB, checked before decode |

### Outfit

| Field | Before | After | Notes |
|---|---|---|---|
| `id` | `string` | unchanged | `out_<ts>_<rand>` |
| `name` | `string` | unchanged | |
| `topId` | `string` | unchanged | |
| `bottomId` | `string` | unchanged | |
| `createdAt` | ISO string | unchanged | |
| `lastWornAt` | — | `string \| undefined` | **New.** ISO string, overwritten on each wear. No count, no history |

### Migration

**None.** All three new fields are optional and read as `undefined` on MVP-era records. Every consumer either renders conditionally or falls back:

- absent `photo` → colour swatch, exactly as today
- absent `details` → key omitted from the model request
- absent `lastWornAt` → no worn badge

There is no schema version and no migration function. This is deliberate: adding versioning would be infrastructure for a change that does not need it.

### Storage keys

`wardrobe_items` and `wardrobe_outfits` are unchanged. Every write is wrapped in `try/catch` — new behaviour, required by WT-5 and PU-5.

---

## 4. Component and Module Map

```
api/
  recommend.js                  NEW  HTTP handler only: method check, parse, delegate, map errors
  _lib/
    model.js                    NEW  SDK client + MODEL_CONFIG (model, effort, max_tokens, timeout)
    prompt.js                   NEW  PROMPT_VERSION, system prompt, user message, wardrobe projection
    schema.js                   NEW  RESPONSE_SCHEMA (JSON Schema object)
    validateRequest.js          NEW  inbound validation + normalisation
    validateResponse.js         NEW  model payload validation against the wardrobe as sent
    recommend.js                NEW  orchestration: project → call → validate → one retry → result
    validateRequest.test.js     NEW  Vitest
    validateResponse.test.js    NEW  Vitest — the twelve invalid-response cases

src/
  components/
    RecommendOutfit.jsx         NEW  form, all seven experience states, result display
    ItemThumb.jsx               NEW  <img> when photo present, colour swatch otherwise
    AddItem.jsx                 EDIT file input, preview, details field, processing/error/retry
    OutfitDetail.jsx            EDIT read lastWornAt from the record, confirmation, date, error
    SavedOutfitsList.jsx        EDIT worn badge, ItemThumb
    WardrobeList.jsx            EDIT ItemThumb
    ItemDetail.jsx              EDIT photo, details row
    ItemPicker.jsx              EDIT ItemThumb
    HomeScreen.jsx              EDIT entry point to recommendations; dev-only fixture control
  context/WardrobeContext.jsx   EDIT + markOutfitWorn
  utils/
    storage.js                  EDIT + updateOutfits; try/catch on every write
    image.js                    NEW  file → validated, downscaled data URL
    recommend.js                NEW  POST /api/recommend; client-side re-validation
    devFixture.js               NEW  load evaluation wardrobe into localStorage
    analytics.js                EDIT V2 events
  App.jsx                       EDIT register the 'recommend' screen

evals/
  wardrobe-fixture.json         NEW
  scenarios.json                NEW
  run-evals.mjs                 NEW
  results/                      NEW

vercel.json                     NEW  function maxDuration only
docs/v2-evaluation-results.md   NEW
```

### The `_lib` boundary

`prompt.js`, `schema.js`, `validateRequest.js` and `validateResponse.js` are **plain ESM with no React, no I/O and no SDK import**. `recommend.js` adds orchestration; `model.js` is the only module that touches the network.

This split exists for one reason: the serverless function, the Vitest suite and the Node evaluation runner all import the **same** modules. The evaluation therefore measures the shipped code path rather than a reimplementation of it, and the test suite runs with no API key and no network.

### Component reuse

- **`CreateOutfit` is reused unchanged** for saving a recommendation. It already accepts `params.selectedTop` / `params.selectedBottom` as full item objects because `ItemPicker` uses that mechanism. Passing a validated recommendation into it needs no new save code.
- **The minimum-wardrobe guard in `CreateOutfit`** is the existing pattern for RI-4 and is mirrored, not extracted — extracting it would be a refactor V2 does not need.
- **`ItemThumb`** is the one new shared component. Five screens display garments; each gains a photo through the same component, which keeps the fallback logic in one place.

---

## 5. Request and Response Contracts

### 5.1 Client → `/api/recommend`

```json
{
  "occasion": "Office day",
  "weather": "Cold",
  "preferences": "Look polished but not overly formal",
  "wardrobe": [
    {
      "id": "top_01",
      "name": "White Oxford shirt",
      "type": "top",
      "colour": "White",
      "details": "Cotton, smart, long-sleeved, suitable for office or dinner"
    }
  ]
}
```

The client sends a whitelisted projection. **`photo` and `createdAt` are never included**, satisfying the PRD's data-minimisation requirement structurally rather than by convention. The server re-projects rather than trusting the client's projection.

### 5.2 Model response schema

Enforced at generation time through the API's JSON-schema output format, then re-validated by the application.

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["result", "topId", "bottomId", "explanation", "unmetRequirement"],
  "properties": {
    "result":           { "type": "string", "enum": ["recommendation", "no_match"] },
    "topId":            { "anyOf": [{ "type": "string" }, { "type": "null" }] },
    "bottomId":         { "anyOf": [{ "type": "string" }, { "type": "null" }] },
    "explanation":      { "type": "string" },
    "unmetRequirement": { "anyOf": [{ "type": "string" }, { "type": "null" }] }
  }
}
```

A flat shape discriminated by `result` was chosen over a nested union: it is easier to constrain, easier to validate and easier to read in evaluation output. Every field is required and explicitly nullable where absent, so a missing key is a validation failure rather than an ambiguity.

Length limits are **not** expressed in the schema — the API's structured-output schema support excludes string-length constraints. Explanation length is a prompt instruction plus an application-side check.

### 5.3 `/api/recommend` → client

The endpoint returns exactly one of three shapes and **never** the raw model payload:

```json
{ "status": "ok",       "topId": "top_01", "bottomId": "bottom_05", "explanation": "…" }
{ "status": "no_match", "unmetRequirement": "…" }
{ "status": "error",    "code": "bad_request | invalid_response | timeout | provider_error | config_error" }
```

| `code` | HTTP | Meaning | Retried server-side |
|---|---|---|---|
| `bad_request` | 400 | Request failed inbound validation | No |
| `invalid_response` | 502 | Model output failed validation twice | Retried once, then surfaced |
| `timeout` | 504 | Request exceeded the configured timeout | No |
| `provider_error` | 502 | Provider error, rate limit or refusal | No |
| `config_error` | 500 | API key missing or misconfigured | No |

Error bodies never echo the API key, the system prompt or the provider's raw error.

### 5.4 Model configuration

| Setting | Value | Reason |
|---|---|---|
| Model | `claude-sonnet-5` | Decision 5 |
| Effort | `low` | Bounded, schema-constrained task; keeps latency inside the 10s target |
| `max_tokens` | 2000 | Adaptive thinking is on by default and `max_tokens` caps thinking **plus** response text; a short JSON answer must not be truncated by reasoning |
| Timeout | 20 000 ms (SDK) | Below the function's `maxDuration` so a timeout surfaces as a recoverable state, not a platform 504 |
| `maxDuration` | 30 s (`vercel.json`) | The single reason `vercel.json` is added |

**There is no temperature setting.** Sampling parameters are rejected by this model family. This is the direct cause of the repeatability clarification in decision 15 — see §8.

---

## 6. Security and Credential Handling

### Credential path

`ANTHROPIC_API_KEY` is set in the Vercel project environment (Production and Preview) and in a local `.env`, which is already gitignored.

**The variable carries no `VITE_` prefix, and this is the load-bearing detail.** Vite only inlines `VITE_`-prefixed variables into the client bundle, so an unprefixed name is structurally incapable of reaching the browser — the protection is a property of the build tool, not a convention someone must remember. `.env.example` will state this reasoning inline.

The client never receives the key, the system prompt, or the raw model response.

### Request hardening

| Control | Value |
|---|---|
| Method | `POST` only |
| Body size | ≤64KB, rejected before parsing |
| `occasion` | required, 1–120 chars |
| `weather` | optional, ≤80 chars |
| `preferences` | optional, ≤300 chars |
| `wardrobe` | 2–60 items, ≥1 top and ≥1 bottom |
| Item fields | `id` ≤64, `name` ≤120, `details` ≤200; `type` ∈ `{top, bottom}` |
| Unknown keys | stripped by re-projection, not passed through |

These limits are confirmed rather than provisional, and are mirrored in [PRD RI-5](./v2-prd.md) so the product requirement and the implementation cannot drift apart. The interface enforces them for feedback; the server enforces them for safety.

### Model output as untrusted input

Model output is treated exactly like user input from an untrusted source:

- Identifiers are validated against the wardrobe **as sent** before anything is displayed (§7).
- Item names, colours and photos are rendered **only** from local wardrobe records, never from model-authored text.
- `explanation` is the only model-authored string reaching the DOM, rendered as plain text. **`dangerouslySetInnerHTML` is not used anywhere in this feature.**
- The system prompt states that wardrobe data and user text are data, not instructions. Evaluation scenario 12 tests this directly, and validation makes an ungrounded response unrenderable regardless of how the model behaves.

### Accepted limitations

The endpoint is publicly reachable and unauthenticated, with no throttling (decision 12). Per-request cost is bounded by the input, body and timeout limits above, but total spend under deliberate abuse is not. This is documented in §12 and in the README rather than partially mitigated.

---

## 7. Validation

Two independent gates. Neither is sufficient alone.

### 7.1 Server-side, before responding

The **request's own wardrobe projection** is the authority — not the client's current `localStorage`, which may have changed.

1. Response parses, matches the schema, and carries no unknown keys.
2. `result` is `"recommendation"` or `"no_match"`.
3. If `no_match`: `topId` and `bottomId` are both `null`, and `unmetRequirement` is a non-empty string.
   **An identifier present alongside `no_match` is a validation failure — it is not silently dropped.**
4. If `recommendation`:
   - `topId` exists as a key in the sent wardrobe
   - `bottomId` exists as a key in the sent wardrobe
   - the item at `topId` has `type === 'top'`
   - the item at `bottomId` has `type === 'bottom'`
   - `topId !== bottomId`
   - `unmetRequirement` is `null`
5. `explanation` is a non-empty string within the length cap.
6. On failure: **one** retry with the specific violation stated back to the model (decision 6). If the retry also fails, return `invalid_response`. The invalid payload never reaches the render path.

Provider-level outcomes handled before validation: a `refusal` stop reason and a `max_tokens` stop reason are both treated as `provider_error` and **not** retried.

### 7.2 Client-side, before rendering

Defence in depth, and the mechanism behind RD-3:

1. Re-resolve `topId` and `bottomId` against live `clothingItems` from context. If either is missing, render the error state rather than a partial recommendation.
2. Render name, colour and photo **exclusively from the local record**.
3. Render `explanation` as escaped plain text.

### 7.3 Known limitation

An explanation can still *mention* a garment that was not selected, or describe a selected garment inaccurately. Detecting this mechanically is brittle and would produce false positives. It is handled by the evaluation rubric's **wardrobe specificity** dimension and the **inconsistent explanation** failure category, not by code.

---

## 8. Prompt Versioning

`prompt.js` exports a `PROMPT_VERSION` constant — a simple incrementing identifier (`v1`, `v2`, …).

**Every evaluation result row is stamped with it**, alongside model ID, effort and schema version. This is what turns the evaluation plan's change log from narrative into evidence: any two rounds can be compared on identical, recorded configuration.

Increment `PROMPT_VERSION` when any of the following changes:

- system prompt text
- selection rules or priority ordering
- the wardrobe projection sent to the model
- the response schema
- no-match instructions

Do **not** increment for typo fixes that cannot change behaviour.

Each increment is recorded in the change-log table in `docs/v2-evaluation-results.md`: version, observed problem, change made, expected effect, actual result.

### Repeatability

The model exposes no sampling controls, so two runs of one scenario under an identical configuration may produce different valid recommendations. Repeatability here means **a fixed, recorded configuration** — not identical output. Consequently:

- comparisons are made across the scenario set, not by diffing individual responses
- a difference between two runs of one scenario is a data point about variability, not a defect
- a change counts as an improvement only if it holds across the set

This is why each scenario is run twice in the final evaluation.

---

## 9. Evaluation Fixture and Runner

### 9.1 `evals/wardrobe-fixture.json`

An array of real `ClothingItem` records — same shape the application writes, so it loads into `localStorage` unchanged.

```json
[
  {
    "id": "top_01",
    "name": "White Oxford shirt",
    "type": "top",
    "colour": "White",
    "details": "Cotton, smart, long-sleeved, suitable for office or dinner",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

Identifiers use the evaluation plan's `top_01` / `bottom_01` strings verbatim. Nothing in the application parses identifier format, so these are valid records. No `photo` field — images are never sent to the model.

The developer-only loader (`src/utils/devFixture.js`) writes this array to `localStorage`, gated behind the `__developer` flag already used by `analytics.js`. Reusing the existing flag avoids inventing a second developer convention.

### 9.2 `evals/scenarios.json`

```json
[
  {
    "id": "s04",
    "title": "Rainy casual weekend",
    "occasion": "Casual weekend outing",
    "weather": "Rainy and mild",
    "preferences": "Avoid linen",
    "expect": "recommendation",
    "forbiddenIds": ["top_04", "bottom_04"],
    "notes": "Should respect the linen exclusion; a strong result might use top_03 with bottom_03"
  }
]
```

| Field | Purpose |
|---|---|
| `expect` | `"recommendation"`, `"no_match"` or `"either"` — machine-checked |
| `forbiddenIds` | identifiers a valid result must not contain — machine-checked |
| `notes` | context for the human scorer only; never sent to the model |

Encoding the hard constraints this way converts constraint adherence and no-match correctness from human judgement into computed pass/fail columns. `"either"` covers scenario 12, where both a grounded recommendation and an honest no-match are acceptable outcomes. Only the genuinely subjective dimensions remain human-scored — the separation the evaluation plan asks for.

### 9.3 `evals/run-evals.mjs`

```bash
node evals/run-evals.mjs --runs 2 --round r01
```

The runner imports `api/_lib/*` directly. No HTTP, no browser, no React. For each scenario × run it:

1. loads the fixture and scenario
2. calls the same `recommend()` orchestration the endpoint uses
3. records the raw structured output
4. computes hard checks: schema valid, IDs valid, category valid, `expect` satisfied, no `forbiddenIds` present
5. writes one row with the human-score columns left blank

Output: `evals/results/<date>-<round>.json` (full raw payloads) and `.csv` (the evaluation plan's §13 field list, plus `effort`). Human scores are completed in the CSV; findings are written up in `docs/v2-evaluation-results.md`.

Running the evaluation requires a real API key and incurs cost. The runner is never invoked by the Vitest suite.

---

## 10. Testing

### 10.1 Automated — Vitest

Scope is deliberately narrow: **pure modules only.** No React, no network, no API key, no browser.

`validateResponse.test.js` covers the evaluation plan's twelve invalid-response cases, each asserting the response is rejected and never surfaced as success:

| # | Case | Expected |
|---|---|---|
| 1 | Unknown top identifier | rejected |
| 2 | Unknown bottom identifier | rejected |
| 3 | Two tops, no bottom | rejected |
| 4 | Two bottoms, no top | rejected |
| 5 | Missing explanation | rejected |
| 6 | Malformed structured output | rejected |
| 7 | Valid identifier in the wrong category | rejected |
| 8 | Extra invented item in descriptive text | identifiers still validated; documented as rubric-scored |
| 9 | Success returned when no match is correct | identifiers validated; correctness is a scenario-level check |
| 10 | Empty response | rejected |
| 11 | Provider error | mapped to `provider_error`, not retried |
| 12 | Request timeout | mapped to `timeout`, not retried |

Plus: identifier reuse (same ID as top and bottom), `no_match` carrying an identifier, unknown keys, and every inbound-validation limit in `validateRequest.test.js`.

Model calls are mocked by injecting a fake response into `validateResponse` directly — the pure modules take the payload as an argument, so no SDK mocking framework is needed.

### 10.2 Manual

Per slice, in `vercel dev`, on a mobile viewport. Every slice includes explicit regression checks on the MVP loop, because slice 1 introduces the first update mutator and slice 2 touches five existing components.

Recommendation states are reachable without burning API calls: slice 3 delivers the full UI against mocked structured data, so the seven experience states can be exercised before the model is wired in at all.

---

## 11. Implementation Slices

Each slice ships working, is independently verifiable, and leaves the application releasable.

### Slice 1 — "Wear this" loop closure

**Changes:** `storage.js` (try/catch, `updateOutfits`), `WardrobeContext` (`markOutfitWorn`), `OutfitDetail`, `SavedOutfitsList`.

**Acceptance criteria**
- Selecting "Wear this" shows an immediate confirmation (WT-1)
- The outfit shows a persistent worn state after navigating away and back (WT-2)
- The date of the most recent wear is displayed (WT-3)
- Marking the same outfit worn again overwrites the date; no duplicate state appears (WT-4)
- A simulated storage failure shows a clear error with a retry path, and does **not** display success (WT-5)
- The worn state survives a page refresh
- A worn badge is visible in the saved-outfits list
- `outfit_worn` fires on tap; `outfit_worn_confirmed` fires only after a successful write
- **Regression:** add item, create outfit, view outfit all behave as before

### Slice 2 — Photo capture and display

**Changes:** new `image.js`, new `ItemThumb.jsx`, `AddItem`, plus `WardrobeList`, `ItemDetail`, `ItemPicker`, `SavedOutfitsList`.

**Acceptance criteria**
- A photo can be selected from the device and previewed before saving (PU-1, PU-2)
- One image per item; selecting again replaces the preview (PU-3)
- Common mobile formats are accepted and normalised to JPEG (PU-4)
- Undecodable files are rejected with a clear explanation (PU-5)
- A file over 10 MB is rejected **before** decoding, with a clear explanation (PU-5)
- Processing, preview-ready, error and retry states all appear (PU-6)
- Stored images are ≤512px on the long edge
- The image appears wherever the item is displayed (PU-7)
- Items without a photo render the colour swatch fallback (PU-8)
- Images have text alternatives derived from wardrobe metadata
- Storage exhaustion produces a clear error and does **not** corrupt existing items
- The optional `details` field can be entered and is shown on Item Detail
- **Regression:** MVP-era items without `photo` or `details` display and function correctly

### Slice 3 — Contracts and mocked recommendation

**Changes:** `_lib/schema.js`, `_lib/prompt.js`, `_lib/validateRequest.js`, `_lib/validateResponse.js`, both test files, `RecommendOutfit.jsx`, `App.jsx`, `HomeScreen`, `devFixture.js`.

No network access in this slice.

**Acceptance criteria**
- `npm test` passes with all twelve invalid-response cases plus inbound-validation cases
- The suite runs with no API key set and no network
- The context form captures occasion, weather and preferences (RI-1, RI-2, RI-3)
- All six occasion chips are present: Office day, Presentation, Client dinner, Smart-casual event, Casual outing, Coffee or catch-up
- Free-text occasion entry remains usable whether or not a chip is selected
- Submission is blocked without an occasion, and every RI-5 length limit is enforced in the form (RI-5)
- The insufficient-wardrobe state explains what to add (RI-4)
- All seven experience states are reachable from mocked data: default, insufficient wardrobe, loading, success, no suitable outfit, invalid response, service failure
- The success state renders items from local wardrobe records, not from mock text (RD-3)
- The developer-only fixture loader populates the evaluation wardrobe

### Slice 4 — Live model integration

**Changes:** `api/recommend.js`, `_lib/model.js`, `_lib/recommend.js`, `src/utils/recommend.js`, `vercel.json`, `.env.example`.

**Acceptance criteria**
- `vercel dev` serves the SPA and `/api/recommend` together
- A real request returns a validated recommendation end to end
- No API key appears in the built client bundle (verified by grepping `dist/`)
- A missing key returns `config_error` without leaking configuration detail
- A forced timeout produces a recoverable state within the configured duration
- A mocked invalid response triggers exactly one retry, then surfaces `invalid_response`
- A bad request, an auth failure and a provider error each trigger **zero** retries
- The no-match path renders honestly, with no invented garments (RG-8, RD-6)
- Loading state appears immediately and duplicate submissions are prevented (RI-6)
- The user can return to the form and submit again (RD-5)

### Slice 5 — Save and analytics

**Changes:** `RecommendOutfit` (navigate to `create-outfit` with prefilled items), `analytics.js`.

**Acceptance criteria**
- A validated recommendation prefills the existing outfit builder and saves through the unchanged `addOutfit` path (RD-4)
- The saved outfit appears in the saved-outfits list and opens correctly
- `recommendation_viewed`, `recommendation_requested`, `recommendation_succeeded`, `recommendation_no_match`, `recommendation_failed` and `recommendation_saved` fire at the correct points
- No free-text user input and no prompt content is sent to analytics
- **Regression:** creating an outfit manually still works

### Slice 6 — Evaluation harness

**Changes:** `evals/*`, `docs/v2-evaluation-results.md`.

**Acceptance criteria**
- The fixture loads into the application unchanged via the developer-only loader
- All twelve scenarios are encoded with `expect` and `forbiddenIds`
- `node evals/run-evals.mjs --runs 2` produces 24 rows
- Each row carries model, effort, `PROMPT_VERSION`, schema version and date
- Hard checks are computed, not hand-entered; human-score columns are blank
- Scenarios 10 and 11 return no-match; scenario 12 returns only grounded identifiers
- Results are written to both JSON and CSV
- A first round is recorded in `docs/v2-evaluation-results.md` with failure patterns grouped

---

## 12. Known Limitations

| Limitation | Consequence | Why accepted |
|---|---|---|
| Browser storage bounds wardrobe size | Large wardrobes with photos will eventually hit quota | Prototype constraint (decision 4); failure is explicit, not silent |
| Public unauthenticated endpoint, no throttling | Deployed prototype could be abused | Decision 12; per-request cost bounded, total spend is not |
| No edit or delete | A wrong photo or `details` value cannot be corrected in-app | MVP scope decision carried forward — but photos raise the cost of it (§13) |
| Refresh returns to Home | Worn state persists but requires re-navigation to see | No router; badge added to the list view to mitigate |
| Explanation accuracy not machine-checked | Prose could misdescribe a selected item | Rubric-scored (§7.3); mechanical detection would be brittle |
| No sampling controls | Identical output cannot be guaranteed between runs | Inherent; addressed by fixed configuration and two runs per scenario |
| Single-device data | localStorage only | Unchanged from MVP |
| HEIC handling depends on browser decode | A rare input may be rejected | Canvas re-encoding covers the common path; failure is a clear error |
| Evaluation sample is small | Results are directional | Stated in the evaluation plan |

---

## 13. Deferred Scope

Deliberately **not** built in V2, and not blocking the hypothesis:

- Structured `material` / `formality` enums — `details` free text carries the same signal at a fraction of the UI cost
- Wear count and wear history
- Editing or deleting items and outfits. **Worth revisiting after V2:** photos and `details` make a mistaken entry more costly than a mistyped name was, and this may surface in the final user evaluation
- URL routing so a refresh restores the current screen
- Request throttling and abuse protection
- Streaming the explanation as it generates
- Prompt caching — the prompt sits near the minimum cacheable size, so the engineering would not pay for itself
- Multiple photos per item, background removal, any image analysis
- Component and end-to-end test coverage
- Automatic weather retrieval, conversational refinement, alternative recommendations, footwear and outerwear

Excluded entirely, consistent with the PRD: agents, tool-calling workflows, conversational memory, fine-tuning, retrieval-augmented generation, image recognition, shopping suggestions, accounts, cloud sync.

---

## 14. Document Conflicts and Resolutions

Four conflicts were found between the V2 documents and the repository. All four are now resolved in the documents themselves; this section records what was wrong and why the resolution was chosen.

### 14.1 The image-URL approach that never existed

**Conflict.** The opportunity brief stated *"The current image-URL approach is also unsuitable for ordinary users"*, and the PRD framed a user story as *"so that I do not need to find or paste an image URL"*. The MVP has no image field, no image URL and no `<img>` tag; `db-schema.md` lists `imageUrl` under deliberately excluded fields.

**Impact.** Low technical risk — photo upload is greenfield rather than a replacement, so there is no removal work. The real risk was a portfolio document contradicting its own repository.

**Resolution.** Both passages corrected to describe text-only records. `db-schema.md` was left unchanged: it accurately documents the MVP's excluded fields and remains a valid historical record of that iteration.

### 14.2 "No backend" versus protected credentials

**Conflict.** `CLAUDE.md` and `tech-stack.md` both mandated no backend. The PRD required that model credentials never appear in client code. A client-side key in a Vite bundle is public, so these were directly incompatible.

**Options considered.** A separate service was disproportionate. Shipping the key client-side would have failed the PRD's own release criteria.

**Resolution.** One Vercel Serverless Function. `CLAUDE.md` now permits exactly this single exception with explicit boundaries — no database, no session state, no other endpoints — and `tech-stack.md` §8 records the decision alongside the alternatives.

### 14.3 Fixture metadata the data model could not hold

**Conflict.** The evaluation fixture gave every item a **Material** and **Style attributes**, and used colours — Beige, Charcoal, Indigo, Pale blue — absent from the product's nine-value palette. The application stored only `name`, `type` and `colour`, and those colours could not be entered through Add Item at all.

**Impact.** The most consequential of the four. Material is decisive in six of twelve scenarios. Without a metadata field, the model would have had to infer material from item names — which the fixture's names happen to carry, so the evaluation would likely have *passed* while measuring an artefact of naming rather than a product capability. A real user typing "blue shirt" would get none of that signal.

**Resolution.** Two decisions. `details` (decision 1) carries material, warmth, fit, formality and shade, matching the PRD's own "existing descriptive metadata" wording. The palette is **not** extended (decision 2); the fixture now uses supported colours with shade in `details`.

This produces a stronger test than the original. Beige items now carry `colour: "Other"`, so scenario 9's "do not use beige items" can only be satisfied by reading `details` — a genuine check on whether the metadata reaches and is used by the model, rather than a colour-field string match.

### 14.4 Upload states for something that is never uploaded

**Conflict.** PU-6 required uploading, success, failure and retry states, implying a server round-trip. With local storage there is no upload — only a file read, a canvas resize and a write.

**Impact.** Implementing the requirement literally would have meant fabricating progress for a synchronous operation.

**Resolution.** Reinterpreted as processing / preview-ready / error / retry (decision 13). The user-facing intent — always know what the app is doing and always have a way forward — is fully preserved.

### 14.5 Repeatability wording

Not a repository conflict, but a claim the platform cannot support. The evaluation plan required the same "Model settings" across the final run. This model family rejects sampling parameters, so identical output is unavailable at any setting.

**Resolution.** §10 of the evaluation plan now distinguishes fixed recorded configuration from identical output, and states that variability between two runs of one scenario is data rather than a defect. This strengthens the plan's existing design — it is precisely why each scenario is run twice.

---

## 15. Summary

V2 extends the MVP additively. No refactoring, no state-management change, no routing change, no data migration.

Three optional fields (`details`, `photo`, `lastWornAt`), one new context mutator, one new shared component, one new screen, and one serverless function whose only job is keeping an API key off the client.

The one structural decision that matters is the `api/_lib` boundary: prompt construction and validation live in pure modules that the endpoint, the test suite and the evaluation runner all import. That is what makes the evaluation measure the shipped code, and what makes the twelve invalid-response cases testable with no API key and no network.

Two runtime additions total: `@anthropic-ai/sdk` and `vitest`.
