# CLAUDE.md — Wardrobe Outfit Planner (MVP)

## Project Overview
This is a mobile-first web app that helps users reduce decision fatigue when deciding what to wear by allowing them to create and reuse outfits from clothes they already own.

This project is a Minimum Viable Product (MVP) designed to validate a behavioural hypothesis, not to be a fully featured production app.

Core hypothesis:
If users can create and save outfits from clothes they already own, they will reduce the effort required to decide what to wear and will return to reuse saved outfits.

### Current iteration: V2

The MVP is built and has been user-tested. Work is now on V2, which adds three things to the validated MVP: clearer "Wear this" loop closure, direct photo upload, and one AI outfit recommendation grounded in the user's saved wardrobe.

The sections below still describe the MVP scope and remain the baseline. Where V2 extends them, the V2 documents take precedence:

- [V2 Opportunity Brief](docs/v2-opportunity-brief.md) — evidence and framing
- [V2 PRD](docs/v2-prd.md) — requirements
- [V2 Evaluation Plan](docs/v2-evaluation-plan.md) — how V2 is judged
- [V2 Technical Plan](docs/v2-technical-plan.md) — the agreed implementation approach

The MVP "Out of Scope" list below still applies to anything not named in the V2 documents.

---

## Core Behaviour Loop
The entire product is built around one loop:

Add clothes → Create outfit → Save outfit → Reuse outfit

When making product or engineering decisions, prioritise anything that makes this loop faster, easier, or more likely to repeat.

If a feature does not support this loop, it does not belong in the MVP.

---

## North Star Metric
Outfits planned per Weekly Active User.

This represents the core value of the product: helping users decide what to wear by planning outfits.

The MVP should focus on increasing:
- Activation — % of users who create their first outfit
- Engagement — Outfits created per Weekly Active User
- Retention — % of users who create an outfit at least once in week 4

---

## MVP Scope
The MVP includes only the following functionality:

- Add clothing items (name, type, colour)
- View wardrobe items
- Create an outfit (1 top + 1 bottom)
- Save outfits
- View saved outfits
- Reuse a saved outfit

Out of scope for MVP:
- AI outfit recommendations
- Weather suggestions
- Photo uploads
- Social features
- Shopping integrations
- User accounts
- Cloud sync
- Edit/delete items
- Edit/delete outfits

Do not add these unless explicitly asked.

---

## Technical Constraints
- Frontend: React (Vite)
- Styling: Tailwind CSS
- State: React useState + useContext
- Storage: localStorage only
- No general-purpose backend. The single exception is one Vercel Serverless Function under `/api`, added in V2 solely to keep the model API key off the client. No database, no session state, no other endpoints.
- No authentication
- Mobile-first design
- Hosted on Vercel

Keep the architecture simple. This is an MVP, not a scalable production system.

---

## Data Model
There are only two entities:

ClothingItem:
- id
- name
- type (top | bottom)
- colour
- createdAt
- details (optional, V2) — free-text garment description: material, warmth, fit, formality, shade
- photo (optional, V2) — downscaled JPEG data URL

Outfit:
- id
- name
- topId
- bottomId
- createdAt
- lastWornAt (optional, V2) — ISO date of the most recent "Wear this"

An outfit always consists of exactly one top and one bottom.

All V2 fields are optional. Records written by the MVP remain valid and must continue to work without migration.

---

## UX Principles
- Speed over features
- Mobile-first
- No dead ends (every empty state tells the user what to do)
- Clear labels and obvious actions
- A new user should be able to create their first outfit in under 3 minutes

---

## Key Screens
1. Home
2. Wardrobe List
3. Add Item
4. Item Detail
5. Create Outfit
6. Item Picker
7. Saved Outfits List
8. Outfit Detail

Each screen should be implemented as a separate React component.

---

## Analytics Events
Instrument the following Mixpanel events:

- item_added
- outfit_created
- outfit_viewed
- outfit_worn
- wardrobe_opened
- empty_state_seen
- add_item_cta_tapped

These events are used to measure activation, engagement, and retention.

---

## Coding Guidelines
- Use functional React components
- Use a WardrobeContext for shared state
- Store all data in localStorage
- Keep components small and focused
- Prefer simple solutions over complex ones
- Do not introduce Redux, databases, or authentication for MVP
- The goal is speed and clarity, not perfection

---

## When Helping With This Project
When generating code, Claude should:
- Follow the PRD and User Stories strictly
- Respect MVP scope
- Build screen-by-screen
- Use simple React patterns
- Keep styling minimal and mobile-friendly
- Ensure data persists in localStorage
- Ensure navigation matches the screen flow

Claude should act as a senior engineer helping build an MVP quickly and correctly.