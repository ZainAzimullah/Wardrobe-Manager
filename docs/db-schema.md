# Database Schema

**Wardrobe Outfit Planner — MVP**

---

## 1. Overview

The schema has two entities: `ClothingItem` and `Outfit`. An Outfit references two ClothingItems — one top, one bottom. That is the entire data model.

Since the MVP uses localStorage (no backend, no authentication), all data is stored as serialised JSON under two fixed keys in the browser.

---

## 2. Data Structures

### 2.1 ClothingItem

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string (UUID) | Yes | Generated on create, e.g. `"ci_abc123"` |
| name | string | Yes | Free text, e.g. `"White linen shirt"` |
| type | enum: `"top"` \| `"bottom"` | Yes | Controls which wardrobe section the item appears in |
| colour | string | Yes | From predefined list or free text |
| createdAt | string (ISO 8601) | Yes | Timestamp of creation |

### 2.2 Outfit

| Field | Type | Required | Notes |
|---|---|---|---|
| id | string (UUID) | Yes | Generated on create, e.g. `"out_xyz789"` |
| name | string | No | User-provided or auto-generated (e.g. `"Outfit 1"`) |
| topId | string (UUID) | Yes | Foreign key → `ClothingItem.id` where `type = "top"` |
| bottomId | string (UUID) | Yes | Foreign key → `ClothingItem.id` where `type = "bottom"` |
| createdAt | string (ISO 8601) | Yes | Used for reverse-chronological ordering |

---

## 3. Relationships

```
ClothingItem (type: "top")    ──┬
                                ├──> Outfit
ClothingItem (type: "bottom") ──┘
```

- One Outfit references exactly two ClothingItems: one top, one bottom
- One ClothingItem can be referenced by many Outfits
- Deleting a ClothingItem does not cascade in MVP (no delete feature exists in v1)

---

## 4. Example JSON Objects

**ClothingItem — Top**

```json
{
  "id": "ci_a1b2c3",
  "name": "White linen shirt",
  "type": "top",
  "colour": "White",
  "createdAt": "2026-04-06T08:30:00.000Z"
}
```

**ClothingItem — Bottom**

```json
{
  "id": "ci_d4e5f6",
  "name": "Navy slim chinos",
  "type": "bottom",
  "colour": "Navy",
  "createdAt": "2026-04-06T08:32:00.000Z"
}
```

**Outfit**

```json
{
  "id": "out_g7h8i9",
  "name": "Monday work look",
  "topId": "ci_a1b2c3",
  "bottomId": "ci_d4e5f6",
  "createdAt": "2026-04-06T08:35:00.000Z"
}
```

---

## 5. localStorage Structure

Data is stored under two top-level keys. Each key holds an array of objects.

```
localStorage
├── "wardrobe_items"   → ClothingItem[]
└── "wardrobe_outfits" → Outfit[]
```

**Full example — `wardrobe_items`**

```json
[
  {
    "id": "ci_a1b2c3",
    "name": "White linen shirt",
    "type": "top",
    "colour": "White",
    "createdAt": "2026-04-06T08:30:00.000Z"
  },
  {
    "id": "ci_d4e5f6",
    "name": "Navy slim chinos",
    "type": "bottom",
    "colour": "Navy",
    "createdAt": "2026-04-06T08:32:00.000Z"
  },
  {
    "id": "ci_j1k2l3",
    "name": "Grey merino crewneck",
    "type": "top",
    "colour": "Grey",
    "createdAt": "2026-04-06T08:34:00.000Z"
  }
]
```

**Full example — `wardrobe_outfits`**

```json
[
  {
    "id": "out_g7h8i9",
    "name": "Monday work look",
    "topId": "ci_a1b2c3",
    "bottomId": "ci_d4e5f6",
    "createdAt": "2026-04-06T08:35:00.000Z"
  },
  {
    "id": "out_m4n5o6",
    "name": "Casual Friday",
    "topId": "ci_j1k2l3",
    "bottomId": "ci_d4e5f6",
    "createdAt": "2026-04-06T09:10:00.000Z"
  }
]
```

---

## 6. Read / Write Patterns

**Read all items**

```javascript
const items = JSON.parse(
  localStorage.getItem("wardrobe_items") || "[]"
);
```

**Write a new item**

```javascript
const items = JSON.parse(
  localStorage.getItem("wardrobe_items") || "[]"
);
items.push(newItem);
localStorage.setItem("wardrobe_items", JSON.stringify(items));
```

**Read all outfits, most recent first**

```javascript
const outfits = JSON.parse(
  localStorage.getItem("wardrobe_outfits") || "[]"
);
outfits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
```

**Resolve an outfit to full item details**

```javascript
const items = JSON.parse(localStorage.getItem("wardrobe_items") || "[]");
const outfit = { ...savedOutfit };
outfit.top = items.find(i => i.id === outfit.topId);
outfit.bottom = items.find(i => i.id === outfit.bottomId);
```

---

## 7. Validation Rules

| Rule | Enforced in |
|---|---|
| `name` must not be empty on ClothingItem | UI (Save button disabled) + write function |
| `type` must be `"top"` or `"bottom"` | UI (dropdown) + write function |
| `colour` must not be empty | UI (pre-selected default) + write function |
| Outfit must have both `topId` and `bottomId` | UI (Save button disabled) + write function |
| `topId` must reference an item with `type: "top"` | Write function |
| `bottomId` must reference an item with `type: "bottom"` | Write function |
| IDs must be unique | ID generation (UUID or timestamp-based) |

---

## 8. localStorage Limits and Risks

- **Storage limit:** Browsers typically allow 5MB per origin. At ~200 bytes per item and ~300 bytes per outfit, the app would need ~16,000 items or ~10,000 outfits to approach the limit. Not a concern for MVP.
- **Data loss risk:** If the user clears browser storage or uses a private/incognito window, all data is lost. This is an accepted trade-off for MVP — flagged as an open question in the PRD.
- **No sync:** Data exists only in the browser it was entered on. Two devices = two separate wardrobes. Acceptable for MVP validation.
- **Migration:** No schema versioning in MVP. If the data structure changes post-launch, a simple migration function can be run on app load to transform existing localStorage data.

---

## 9. Deliberately Excluded

These fields would be needed in a production schema but are out of scope for the MVP:

| Field | Reason excluded |
|---|---|
| userId | No authentication in MVP |
| updatedAt | No edit functionality in MVP |
| deletedAt | No soft delete / no delete at all in v1 |
| imageUrl | No photo upload in MVP |
| tags / occasion | No event-based features in MVP |
| wornAt | No wear history or calendar integration |
| version | No schema versioning needed yet |
