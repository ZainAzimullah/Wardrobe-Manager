# Wardrobe Manager V2 — Opportunity Brief

**Status:** Draft
**Iteration:** V2
**Primary opportunity:** Context-aware outfit decision support

---

## Background

Wardrobe Manager was created to reduce the effort involved in deciding what to wear.

The MVP tested a deliberately narrow product loop:

> **Add clothes → Create outfit → Save outfit → Reuse outfit**

It allowed users to catalogue clothing using basic text attributes, manually combine a top and bottom, save the result as an outfit, and select “Wear this”.

The MVP was intentionally designed to test whether users could understand and complete this core workflow before introducing more advanced functionality such as photo upload, weather integration or AI recommendations.

---

## Evidence from the MVP

The MVP was tested with six participants on 12–13 April 2026.

Survey and qualitative feedback were collected from all six participants. Behavioural analytics were available for four participants because two sessions were not captured by Mixpanel.

The core workflow performed well:

* **4/4 instrumented participants** added at least two clothing items
* **4/4 instrumented participants** created an outfit
* **4/4 instrumented participants** completed the measured product funnel
* Average outfit-creation time was **57 seconds**, against a target of under three minutes
* Participants created **2.5 outfits per Weekly Active User** during the test window

These results indicate that first-time users could understand and complete the core product workflow.

However, perceived usefulness was more moderate:

* Average helpfulness was **3.0/5**
* Four of six participants selected the neutral midpoint
* Only one participant rated the experience above neutral
* No participant selected 5/5

The qualitative research also identified two recurring usability gaps.

### Unclear “Wear this” outcome

**Five of six participants** were unclear about what happened after selecting “Wear this”.

Users expected a visible or persistent result, such as a confirmation, date, status or “worn today” indicator.

One participant said:

> “Didn't end up figuring out what to do next or what this action means.”

This indicates that the existing workflow lacks clear loop closure. The product records the action internally, but the user cannot clearly see what changed.

### Lack of clothing photos

**Four of six participants** independently raised the lack of clothing photos.

One participant said:

> “It's hard to identify your clothing items by name — image would help.”

Text descriptions made garments harder to recognise and compare, limiting the usefulness of the wardrobe when creating an outfit.

The MVP stores no clothing imagery at all. Wardrobe items are text-only records identified by name, type and a colour swatch. A practical wardrobe experience should allow users to select a photo directly from their device.

Full research findings are documented in [MVP Findings and Recommendations](./findings-and-recommendations.md).

---

## What the Evidence Supports

The MVP evidence supports the following conclusions:

* First-time users can understand the basic product
* Users can add clothing and create outfits quickly
* The “Wear this” action needs a clearer and persistent outcome
* Text-only wardrobe records make garments harder to recognise
* Direct photo upload would improve the usability of the wardrobe
* Successful task completion did not yet translate into strong perceived helpfulness

The research does **not** yet establish that:

* Users will return and reuse outfits over time
* The product substantially reduces everyday outfit decision fatigue
* Users want the product to choose outfits for them
* AI recommendations are the correct solution
* AI recommendations will be trusted or considered useful

AI outfit assistance should therefore be treated as a **new product hypothesis**, not as a feature directly validated by the MVP research.

---

## Product Interpretation

The MVP helps users record, organise and save outfit decisions.

However, users must still:

1. Review the clothing available
2. Recall what each text-based item represents
3. Decide which garments suit the situation
4. Determine which items work together
5. Manually construct the outfit
6. Decide whether the final combination is appropriate

It is reasonable to infer that the current product helps users **manage outfit decisions more than it helps them make those decisions**.

This interpretation is based on:

* The existing manual workflow
* The moderate helpfulness score
* Participant difficulty recognising text-only clothing records
* The original goal of reducing outfit decision fatigue

It was not directly expressed by participants as a request for AI.

---

## Opportunity

> Help working professionals make a suitable outfit decision using clothing they already own, without requiring them to manually compare every possible combination.

The opportunity is to evolve Wardrobe Manager from:

> A passive tool for cataloguing clothing and saving outfit decisions

towards:

> An active decision-support tool that helps users reach an outfit decision

V2 will test whether a context-aware outfit recommendation can provide useful additional support beyond the existing manual outfit builder.

---

## Target User

The target user remains:

> Working professionals who own a moderate wardrobe, want to look put-together and do not want to spend unnecessary time deciding what to wear.

These users may:

* Own enough clothing to make choosing between options mentally effortful
* Care about occasion, weather, comfort and formality
* Reuse outfit combinations that have worked previously
* Want practical rather than experimental recommendations
* Prefer to use clothing they already own
* Value a quick and understandable answer

---

## Job to Be Done

> When I need to get dressed for a particular situation, help me choose a suitable outfit from the clothing I already own so that I can feel confident without spending too much time comparing different combinations.

---

## V2 Hypothesis

> We believe that providing a context-aware outfit recommendation grounded in the user’s saved wardrobe will reduce the effort required to decide what to wear.

We will consider this promising when recommendations:

* Use only clothing available in the user’s wardrobe
* Suit the stated occasion and context
* Respect explicit preferences and constraints
* Form a coherent outfit
* Include an understandable explanation
* Are suitable enough that users would consider wearing or saving them
* Require less perceived decision effort than beginning from a blank outfit builder

This hypothesis must be evaluated rather than assumed.

---

## Proposed V2 Direction

V2 will contain three connected areas of work.

### 1. Clarify the existing loop

Improve the “Wear this” interaction by providing an immediate and persistent outcome.

This may include:

