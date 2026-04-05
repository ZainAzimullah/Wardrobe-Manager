# Wardrobe Manager (MVP)

## Overview
Wardrobe Manager is a mobile-first web application designed to help users reduce decision fatigue when choosing what to wear by allowing them to create and reuse outfits from clothes they already own.

This project was built as a **Minimum Viable Product (MVP)** to validate a behavioural hypothesis rather than to build a full-featured wardrobe platform.

The focus of this project was to demonstrate an **end-to-end product development process**, from problem definition through to a working prototype.

---

## Problem
Deciding what to wear is a small but frequent source of decision fatigue. Many people own clothes that work well together, but:
- They forget which combinations work
- They repeatedly spend time choosing outfits
- They default to the same outfits even when they own other options

There is no lightweight tool focused specifically on **saving and reusing outfits** from clothes users already own.

---

## Hypothesis
**If users can create and save outfits from clothes they already own, they will reduce the time and effort required to decide what to wear.**

This MVP was built to test that hypothesis.

---

## Core Loop
The entire MVP is built around a single core loop:

**Add clothes → Create outfit → Save outfit → Reuse outfit**

Every feature in the MVP supports this loop. Features that do not support this loop were intentionally excluded.

---

## MVP Scope
The MVP includes only the core functionality required to test the hypothesis:

- Add clothing items (name, type, colour)
- View wardrobe items
- Create an outfit (1 top + 1 bottom)
- Save outfits
- View saved outfits
- Reuse a saved outfit

The following were intentionally **out of scope** for the MVP:
- AI outfit recommendations
- Weather-based suggestions
- Social features
- Photo uploads
- Shopping integrations
- User accounts
- Cloud sync

These features may be explored after validating the core behaviour.

---

## Success Metrics
The MVP will be considered successful if the following targets are met during testing:

- ≥ 70% of users add 5 or more clothing items
- ≥ 60% of users create at least one outfit
- Time to first outfit created < 3 minutes
- Average saved outfits per user ≥ 2
- ≥ 70% of users say the app helps them decide what to wear
- ≥ 70% of users say they would use the app again

---

## Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React (Vite) |
| Styling | Tailwind CSS |
| State Management | React useState + useContext |
| Data Storage | Browser localStorage |
| Hosting | Vercel |
| Analytics | Mixpanel |

The app uses **localStorage** instead of a backend to keep the MVP lightweight and fast to build.

---

## Live App
Link will be added after deployment.

---

## Product Documentation
This repository includes the full product development documentation.

Broader Domain Thinking (Images from  [Miro Board](https://miro.com/app/board/uXjVGnSRt2Y=/?share_link_id=981380198776)):

- [Miro Board](https://miro.com/app/board/uXjVGnSRt2Y=/?share_link_id=981380198776)
- [Opportunity-Solution Tree](docs/images/opportunity-solution-tree.png)
- [Metrics Tree](docs/images/metrics_tree.png)
- [Story Map](docs/images/story_map.png)
- [Assumptions Map](docs/images/assumptions_map.png)
- [Assumption Tests](docs/images/assumption_tests.png)

MVP Requirements:

- [PRD](docs/PRD.md)
- [User Stories](docs/User_Stories.md)
- [Screen Structure](docs/Screens.md)
- [Database Schema](docs/DB_Schema.md)
- [Tech Stack](docs/Tech_Stack.md)


These materials show the process from idea → MVP → build.

---

## What This Project Demonstrates
This project demonstrates an end-to-end product development process:

- Problem definition
- Hypothesis-driven product development
- MVP scoping and prioritisation
- Writing a Product Requirements Document (PRD)
- Creating user stories and acceptance criteria
- Designing user flows and screen structure
- Designing a data model
- Selecting a tech stack
- Building and deploying a working MVP

---

## Future Improvements (Post-MVP)
If the MVP validates the hypothesis, potential future features include:

- Edit and delete clothing items
- Multi-item outfits (jackets, shoes, accessories)
- Outfit tagging (work, casual, formal, etc.)
- Weather-based outfit suggestions
- Calendar integration
- Photo uploads for clothing items
- User accounts and cloud sync
- AI outfit recommendations

---

## Project Status
**Status:** In development (MVP)