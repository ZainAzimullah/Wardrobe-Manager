# Tech Stack

**Wardrobe Outfit Planner — MVP**

---

## 1. Overview

The goal of the tech stack is to ship the MVP as quickly as possible with the least moving parts. Every choice below prioritises speed of development, simplicity of deployment, and zero backend overhead — consistent with an MVP that stores data in localStorage and needs no server.

> **Guiding principle:** choose boring, well-documented tools with large communities. The MVP is a validation exercise, not a technical showcase. Complexity is the enemy of speed.

---

## 2. Stack at a Glance

| Layer | Choice |
|---|---|
| Frontend framework | React (via Vite) |
| Styling | Tailwind CSS |
| State management | React `useState` + `useContext` |
| Data storage | localStorage (browser) |
| Hosting | Vercel |
| Analytics | Mixpanel (free tier) |
| Deployment | GitHub → Vercel (auto-deploy on push) |

---

## 3. Stack Decisions

### 1 — Frontend Framework: React + Vite

**Alternatives considered:** Next.js, Vue, Svelte

- React is the most widely known frontend framework — easy to find help, examples, and developers
- Vite gives instant dev server startup and fast hot reload, making iteration very quick
- Component model maps naturally to the screen structure: each screen becomes one component
- No server-side rendering needed — all data is local, so a static SPA is sufficient

---

### 2 — Styling: Tailwind CSS

**Alternatives considered:** CSS Modules, Styled Components, plain CSS

- Utility-first: styles live next to markup, so there is no context-switching between files
- Mobile-first by default — the responsive prefix system (`sm:`, `md:`) matches the app's priorities exactly
- Eliminates the need to write and maintain custom CSS files for an MVP
- Large component library ecosystem (Headless UI, shadcn/ui) for things like dropdowns and modals

---

### 3 — State Management: React useState + useContext

**Alternatives considered:** Redux Toolkit, Zustand, Jotai

- The app has minimal shared state: a list of clothing items and a list of outfits
- No need for Redux, Zustand, or any external library — built-in React hooks are sufficient
- A single `WardrobeContext` can expose items and outfits to all screens with no extra dependencies
- Keeps the codebase small and easy to reason about for a solo developer or small team

---

### 4 — Data Storage: localStorage (browser)

**Alternatives considered:** IndexedDB, Supabase, Firebase

- No backend required — the entire data layer is in the browser
- Zero setup, zero cost, zero deployment complexity
- Sufficient for MVP validation: data persists across sessions on the same device
- Matches the schema designed in the Database Schema document exactly
- Can be swapped for a real backend (e.g. Supabase) post-validation without changing the UI layer

---

### 5 — Hosting: Vercel

**Alternatives considered:** Netlify, Cloudflare Pages, GitHub Pages

- Deploys a Vite + React app in under two minutes with zero configuration
- Free tier is more than sufficient for MVP traffic
- Automatic HTTPS, global CDN, and custom domain support included
- Native GitHub integration: every push to `main` triggers a new deploy automatically
- Preview deployments on every pull request — useful for sharing with testers

---

### 6 — Analytics: Mixpanel (free tier)

**Alternatives considered:** PostHog, Amplitude, Google Analytics

- Event-based analytics designed for product teams — tracks user actions, not just page views
- Maps directly to the MVP success metrics: item adds, outfit creates, outfit saves, "Wear this" taps
- Free tier supports up to 20M events per month — far beyond MVP needs
- Simple JavaScript SDK: one `mixpanel.track()` call per user action
- Funnel analysis built in — can immediately see drop-off between Add Item and Create Outfit

---

### 7 — Deployment Workflow: GitHub → Vercel

**Alternatives considered:** GitHub Actions + Netlify, manual deploy

- Push to `main` branch → Vercel auto-builds and deploys in ~60 seconds
- Pull requests get a unique preview URL — sharable with testers before merging
- No CI/CD configuration needed for an MVP — Vercel handles it all
- Rollback to any previous deployment in one click from the Vercel dashboard

---

## 4. Analytics Events to Instrument

These events map directly to the MVP success metrics defined in the PRD. Each should be tracked with a single `mixpanel.track()` call at the point of action.

| Event name | Triggered when |
|---|---|
| `item_added` | User taps Save on the Add Item screen |
| `outfit_created` | User taps Save on the Create Outfit screen |
| `outfit_viewed` | User taps an outfit card on the Saved Outfits list |
| `outfit_worn` | User taps "Wear this" on the Outfit Detail screen |
| `wardrobe_opened` | User taps My Wardrobe on the Home screen |
| `empty_state_seen` | User lands on any empty state (wardrobe, outfits, picker) |
| `add_item_cta_tapped` | User taps any "Add item" call-to-action |

---

## 5. Suggested Project Structure

```
src/
  components/
    HomeScreen.jsx
    WardrobeList.jsx
    AddItem.jsx
    ItemDetail.jsx
    CreateOutfit.jsx
    ItemPicker.jsx
    SavedOutfitsList.jsx
    OutfitDetail.jsx
  context/
    WardrobeContext.jsx   ← shared state + localStorage read/write
  utils/
    storage.js            ← localStorage helpers
    ids.js                ← UUID generation
  App.jsx                 ← routing
  main.jsx
```

---

## 6. Getting Started

```bash
# Create the project
npm create vite@latest wardrobe-app -- --template react
cd wardrobe-app

# Install dependencies
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install Mixpanel
npm install mixpanel-browser

# Start dev server
npm run dev
```

---

## 7. Deliberately Excluded

The following are consciously left out to keep the MVP simple:

| Excluded | Reason |
|---|---|
| TypeScript | Adds setup overhead; plain JavaScript is fine for an MVP this size |
| React Router | With 8 screens and no deep linking needed, simple state-based navigation is sufficient |
| Backend / API | localStorage removes any need for a server, database, or auth for the MVP |
| Testing framework | Manual testing is sufficient for MVP validation; add Jest / Vitest post-validation |
| PWA / Service Worker | Offline support is out of scope per the PRD |
| Component library | Tailwind utility classes are enough; a full library adds bundle size and learning curve |
| Error monitoring | Sentry etc. are valuable post-launch but unnecessary overhead for MVP |