* A confirmation message
* A “worn today” or planned status
* A visible date
* A persistent badge or state

This is a targeted usability correction based on clear MVP evidence.

### 2. Improve wardrobe input

Introduce a deliberately narrow direct photo-upload experience.

Users should be able to:

* Select one image from their device
* Preview it
* Associate it with a wardrobe item
* See it when browsing their wardrobe
* Receive basic validation and error feedback

Photo upload is an enabling improvement. It makes the wardrobe more recognisable and useful for both manual outfit creation and AI-generated recommendations.

### 3. Test context-aware outfit recommendations

Allow the user to provide an occasion and a small amount of relevant context, then receive one outfit recommendation using items from their saved wardrobe.

The initial experience should:

* Select only real wardrobe items
* Show the exact items recommended
* Explain why the combination is suitable
* Respect supplied constraints
* Communicate honestly when no suitable outfit is available
* Allow the recommendation to be saved or acted on

The recommendation experience is the primary V2 experiment and the centre of the iteration’s portfolio narrative.

---

## Why AI May Be Appropriate

Choosing an outfit can require reasoning across several forms of information:

* Available garments
* Clothing type and colour
* Occasion
* Weather
* Desired formality
* Comfort requirements
* Personal preferences
* Specific constraints

Some of this information is structured, while some may be expressed naturally by the user.

There may also be several reasonable outfit combinations rather than one objectively correct answer.

A language model may help by:

* Interpreting natural-language context
* Reasoning across multiple constraints
* Comparing the request with available wardrobe items
* Returning a structured recommendation
* Explaining the recommendation clearly

However, using AI also introduces risks such as invented garments, ignored constraints, generic advice and unjustified confidence.

The purpose of V2 is therefore not simply to connect the application to a model. It is to evaluate whether the resulting recommendations are grounded, coherent and genuinely useful.

---

## Product Principles

### Ground recommendations in the wardrobe

The system should recommend only items saved in the user’s wardrobe.

It should not invent clothing or assume that the user can purchase additional items.

### Reduce decision effort

The recommendation experience should not replace outfit-selection effort with a lengthy form or conversation.

Only context that materially improves the recommendation should be requested.

### Prefer practicality over novelty

A wearable and appropriate recommendation is more valuable than an unusually creative one.

### Explain the result

The user should understand why the selected items suit the occasion, conditions and stated preferences.

### Represent uncertainty honestly

When the wardrobe lacks appropriate clothing or important context is missing, the product should communicate this rather than fabricate a confident answer.

### Keep the experiment contained

V2 should test one focused recommendation workflow rather than attempt to build a comprehensive autonomous personal stylist.

---

## Success Signals

### Existing workflow

* Users understand what “Wear this” does
* The selected or worn state remains visible
* Users can add a clothing photo directly from their device
* Users can recognise saved items from the wardrobe view

### Recommendation quality

* Every recommended item exists in the user’s wardrobe
* Recommendations suit the stated occasion
* Explicit constraints are respected
* The selected items form a coherent outfit
* The explanation is consistent with the selected items
* The system handles insufficient wardrobe options appropriately

### User value

* Users understand the recommendation
* Users would consider wearing it
* Users would consider saving it
* Users report that it reduces the effort required to choose an outfit
* Recommendation helpfulness improves on the MVP’s **3.0/5** baseline

Detailed criteria and test cases will be defined in the V2 evaluation plan before implementation.

---

## Key Risks

### The solution is not yet validated

The MVP identified usability issues and moderate helpfulness, but participants did not directly validate demand for AI recommendations.

### Insufficient wardrobe data

Recommendations may be poor because the user has not added enough suitable clothing.

### Hallucinated or incorrect items

The model may recommend garments that were not provided or misrepresent an existing item.

### Subjective recommendation quality

Different users may reasonably disagree about whether an outfit is coherent or suitable.

### Excessive input effort

Requesting too much context may undermine the goal of reducing decision fatigue.

### Scope expansion

Weather services, image recognition, conversational memory and agent behaviour could expand the iteration beyond what is needed to test the central hypothesis.

---

## Out of Scope

The initial V2 experiment will not include:

* Autonomous multi-step agents
* Long-term conversational memory
* Fine-tuning
* Automatic garment recognition
* Automatic clothing classification
* Background removal or advanced image editing
* Multiple photos per garment
* Shopping recommendations
* Recommendations containing clothing the user does not own
* Calendar integration
* Social sharing
* User accounts or cloud synchronisation
* Production-scale personalisation
* A complete digital stylist covering every clothing decision

---

## Next Step

Create a V2 PRD defining:

1. The corrected “Wear this” behaviour
2. The minimum photo-upload workflow
3. The outfit-recommendation user journey
4. Functional and non-functional requirements
5. The wardrobe information supplied to the model
6. The expected structured recommendation output
7. Loading, failure and insufficient-wardrobe states
8. Scope exclusions
9. Product and AI-quality success criteria

An initial evaluation plan should then be created before implementation begins.

---

## Summary

The MVP demonstrated that users could understand Wardrobe Manager, add clothing and create outfits quickly.

However, perceived helpfulness averaged only **3.0/5**. Five of six participants were unclear about the outcome of “Wear this”, while four of six independently requested clothing photos.

V2 will respond by:

1. Correcting the ambiguous “Wear this” interaction
2. Adding a narrow direct photo-upload experience
3. Testing whether context-aware recommendations grounded in the user’s wardrobe can reduce more of the effort involved in deciding what to wear

The MVP evidence supports improving the current experience.

It does not yet prove that AI is the answer.

V2 will test that proposition.
