# Product Requirements Document

**Wardrobe Outfit Planner — MVP**

---

## Purpose

This document defines the requirements for the Wardrobe Outfit Planner MVP. The goal is to validate this hypothesis:

*If users can easily add their clothes and combine them to create outfits, they will reduce the time and effort required to decide what to wear. If this is true, users will save outfits and return to reuse them or create more.*

Everything in this document is scoped to that validation. Features not listed here are explicitly out of scope.

---

## Product Outcome and Success Metrics

This MVP is designed to support the product’s core outcome:

**North Star Metric:** Outfits planned per Weekly Active User

This metric represents the core value of the product: helping users decide what to wear by planning outfits.

The MVP specifically aims to improve the following product metrics:

- **Activation:** % of users who create their first outfit
- **Engagement:** Number of outfits created per Weekly Active User
- **Retention:** % of users who create or reuse an outfit at least once in week 4

The features included in this PRD are scoped to support the core behaviour loop:

**Add clothes → Create outfit → Save outfit → Reuse outfit**

If users complete this loop repeatedly, the product is delivering value. The MVP focuses on validating this behaviour before investing in more advanced features such as recommendations, automation, or integrations.

---

## Problem Statement

Deciding what to wear is a daily source of decision fatigue, particularly for busy professionals. Users struggle to visualise combinations, forget outfits that worked well in the past, and spend unnecessary time deciding what to wear each day.

This product explores whether a simple wardrobe and outfit planning tool can reduce the effort required to decide what to wear.

---

## Target User

Professionals who:

- Own a moderate wardrobe but find outfit planning mentally effortful
- Want to look put-together without spending time thinking about it
- Are comfortable using a simple mobile web app as part of a morning routine

---

## Core Loop

The MVP supports one loop and one loop only:

> **Add clothes → Create outfit → Save outfit → Reuse outfit**

Every feature decision should be evaluated against this loop. If a feature does not directly support it, it does not belong in the MVP.

---

## Features

### Add a Clothing Item

Users can add individual items of clothing to their wardrobe.

**Required fields**

- Name (e.g. "White linen shirt") — free text, required
- Type — dropdown: Top or Bottom
- Colour — free text or predefined list (White, Black, Navy, Grey, Brown, Green, Blue, Red, Other)

**Behaviour**

- Item appears immediately in the wardrobe view after saving
- No image upload in MVP — colour and name are sufficient for identification
- No edit or delete in MVP v1 (can be added post-launch based on feedback)

**Acceptance criteria**

- User can add a Top with a name and colour in under 30 seconds
- User can add a Bottom with a name and colour in under 30 seconds
- Item persists after page refresh

---

### View Wardrobe

Users can browse all clothing items they have added.

**Behaviour**

- Items are grouped by type: Tops and Bottoms
- Each item displays its name and colour
- Empty state shows a prompt to add the first item

**Acceptance criteria**

- Items are clearly separated into Tops and Bottoms sections
- Colour is visually represented (swatch or label)
- Empty state is present and directs the user to add an item

---

### Create an Outfit

Users can combine one Top and one Bottom to form an outfit.

**Behaviour**

- User selects one Top from their wardrobe
- User selects one Bottom from their wardrobe
- User gives the outfit a name (e.g. "Monday work look") — optional but encouraged
- User saves the outfit

**Acceptance criteria**

- Outfit creation requires exactly one Top and one Bottom
- Outfit name is optional; a default name is generated if left blank (e.g. "Outfit 1")
- Outfit is saved and immediately visible in the saved outfits view
- Cannot save an outfit with no items selected

---

### View Saved Outfits

Users can browse all outfits they have previously saved.

**Behaviour**

- Each outfit displays its name, the Top selected, and the Bottom selected
- Empty state prompts the user to create their first outfit
- Outfits are listed in reverse chronological order (most recent first)

**Acceptance criteria**

- Each outfit card shows outfit name, top name and colour, bottom name and colour
- Empty state is present and directs the user to create an outfit
- At least 10 outfits are displayable without performance issues

---

### Reuse a Saved Outfit

Users can quickly view a saved outfit and act on it.

**Behaviour**

- Tapping a saved outfit expands or navigates to a detail view
- The detail view shows the full outfit: top and bottom, with names and colours clearly displayed
- A "Wear this" action marks it as the chosen outfit for the day (optional for v1 — viewing is sufficient)

**Acceptance criteria**

- User can open a saved outfit and see full top and bottom details in one tap
- The outfit detail is readable without scrolling on a standard mobile screen

---

## Out of Scope (MVP)

The following are explicitly excluded and may be considered post-validation:

- AI outfit recommendations
- Weather-based suggestions
- Event-based outfit tagging
- Photo or camera integration
- Bulk clothing upload
- Social or sharing features
- Shopping or product links
- Calendar integration
- Push notifications
- Edit or delete clothing items
- Edit or delete saved outfits
- User accounts or authentication (localStorage is acceptable for MVP)

---

## Technical Requirements

| Requirement | Decision |
|---|---|
| Platform | Mobile-responsive web app |
| Authentication | None for MVP — data stored locally (localStorage or equivalent) |
| Data persistence | Browser localStorage is acceptable for MVP validation |
| Hosting | Static hosting (e.g. Vercel, Netlify) |
| Offline support | Not required |
| Native app | Not in scope |

---

## UX Principles

**Speed over features**
The interface must allow a user to add their first item within 60 seconds of landing on the app, and create their first outfit within 3 minutes.

**No dead ends**
Every empty state must tell the user what to do next. A wardrobe with no clothes should prompt adding clothes. An outfit screen with no outfits should prompt creating one.

**Mobile-first**
The app will primarily be used on a phone. All interactions — tapping, selecting, scrolling — must feel natural on a small screen. Desktop is a bonus, not the target.

**Clarity over cleverness**
Colour swatches, clear labels, and obvious actions. No hidden gestures or ambiguous icons.

---

## Success Metrics

Validation targets for the MVP. If the majority are not met after user testing, the product hypothesis should be revisited before further development.

| Metric | Target |
|---|---|
| Users who add 2 or more clothing items | ≥70% |
| Users who create 1 or more outfits | ≥60% |
| Time to first outfit created | < 3 minutes |
| Average saved outfits per user | ≥2 |
| Users who say the app helps them decide what to wear | ≥70% |
| Users who say they would use the app again | ≥70% |

---

## Open Questions

- **1.** Colour input — Predefined list vs. free text: which leads to faster item entry?
- **2.** Outfit naming — Should users be required to name outfits, or is auto-naming sufficient to keep friction low?
- **3.** Data persistence — If localStorage is used, users who clear their browser lose all data. Is this acceptable for the validation period?
- **4.** Item management — Will users be frustrated by the inability to edit or delete items? Should a basic delete be included to prevent wardrobe clutter?

---

## Launch Criteria

The MVP is ready to ship for user testing when all of the following are true:

- All five features (Add, View Wardrobe, Create Outfit, View Outfits, Reuse Outfit) are functional end-to-end
- The app is mobile-responsive and usable on iOS Safari and Android Chrome
- All empty states are implemented
- A first-time user can complete the core loop without instruction
