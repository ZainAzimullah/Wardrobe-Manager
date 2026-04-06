# Wardrobe Manager (MVP)

## Overview
Wardrobe Manager is a mobile-first web application designed to help users reduce decision fatigue when choosing what to wear by allowing them to create and reuse outfits from clothes they already own.

This project was built as a **Minimum Viable Product (MVP)** to validate a behavioural hypothesis and demonstrate an end-to-end product development process, from problem definition through to a working prototype.

---

## Prototype Preview

![Image](docs/images/prototype_preview.png)

---

## Problem
Deciding what to wear is a daily source of decision fatigue, particularly for busy professionals. Users know what clothes they own but struggle to visualise combinations, forget outfits that worked well in the past, and spend unnecessary time deciding what to wear each day.

This product explores whether a simple wardrobe and outfit planning tool can reduce the effort required to decide what to wear.

---

## Target User
The target user for this MVP is a working professional who:

- Owns a moderate wardrobe
- Wants to look put-together
- Does not want to spend much time deciding what to wear
- Is comfortable using a simple mobile web app as part of a daily routine

---

## Business Outcome
The long-term business goal for this product is **conversion to paid users** through a freemium model.

---

## Product Outcome (North Star Metric)
**North Star Metric: Outfits planned per Weekly Active User**

This metric was chosen because it represents the core value of the product: helping users decide what to wear by planning outfits.

If users repeatedly plan outfits, the product is delivering value. If the product delivers value, users are more likely to return and eventually convert to paid users.

---

## Product Strategy
To drive the North Star metric, the product focuses on enabling and reinforcing a single core behaviour loop:

**Add clothes → Create outfit → Save outfit → Reuse outfit**

Each step in this loop reinforces repeat usage and reduces the effort required to decide what to wear in the future. Increasing the frequency of this loop directly drives the North Star metric (Outfits planned per Weekly Active User).

The MVP was intentionally scoped to support this loop and exclude features that do not directly support this behaviour.

---

## Hypothesis
**If users can create and save outfits from clothes they already own, they will reduce the time and effort required to decide what to wear and will return to reuse saved outfits.**

This MVP was built to test that hypothesis.

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

These metrics are designed to validate the core behaviour before investing in more advanced features.

---

## Product Development Process

This project was built to demonstrate an end-to-end product development process, from problem definition through to a working MVP.

The process followed a typical product development lifecycle:

| Stage | Task | Tool |
|------|------|------|
| Discovery | Opportunity-Solution Tree | ChatGPT, Miro |
| Discovery | Jobs-To-Be-Done | ChatGPT, Miro |
| Discovery | Story Map & MVP Scope | ChatGPT, Miro |
| Discovery | Success Metrics | ChatGPT, Miro |
| Discovery | Assumptions Mapping | ChatGPT, Miro |
| Definition | PRD Structure | ChatGPT |
| Definition | PRD | Claude |
| Definition | User Stories & Acceptance Criteria | Claude |
| Definition | Screen Structure | Claude |
| Definition | Database Schema | Claude |
| Definition | Tech Stack | Claude |
| Build | MVP Scaffold | Claude Code |
| Build | MVP Refinement | Cursor |
| Testing | Usability Testing | ChatGPT + Manual Testing |
| Deployment | Deployment (Vercel) | Claude Code |
| Future | Roadmap Planning | ChatGPT |

This workflow demonstrates how AI tools can be used across discovery, planning, and implementation to accelerate product development while still following a structured product process.

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
https://wardrobe-manager-xi.vercel.app/

---

## Product Documentation
This repository includes the full product development documentation, showing the process from idea → MVP → build.

Product Thinking (Excerpts from  [Miro Board](https://miro.com/app/board/uXjVGnSRt2Y=/?share_link_id=981380198776)):

- [Opportunity-Solution Tree](docs/images/opportunity_solution_tree.png)
- [Jobs-To-Be-Done](docs/images/jobs_to_be_done.png)
- [Metrics Tree](docs/images/metrics_tree.png)
- [MVP Success Metrics](docs/images/mvp_success_metrics.png)
- [Story Map](docs/images/story_map.png)
- [Assumptions Map](docs/images/assumptions_map.png)
- [Assumption Tests](docs/images/assumption_tests.png)

Product Development:

- [PRD](docs/PRD.md)
- [User Stories](docs/User_Stories.md)
- [Screen Structure](docs/Screens.md)
- [Database Schema](docs/DB_Schema.md)
- [Tech Stack](docs/Tech_Stack.md)

---

## What This Project Demonstrates
This project demonstrates an end-to-end product development process:

- Defining business and product outcomes
- Defining a north star metric
- Opportunity mapping
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