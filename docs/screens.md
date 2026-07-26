# Screen Structure

**Wardrobe Outfit Planner — MVP**

Eight screens in total. Screen 6 (Item Picker) is a single reusable component used for both Top and Bottom selection within the Create Outfit flow.

---

## Screens

### Screen 1 — Home

**Purpose:** The app's entry point. Orients the user and provides access to all three core sections. Also serves as the return point after completing any flow.

**UI**
- App name at top
- Three section cards: My Wardrobe (with item count), Saved Outfits (with outfit count), Create Outfit
- First-time empty state: short welcome message + single CTA — "Add your first item"

**Actions**
- Tap My Wardrobe → Wardrobe List
- Tap Saved Outfits → Saved Outfits List
- Tap Create Outfit → Create Outfit
- Tap "Add your first item" (empty state only) → Add Item

**Navigation**
- Entry point — no back destination
- All main flows return here

---

### Screen 2 — Wardrobe List

**Purpose:** Shows all clothing items the user has added, grouped by type. The user's persistent wardrobe view.

**UI**
- Screen title: "My Wardrobe"
- Back arrow → Home
- Add item button (top right or floating)
- Tops section heading + list of tops (name + colour swatch/label each)
- Bottoms section heading + list of bottoms (name + colour swatch/label each)
- Empty state: message + "Add your first item" CTA

**Actions**
- Tap Add item → Add Item screen
- Tap any item → Item Detail

**Navigation**
- Back → Home
- Forward → Add Item or Item Detail

---

### Screen 3 — Add Item

**Purpose:** Minimal form for adding a single clothing item. Three fields only. Kept as fast as possible.

**UI**
- Screen title: "Add Item"
- Back arrow → Wardrobe List
- Name field (text input, required, placeholder: "e.g. White linen shirt")
- Type field (segmented control or dropdown: Top / Bottom)
- Colour field (tappable swatch row or short dropdown)
- Save button (full-width, bottom of screen, disabled until name is filled)
- Inline validation: "Please enter a name" if Save tapped with empty name

**Actions**
- Tap Save → saves item, returns to Wardrobe List with item visible
- Tap Back → returns without saving (no confirmation needed)

**Navigation**
- Returns to Wardrobe List on save or back

---

### Screen 4 — Item Detail

**Purpose:** View-only screen showing the details of a single clothing item. No editing in MVP.

**UI**
- Screen title: item name
- Back arrow → Wardrobe List
- Item name (large)
- Type label (Top or Bottom)
- Colour swatch + label
- Optional note: "Editing items is coming soon"

**Actions**
- Tap Back → returns to Wardrobe List

**Navigation**
- Back → Wardrobe List only

---

### Screen 5 — Create Outfit

**Purpose:** The outfit builder. The user picks one top and one bottom, optionally names the outfit, and saves it.

**UI**
- Screen title: "Create Outfit"
- Back arrow → Home
- Outfit name field (text input, optional, placeholder: "e.g. Monday work look")
- "Choose a Top" selector — shows selected item once chosen
- "Choose a Bottom" selector — shows selected item once chosen
- Save button (full-width, bottom, disabled until both Top and Bottom selected)
- Guard state if wardrobe missing tops or bottoms: inline message + link to Add Item

**Actions**
- Tap "Choose a Top" → Top Picker
- Tap "Choose a Bottom" → Bottom Picker
- Tap Save → saves outfit, navigates to Outfit Detail
- Tap Back → Home without saving

**Navigation**
- To Top Picker and Bottom Picker (and back)
- On save → Outfit Detail
- Back → Home

---

### Screen 6 — Item Picker (Top / Bottom)

**Purpose:** A focused selection screen or bottom sheet for picking one item. Reused for both Top and Bottom selection within the Create Outfit flow.

**UI**
- Title: "Choose a Top" or "Choose a Bottom"
- Dismiss control (X or back arrow)
- Scrollable list of relevant items (name + colour swatch each)
- Currently selected item highlighted
- Empty state: "No tops added yet. Add one first." with link to Add Item

**Actions**
- Tap any item → selects it, returns to Create Outfit with selection shown
- Tap dismiss → returns to Create Outfit without changing selection

