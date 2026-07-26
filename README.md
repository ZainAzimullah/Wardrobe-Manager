# Wardrobe Manager

A mobile-first web app for reducing outfit decision fatigue — built end-to-end as a PM case study: discovery → definition → build → user testing → findings.

**→ [wardrobe-manager-eight.vercel.app](https://wardrobe-manager-eight.vercel.app/)**

![Prototype Preview](docs/images/prototype-preview.png)

---

## Product Development Process

### Discovery

| Artefact | Preview |
|---|---|
| [Opportunity-Solution Tree](docs/images/opportunity-solution-tree.png) | ![OST](docs/images/opportunity-solution-tree.png) |
| [Jobs-To-Be-Done](docs/images/jobs-to-be-done.png) | ![JTBD](docs/images/jobs-to-be-done.png) |
| [Story Map & MVP Scope](docs/images/story-map.png) | ![Story Map](docs/images/story-map.png) |
| [Metrics Tree](docs/images/metrics-tree.png) | ![Metrics Tree](docs/images/metrics-tree.png) |
| [MVP Success Metrics](docs/images/mvp-success-metrics.png) | ![Success Metrics](docs/images/mvp-success-metrics.png) |
| [Assumptions Map](docs/images/assumptions-map.png) | ![Assumptions](docs/images/assumptions-map.png) |

### Definition

| Document | Description |
|---|---|
| [PRD](docs/prd.md) | Problem, target user, features, success metrics, open questions |
| [User Stories](docs/user-stories.md) | Acceptance criteria for all five features |
| [Screen Structure](docs/screens.md) | 8 screens, navigation flows, first-time user journey |
| [Database Schema](docs/db-schema.md) | Two-entity localStorage model with read/write patterns |
| [Tech Stack](docs/tech-stack.md) | Stack decisions and rationale |

### Measurement

| Artefact | Link |
|---|---|
| User Test Instructions | [user-test.md](./docs/user-test.md) |
| Survey | [Google Form](https://forms.gle/sfTz5pUTqtgJSzbY8) |
| Analytics | [Mixpanel Dashboard](https://mixpanel.com/p/PNCeGJf582SguPVnKLKaow) |
| Findings & Recommendations | [Full Report](docs/findings-and-recommendations.md) |

---

## Problem

Deciding what to wear is a daily source of decision fatigue, particularly for busy professionals. Users struggle to visualise combinations, forget outfits that worked well in the past, and spend unnecessary time deciding what to wear each day.

**Hypothesis:** if users can add their clothes and build outfits, they'll reduce that effort and return to reuse what they've saved.

---

## Core Loop + North Star

**Add clothes → Create outfit → Save outfit → Reuse outfit**

Every feature decision was evaluated against this loop. If it didn't support it, it was cut.

**North Star Metric:** Outfits planned per Weekly Active User

---

## Target User

Working professionals who own a moderate wardrobe, want to look put-together, and don't want to think about it.

---

## MVP Scope

**In scope**
- Add clothing items (name, type, colour)
- View wardrobe grouped by type
- Create an outfit (1 top + 1 bottom)
- Save and reuse outfits

**Intentionally excluded**
- Photo uploads-
- AI recommendations
- Weather suggestions
- User accounts
- Cloud sync
- Social features

---

## Success Metrics

| Metric | Target |
|---|---|
| Users who add 2+ clothing items | ≥ 70% |
| Users who create 1+ outfit | ≥ 60% |
| Time to first outfit created | < 3 minutes |
| Average saved outfits per user | ≥ 2 |
| Users who say the app helps them decide what to wear | ≥ 70% |

---

## User Test Findings

![MVP User Research Summary](docs/images/hero.png)

> **6 participants · 12–13 April 2026 · Mobile web · Auckland**

The core hypothesis was validated. Every instrumented user completed the full loop without instruction. Average outfit creation time was **57 seconds** against a 3-minute target, with zero funnel drop-off across all four steps.

Two issues emerged.

**"Wear this" is broken by ambiguity.** Five of six users didn't understand what happened after tapping it. They expected a persistent, visible outcome. Without one, there's no observable loop closure and no reason to return.

> *"After clicking 'Wear this' I tried a few more times, and went back to the main page. Didn't end up figuring out what to do next or what this action means."*

**Photos are a functional gap, not a nice-to-have.** Four of six participants raised it unprompted. Text names alone aren't enough for users to reliably identify garments — which limits how much the app actually reduces decision effort, and likely explains the 3.0/5 helpfulness score.

> *"It would make it so much easier to scan your options and quickly find one you like instead of reading just text, especially for visual learners."*

The core experience landed as intended:

> *"The app was very intuitive — I didn't need any instructions to understand what I needed to do."*

| Metric | Result | Target | Met? |
|---|---|---|---|
| Users adding 2+ items | 4/4 (100%) | ≥ 70% | ✓ |
| Users creating at least one outfit | 4/4 (100%) | ≥ 60% | ✓ |
| Avg. outfit creation time | 57 seconds | < 3 min | ✓ |
| Outfits per Weekly Active User | 2.5 | ≥ 2 | ✓ |
| Avg. helpfulness (Likert) | 3.0 / 5 | ≥ 70% vote ≥ 3/5 | ✓ |

**Next steps:** fix "Wear this" confirmation state immediately. Ship photo upload in v2. The core loop is proven — the path to a 4+ helpfulness score runs through these two fixes.

*Full report: [`/docs/findings-and-recommendations.md`](docs/findings-and-recommendations.md)*

---

## V2 — AI Outfit Recommendations

V2 extends Wardrobe Manager from a tool for manually creating and saving outfits into a context-aware decision-support experience.

The iteration responds to two findings from MVP testing:

- Five of six participants were unclear about what happened after selecting **“Wear this”**
- Four of six participants independently requested clothing photos to make garments easier to recognise

V2 addresses those evidenced gaps while testing a new hypothesis:

> Can a context-aware recommendation grounded in the user’s saved wardrobe reduce the effort required to decide what to wear?

### What has been built

- A persistent **“Wear this”** state with visible confirmation and last-worn date
- Direct clothing photo selection, client-side resizing and local storage
- Optional garment details such as material, warmth and formality
- An AI recommendation flow using occasion, optional weather and user preferences
- Structured model output containing one saved top ID and one saved bottom ID
- Server-side and client-side validation to prevent unavailable garments from being displayed
- An explicit no-match state when the wardrobe cannot satisfy the request
- A secure Vercel serverless endpoint so the Anthropic API key is never exposed in the browser

The model receives structured wardrobe metadata rather than garment photos. Photos help the user recognise their clothing, while excluding images from the model keeps the initial experiment narrower, cheaper and easier to evaluate.

### Current status

The live recommendation flow is working end to end using Claude Sonnet.

The feature has **not yet completed formal evaluation or user testing**, so recommendation quality and improvements in perceived helpfulness remain unproven.

The next steps are to:

1. Connect recommendations to the existing save-outfit flow
2. Add the planned analytics events
3. Run the predefined scenario-based evaluation
4. Conduct a small user evaluation
5. Document results and any resulting iterations

### V2 documentation

| Document | Description |
|---|---|
| [Opportunity Brief](docs/v2-opportunity-brief.md) | Evidence, opportunity, assumptions and product hypothesis |
| [Product Requirements Document](docs/v2-prd.md) | Scope, requirements, guardrails and success criteria |
| [Evaluation Plan](docs/v2-evaluation-plan.md) | Test wardrobe, scenarios, hard checks and scoring rubric |
| [Technical Plan](docs/v2-technical-plan.md) | Architecture, API contract, validation and implementation slices |

---

## Reflection & Key Learnings

**Speed of execution changed how I approached scoping.**
Because I could go from idea to working app quickly, I was more disciplined about what to include. Rather than exploring multiple directions, I focused on validating one hypothesis end to end.

**Upfront structure directly impacted build quality.**
Providing Claude Code with a PRD, user stories, screen structure, and schema made a measurable difference. Specific inputs produced aligned output. Vague inputs produced features that didn't fit the MVP.

**I chose to validate with a real product, not a prototype.**
Building with localStorage and a simple UI was as fast as high-fidelity prototyping, and produced more realistic signal. The core risk was behavioural — would users create and reuse outfits — not visual fidelity.

**AI accelerated the build, but not the thinking.**
Defining the problem, choosing the right opportunity (decision fatigue + outfit reuse), and aligning on a clear north star still required judgement. AI handled execution; direction required a human.

**Different tools played distinct roles.**
Claude Code was strongest for architecture and initial scaffolding. Cursor for iterative refinement. ChatGPT for early problem framing and artefact structure.

> As execution becomes increasingly commoditised, the quality of problem framing, prioritisation, and judgement becomes the primary driver of product impact.

---

## Future Improvements

- "Wear this" confirmation state (immediate)
- Photo uploads for clothing items
- Edit and delete items
- Multi-item outfits (jackets, shoes, accessories)
- Outfit tagging (work, casual, formal)
- Weather-based suggestions
- Calendar integration
- AI recommendations
- User accounts and cloud sync

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Styling | Tailwind CSS |
| State | React useState + useContext |
| Storage | Browser localStorage |
| Hosting | Vercel |
| Analytics | Mixpanel |

---

## Local Development

### Prerequisites
- Node.js v18+
- npm
- A [Vercel](https://vercel.com) account (only needed to run the AI recommendation endpoint locally — see below)

### Setup

```bash
git clone https://github.com/zainazimullah/wardrobe-manager.git
cd wardrobe-manager
npm install
cp .env.example .env   # add your Mixpanel token and Anthropic API key
```

There are two ways to run the app locally, depending on what you're working on:

**UI only** — fast, no login required. The AI recommendation screen will error, since Vite doesn't serve `/api`.

```bash
npm run dev             # http://localhost:5173
```

**Full app, including AI recommendations** — runs the SPA and the `/api/recommend` serverless function together.

```bash
npx vercel login        # one-time
npx vercel link         # one-time, links this folder to a Vercel project
npx vercel dev --listen 3000   # http://localhost:3000
```

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload (UI only, no `/api`) |
| `npx vercel dev --listen 3000` | Start dev server + serverless functions (full app) |
| `npm run build` | Build for production → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the Vitest suite (`api/_lib/**` validation and error-mapping tests) |