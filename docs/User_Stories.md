# User Stories

**Wardrobe Outfit Planner — MVP**

---

## Feature 1 — Add a Clothing Item

### Story 1.1 — Add a top

> *As a professional, I want to add a top to my wardrobe so that I can use it when creating outfits.*

**Acceptance criteria**

- Given I am on the Add Item screen, when I enter a name, select type "Top", choose a colour, and tap Save, then the item appears in my wardrobe under Tops
- The item is still visible after I refresh the page
- I cannot save the item if the name field is empty
- I can complete the full action in under 30 seconds

**Notes**

- Type is a dropdown with two options only: Top and Bottom
- Colour can be a predefined list (White, Black, Navy, Grey, Brown, Green, Blue, Red, Other) or free text — to be decided
- No image upload in MVP

---

### Story 1.2 — Add a bottom

> *As a professional, I want to add a bottom to my wardrobe so that I can pair it with tops when creating outfits.*

**Acceptance criteria**

- Given I am on the Add Item screen, when I enter a name, select type "Bottom", choose a colour, and tap Save, then the item appears in my wardrobe under Bottoms
- The item is still visible after I refresh the page
- I cannot save the item if the name field is empty
- I can complete the full action in under 30 seconds

**Notes**

- Shares the same Add Item form as Story 1.1 — the type dropdown controls which section the item lands in
- No edit or delete in MVP v1

---

## Feature 2 — View Wardrobe

### Story 2.1 — Browse wardrobe items

> *As a professional, I want to see all my clothing items grouped by type so that I can quickly find what I own.*

**Acceptance criteria**

- Given I have added clothing items, when I open the Wardrobe view, then I see a Tops section and a Bottoms section, each listing the relevant items
- Each item shows its name and colour (swatch or label)
- Items are grouped correctly — tops never appear under Bottoms and vice versa

**Notes**

- Colour representation (swatch vs text label) to be confirmed during design
- No sorting or filtering required in MVP

---

### Story 2.2 — Empty wardrobe state

> *As a professional opening the app for the first time, I want to see a clear prompt so that I know how to get started.*

**Acceptance criteria**

- Given I have added no clothing items, when I open the Wardrobe view, then I see an empty state message and a clear call-to-action to add my first item
- Tapping the call-to-action navigates me to the Add Item screen

**Notes**

- Empty state copy should be warm and action-oriented, e.g. "Your wardrobe is empty — add your first item to get started"

---

## Feature 3 — Create an Outfit

### Story 3.1 — Build and save an outfit

> *As a professional, I want to combine a top and a bottom into a named outfit so that I can save it for future use.*

**Acceptance criteria**

- Given I am on the Create Outfit screen, when I select one Top, one Bottom, and tap Save, then the outfit is saved and appears in my Saved Outfits view
- If I leave the outfit name blank, a default name is generated (e.g. "Outfit 1")
- I cannot save an outfit without selecting both a Top and a Bottom
- The saved outfit is immediately visible without a page refresh

**Notes**

- Outfit name is optional but encouraged — the UI should suggest naming it
- Only one Top and one Bottom per outfit in MVP — multi-item outfits are out of scope

---

### Story 3.2 — Cannot create outfit without wardrobe items

> *As a professional with an empty wardrobe, I want to be guided to add clothes first so that I am not blocked by an empty selection screen.*

**Acceptance criteria**

- Given I have no clothing items, when I navigate to Create Outfit, then I see a prompt explaining that I need to add items before creating an outfit
- The prompt includes a link or button to navigate to Add Item

**Notes**

- This prevents a confusing empty-picker state
- Applies if Tops OR Bottoms list is empty — both are required to create an outfit

---

## Feature 4 — View Saved Outfits

### Story 4.1 — Browse saved outfits

> *As a professional, I want to see all my saved outfits in one place so that I can quickly find one to wear.*

**Acceptance criteria**

- Given I have saved at least one outfit, when I open the Saved Outfits view, then I see a list of my outfits in reverse chronological order
- Each outfit entry shows the outfit name, the top (name and colour), and the bottom (name and colour)
- At least 10 outfits are displayed without performance issues

**Notes**

- Reverse chronological order means most recently saved outfits appear first
- No search or filter required in MVP

---

### Story 4.2 — Empty saved outfits state

> *As a professional who has not yet saved any outfits, I want to see a helpful prompt so that I know what to do next.*

**Acceptance criteria**

- Given I have no saved outfits, when I open the Saved Outfits view, then I see an empty state message with a call-to-action to create my first outfit
- Tapping the call-to-action navigates me to the Create Outfit screen

**Notes**

- Empty state copy should reinforce value, e.g. "No outfits yet — create one to save time getting dressed"

---

## Feature 5 — Reuse a Saved Outfit

### Story 5.1 — View outfit detail

> *As a professional, I want to tap a saved outfit and see the full details so that I know exactly what to wear.*

**Acceptance criteria**

- Given I am on the Saved Outfits view, when I tap an outfit, then I see a detail view showing the outfit name, the top (name and colour), and the bottom (name and colour)
- The detail view is fully readable on a standard mobile screen without scrolling
- I can return to the Saved Outfits list from the detail view

**Notes**

- Detail view can be an expanded card or a new screen — to be decided during design
- No edit functionality in MVP — view only

---

### Story 5.2 — Mark an outfit as chosen

> *As a professional, I want to confirm the outfit I have chosen so that I feel decided and can get on with my day.*

**Acceptance criteria**

- Given I am viewing an outfit detail, when I tap "Wear this", then the outfit is highlighted or confirmed as my choice for the day
- The action is available in one tap from the detail view

**Notes**

- This is a lightweight confirmation — no calendar integration or notifications in MVP
- "Wear this" behaviour (e.g. a visual tick, a toast message) to be defined during design
- Optional for v1 — viewing the outfit detail may be sufficient without an explicit confirm action