**Navigation**
- Returns to Create Outfit in all cases

---

### Screen 7 — Saved Outfits List

**Purpose:** Shows all saved outfits. The user's outfit library — the primary screen for deciding what to wear.

**UI**
- Screen title: "Saved Outfits"
- Back arrow → Home
- List of outfit cards in reverse chronological order, each showing: outfit name, top (name + colour), bottom (name + colour)
- Empty state: "No outfits saved yet. Create your first outfit." + CTA

**Actions**
- Tap any outfit card → Outfit Detail
- Tap empty state CTA → Create Outfit

**Navigation**
- Back → Home
- Forward → Outfit Detail

---

### Screen 8 — Outfit Detail

**Purpose:** Full details of a saved outfit. The decision screen — the user comes here to confirm what they will wear.

**UI**
- Screen title: outfit name (or "Outfit Detail" if unnamed)
- Back arrow → Saved Outfits List
- Outfit name (large)
- Top: label, item name, colour swatch/label
- Bottom: label, item name, colour swatch/label
- "Wear this" button (full-width, prominent)

**Actions**
- Tap "Wear this" → brief confirmation (toast or inline tick: "Outfit chosen"), stays on screen or returns to Home
- Tap Back → Saved Outfits List

**Navigation**
- Back → Saved Outfits List
- "Wear this" → stays on screen or returns to Home

---

## Navigation Flow

Home is the persistent hub. Every flow returns to Home or its immediate parent. There is no deep nesting.

```
Home
├── My Wardrobe → Wardrobe List
│   ├── Add Item → (returns to Wardrobe List)
│   └── Item → Item Detail → (back to Wardrobe List)
│
├── Create Outfit → Create Outfit screen
│   ├── Choose Top → Top Picker → (returns to Create Outfit)
│   ├── Choose Bottom → Bottom Picker → (returns to Create Outfit)
│   └── Save → Outfit Detail
│
└── Saved Outfits → Saved Outfits List
    └── Outfit → Outfit Detail
        └── "Wear this" → (confirmation, stays or returns to Home)
```

---

## First-Time User Flow

The target is for a new user to complete the core loop in under 3 minutes from first open.

| Step | Screen | Action |
|---|---|---|
| 1 | Home | Sees empty state, taps "Add your first item" |
| 2 | Add Item | Fills in name, type, colour — taps Save |
| 3 | Wardrobe List | Sees first item. Taps "Add item" to add more. Repeats until at least one top and one bottom exist. |
| 4 | Home | Taps "Create Outfit" |
| 5 | Create Outfit | Taps "Choose a Top" → picks from Top Picker → returns. Taps "Choose a Bottom" → picks from Bottom Picker → returns. Optionally names the outfit. Taps Save. |
| 6 | Outfit Detail | Sees first saved outfit. Taps "Wear this". |
| ✓ | Done | Core loop complete. Decision made. |

---

## Core Loop Flow

The app becomes more valuable with each use. Every item added makes outfit creation faster. Every outfit saved makes tomorrow's decision faster.

```
Add Item (Screen 3)
↓ saved
Wardrobe List (Screen 2) ← items accumulate here over time
↓ user ready to plan
Create Outfit (Screen 5)
↓ top + bottom selected and saved
Outfit Detail (Screen 8)
↓ "Wear this"
Saved Outfits List (Screen 7) ← outfits accumulate here over time
↓ next morning, user returns
Outfit Detail (Screen 8)
↓ "Wear this"
Decision made ✓
```

---

## Screen Summary

| # | Screen | Role in loop |
|---|---|---|
| 1 | Home | Hub — entry point and return destination |
| 2 | Wardrobe List | Browse clothes |
| 3 | Add Item | Add clothes — feeds the wardrobe |
| 4 | Item Detail | View a single item (read-only) |
| 5 | Create Outfit | Build and save an outfit |
| 6 | Item Picker (Top / Bottom) | Select one item — reused component |
| 7 | Saved Outfits List | Browse saved outfits |
| 8 | Outfit Detail | View and reuse a saved outfit |
