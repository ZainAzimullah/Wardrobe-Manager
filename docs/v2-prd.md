# Wardrobe Manager V2 — Product Requirements Document

**Status:** Draft  
**Iteration:** V2  
**Primary experiment:** Context-aware outfit recommendations  
**Supporting work:** Direct photo upload and clearer “Wear this” feedback

---

## 1. Overview

Wardrobe Manager helps working professionals catalogue clothing, create outfits and save combinations for reuse.

The MVP validated that first-time users could understand and complete the core workflow:

> **Add clothes → Create outfit → Save outfit → Reuse outfit**

However, MVP testing also identified two clear usability gaps:

- Five of six participants were unclear about what happened after selecting “Wear this”.
- Four of six participants independently requested clothing photos because text descriptions made garments difficult to recognise.

Although the core workflow was completed successfully, average helpfulness was only **3.0/5**. The MVP therefore demonstrated usability, but did not yet strongly validate that the product meaningfully reduced outfit decision effort.

V2 will:

1. Clarify the existing “Wear this” interaction.
2. Introduce a minimal direct photo-upload workflow.
3. Test whether an AI-generated recommendation grounded in the user’s wardrobe can provide more direct outfit decision support.

See the [V2 Opportunity Brief](./v2-opportunity-brief.md) and [MVP Findings and Recommendations](./findings-and-recommendations.md) for the supporting research and opportunity framing.

---

## 2. Objective

The primary objective of V2 is to test whether Wardrobe Manager can help a user reach a suitable outfit decision, rather than only helping them manually record one.

The initial AI experience will:

> Given an occasion, manually supplied weather context, optional preferences or constraints, and the user’s saved wardrobe data, recommend one outfit using only available wardrobe items and briefly explain why it is suitable.

The purpose of the iteration is not merely to demonstrate an LLM integration.

V2 should establish whether the recommendation is:

- Grounded in real wardrobe items
- Appropriate for the supplied context
- Coherent as an outfit
- Understandable
- More helpful than beginning with a blank outfit builder

---

## 3. Target User

The target user is:

> A working professional who owns a moderate wardrobe, wants to look put-together and does not want to spend unnecessary time deciding what to wear.

The user may:

- Own enough clothing that choosing between combinations requires effort
- Care about occasion, weather, comfort and formality
- Prefer practical recommendations over experimental styling
- Want to use clothing they already own
- Reuse combinations that have worked previously
- Value a quick and understandable recommendation

---

## 4. Job to Be Done

> When I need to get dressed for a particular situation, help me choose a suitable outfit from the clothing I already own so that I can feel confident without spending too much time comparing different combinations.

---

## 5. Product Hypothesis

> We believe that providing one context-aware outfit recommendation grounded in the user’s saved wardrobe will reduce the effort required to decide what to wear.

We will consider the hypothesis promising when recommendations:

- Use only available wardrobe items
- Suit the stated occasion and context
- Respect explicit constraints
- Form a coherent combination
- Include a clear explanation
- Are suitable enough that users would consider wearing or saving them
- Require less perceived effort than manually beginning from a blank outfit builder

AI outfit assistance was not directly validated by the MVP research. It is a new solution hypothesis that V2 must evaluate.

---

## 6. Scope

V2 contains three connected workstreams.

### Workstream A — Clarify “Wear this”

Improve the existing “Wear this” interaction so that selecting it produces a clear and persistent outcome.

This is a targeted usability correction based on direct MVP feedback.

### Workstream B — Direct photo upload

Allow users to select a clothing photo directly from their device and associate it with a wardrobe item.

This is an enabling improvement that makes clothing easier to recognise in both the wardrobe and recommendation result.

### Workstream C — AI outfit recommendation

Allow users to provide relevant context and receive one outfit recommendation using items from their saved wardrobe.

This is the primary V2 experiment and should receive the majority of the evaluation effort.

---

## 7. Experiment Definition

### User input

The initial recommendation experience will request:

| Input | Field | Requirement | Description |
|---|---|---|---|
| Occasion | `occasion` | Required | The situation the user is dressing for, such as an office day, casual weekend or dinner |
| Weather context | `weather` | Optional | Manually supplied conditions such as cold, warm, raining or windy |
| Preferences or constraints | `preferences` | Optional | Additional natural-language guidance such as “I will be walking a lot” or “avoid suede” |

The optional free-text request field is named `preferences` throughout. It is distinct from `details`, which describes a saved wardrobe item.

Weather will be supplied manually in the first version.

An external weather service is not required for the initial experiment.

### Wardrobe data supplied to the model

The model should receive a structured list of eligible wardrobe items.

Each item should include, where available:

- Persistent item identifier
- Item name
- Clothing type or category
- Colour
- `details` — an optional free-text description of the garment

`details` is a new optional wardrobe field introduced in V2. It captures descriptive information the existing model cannot express — material, warmth, fit, formality and specific shade — for example “merino wool, warm, smart-casual”.

It is supplied by the user when adding an item, is never required, and is the only additional garment information sent to the model.

The application should send only information required to produce the recommendation.

Uploaded clothing images will be displayed to the user, but will **not** be analysed by or sent to the model in the initial version. Automatic image understanding is out of scope.

### Recommendation output

The initial response should contain:

- One selected top
- One selected bottom
- The persistent identifier of each selected item
- A short explanation of why the combination suits the supplied context

The recommendation must use the existing top-and-bottom structure supported by the MVP.

Footwear, outerwear, accessories and additional outfit layers are outside the initial recommendation scope.

### First-version boundaries

The initial experience will provide:

- One recommendation per request
- No follow-up conversation
- No long-term memory
- No automatic weather retrieval
- No image recognition
- No shopping recommendations
- No autonomous agent workflow
- No alternative outfits in the same response

The user may submit a new request if they want another recommendation.

---

## 8. User Experience

### 8.1 Add a wardrobe item with a photo

1. The user opens the existing add-item flow.
2. The user enters the required clothing information.
3. The user selects an image from their device.
4. The application shows a preview.
5. The user saves the item.
6. The item appears in the wardrobe with its image.

A clothing photo should be optional unless implementation constraints make it necessary.

Existing wardrobe items without photos must continue to function.

### 8.2 Request an outfit recommendation

1. The user opens the recommendation experience.
2. The application confirms that the wardrobe contains at least one eligible top and one eligible bottom.
3. The user enters an occasion.
4. The user may provide weather context.
5. The user may provide additional preferences or constraints.
6. The user submits the request.
7. The application sends structured wardrobe and request data to the model.
8. The application validates the model response.
9. The user sees the selected wardrobe items and explanation.
10. The user may save the recommendation using the existing outfit flow.

### 8.3 Mark an outfit as worn

1. The user opens a saved outfit.
2. The user selects “Wear this”.
3. The application immediately confirms the action.
4. The outfit receives a visible and persistent worn state.
5. The user can see when the outfit was marked as worn.

The exact presentation may be refined during design, but the result must be observable and persistent.

---

## 9. Functional Requirements

## 9.1 “Wear this” requirements

### WT-1: Immediate confirmation

When the user selects “Wear this”, the application must show an immediate confirmation that the action succeeded.

### WT-2: Persistent state

The application must store a visible indication that the outfit was marked as worn.

### WT-3: Date visibility

The interface should display the date associated with the most recent “Wear this” action.

### WT-4: Repeat behaviour

If the user marks the same outfit as worn again, the application must overwrite the stored date with the latest one.

V2 records only the most recent wear (`lastWornAt`). A wear count and a full wear history are deliberately out of scope.

### WT-5: Failure feedback

If the action cannot be saved, the user must see a clear error and be able to retry.

---

## 9.2 Photo-upload requirements

### PU-1: Device selection

The user must be able to select one image from their device.

### PU-2: Image preview

The application must show a preview before the wardrobe item is saved.

### PU-3: One image per item

The initial version will support a maximum of one image per wardrobe item.

### PU-4: Supported formats

The application must accept any still-image format the browser can decode, which covers the common mobile formats.

Selected images are re-encoded as JPEG during processing, so the stored format is normalised regardless of what the user supplied.

### PU-5: File validation

The application must reject files it cannot decode as an image, and files above the accepted source size, with a clear explanation.

The maximum accepted source image is **10 MB**. Files above this are rejected before decoding, so an oversized image never reaches the downscaling step.

Accepted images are then downscaled to a maximum edge of 512 pixels at JPEG quality 0.7 before being stored.

Because images are held in browser storage, total wardrobe capacity is bounded. This is treated as an accepted prototype limitation rather than a guaranteed number of items, and the application must fail clearly when storage is exhausted.

### PU-6: Photo states

Photo selection is processed on the device rather than uploaded to a server. The interface must therefore provide:

- Processing state
- Preview-ready state
- Error state
- Retry path

### PU-7: Wardrobe display

The saved image must be visible wherever the wardrobe item is displayed in the primary wardrobe-browsing experience.

### PU-8: Backwards compatibility

Wardrobe items without an image must continue to display using an appropriate fallback.

### PU-9: No image intelligence

The application will not automatically identify, classify, describe or remove the background from the uploaded garment.

---

## 9.3 Recommendation-input requirements

### RI-1: Occasion

The user must provide an occasion before requesting a recommendation.

The interface will offer suggested occasion chips alongside a free-text field. Chips make the common cases fast and keep evaluation inputs consistent; free text preserves situations the chips do not cover.

The initial chip set is:

- Office day
- Presentation
- Client dinner
- Smart-casual event
- Casual outing
- Coffee or catch-up

Free-text occasion entry must remain available at all times. Selecting a chip must not disable or replace it.

### RI-2: Weather context

The user may manually provide weather information.

Automatic weather retrieval is not required.

### RI-3: Additional context

The user may provide optional natural-language preferences or constraints in the `preferences` field.

### RI-4: Minimum wardrobe

The recommendation flow must require at least:

- One eligible top
- One eligible bottom

If the minimum wardrobe is not available, the application must explain what the user needs to add.

### RI-5: Input validation

The application must prevent empty or invalid recommendation requests.

The following limits apply and are enforced on the server as well as in the interface:

| Input | Limit |
|---|---|
| `occasion` | Required, 1–120 characters |
| `weather` | Optional, up to 80 characters |
| `preferences` | Optional, up to 300 characters |
| `details` (per wardrobe item) | Optional, up to 200 characters |
| Wardrobe items sent per request | 2–60, including at least one top and one bottom |

These bound the cost and size of any single request and are the primary mitigation for the unthrottled endpoint described in §13.

### RI-6: Submission state

After submission, the application must show a loading state and prevent accidental duplicate requests.

---

## 9.4 Recommendation-generation requirements

### RG-1: Structured wardrobe context

The model must receive eligible wardrobe items in a structured format.

### RG-2: Persistent identifiers

Every wardrobe item supplied to the model must include a persistent identifier.

### RG-3: Grounded selection

The model must select only identifiers included in the supplied wardrobe data.

### RG-4: Category validity

The initial recommendation must contain:

- Exactly one valid top
- Exactly one valid bottom

### RG-5: Context adherence

The recommendation should account for:

- Occasion
- Weather when supplied
- Explicit user preferences
- Explicit user constraints

### RG-6: Concise explanation

The model must return a short, practical explanation of why the items work together and suit the context.

### RG-7: Structured response

The model response must use a predictable structured format that the application can validate before displaying it.

The technical plan will define the exact schema.

### RG-8: No suitable recommendation

The model must be able to indicate that no suitable outfit can be produced from the available wardrobe.

It must not invent additional clothing to complete the outfit.

### RG-9: Response validation

The application must validate that:

- Returned identifiers exist
- Returned identifiers were included in the request
- One item is a top
- One item is a bottom
- Required response fields are present

### RG-10: Invalid-response handling

If the model response fails validation, the application must not display the invalid recommendation as successful.

The application will attempt **one** controlled retry, and only when the response was received but failed structural or semantic validation — for example a malformed payload, an unknown identifier or a category mismatch.

It must **not** retry:

- Invalid or rejected requests
- Authentication or configuration failures
- Ordinary provider errors and timeouts

If the retry also fails validation, the application must show an error and allow the user to submit a new request.

---

## 9.5 Recommendation-display requirements

### RD-1: Display selected items

The result must show the selected top and bottom using existing wardrobe data.

Where available, the result should display:

- Clothing image
- Item name
- Category
- Colour

### RD-2: Display explanation

The result must include the model’s explanation.

### RD-3: Preserve source-of-truth data

The interface must render item details from the application’s wardrobe records rather than trusting descriptive text returned by the model.

### RD-4: Save recommendation

The user should be able to save the recommended combination as an outfit by reusing the existing outfit-saving behaviour.

This requirement may be deferred only if the existing architecture makes it disproportionately expensive for the first slice.

### RD-5: New recommendation

The user must be able to return to the form and submit another request.

### RD-6: Honest no-match state

When no suitable recommendation is available, the interface must explain this without presenting invented or unsuitable clothing.

---

## 10. AI Behaviour and Guardrails

The AI assistant must:

- Select only from the wardrobe items supplied
- Use persistent identifiers rather than relying on names alone
- Respect explicit negative constraints
- Avoid suggesting clothing purchases
- Avoid claiming that unavailable garments exist
- Avoid presenting subjective fashion advice as objective fact
- Keep the explanation concise and practical
- Acknowledge when the wardrobe cannot satisfy the request
- Avoid unrelated advice or extended conversation

The assistant should prioritise requirements in this order:

1. Use only available wardrobe items
2. Respect explicit user constraints
3. Suit the occasion
4. Suit the supplied weather context
5. Produce a coherent combination
6. Explain the recommendation clearly

Hard constraints must take priority over creative variety.

---

## 11. User Stories

### Existing workflow

- As a user, I want clear feedback after selecting “Wear this” so that I know what the action did.
- As a user, I want to see when an outfit was last marked as worn so that the state is meaningful when I return.

### Photo upload

- As a user, I want to add a photo directly from my device so that my wardrobe is not limited to text descriptions.
- As a user, I want to preview the photo before saving so that I know I selected the correct image.
- As a user, I want to recognise garments visually when browsing my wardrobe.

### AI recommendation

- As a user, I want to describe what I am dressing for so that I receive a relevant outfit.
- As a user, I want the recommendation to use clothing I already own.
- As a user, I want the assistant to respect practical constraints such as weather or walking.
- As a user, I want a brief explanation so that I understand why the combination was selected.
- As a user, I want the system to tell me when my wardrobe lacks suitable options rather than inventing an answer.
- As a user, I want to save a useful recommendation so that I can reuse it later.

---

## 12. Experience States

The recommendation experience must account for the following states.

### Default

The form is available and the user can enter context.

### Insufficient wardrobe

The user does not have at least one eligible top and one eligible bottom.

The application should direct them to add the missing type of item.

### Loading

The request has been submitted and the model response is pending.

The interface should communicate that a recommendation is being prepared.

### Success

A validated recommendation is displayed using existing wardrobe records.

### No suitable outfit

The wardrobe contains the required categories, but no combination sufficiently satisfies the request.

### Invalid model response

The response cannot be parsed or contains invalid item identifiers.

### Service failure

The model provider or application request fails.

### Upload failure

A clothing image cannot be validated, uploaded or saved.

Each failure state must provide a clear next action where recovery is possible.

---

## 13. Non-Functional Requirements

### Security

- Model API credentials must not be exposed in client-side code.
- Image selection must validate that the file is a decodable image and within the accepted size.
- User-supplied text must be handled safely.
- Model responses must be treated as untrusted input and validated.
- The model request must enforce strict input, request-body and timeout limits.

V2 will not implement request throttling. The recommendation endpoint is publicly reachable, so abuse of the deployed prototype is an accepted and documented limitation rather than a solved problem. Strict input, body-size and timeout limits bound the cost of any single request.

### Privacy and data minimisation

- Only wardrobe data required for the recommendation should be sent to the model.
- Clothing images should not be sent to the model in V2.
- The application should avoid including unnecessary personal information in model requests.

### Reliability

- Invalid model output must not break the recommendation interface.
- Failed uploads or recommendations must not corrupt wardrobe data.
- Existing MVP functionality must continue to work.

### Performance

- A loading state must appear immediately after submission.
- The target is for recommendations to return within approximately 10 seconds under normal prototype conditions.
- Long-running or failed requests must time out and provide recoverable feedback.

### Accessibility

- Form inputs must have clear labels.
- Upload, loading, success and error states must not rely only on colour.
- Clothing images must include appropriate text alternatives derived from wardrobe metadata.
- Recommendation results must be understandable without relying solely on images.

### Maintainability

- The implementation should follow existing repository conventions.
- V2 should avoid unrelated refactoring.
- AI-provider-specific code should be isolated sufficiently to support testing and future replacement.

---

## 14. Analytics and Instrumentation

The following events should be considered for V2:

| Event | Purpose |
|---|---|
| `photo_upload_started` | Measure attempts to add a photo |
| `photo_upload_completed` | Measure successful uploads |
| `photo_upload_failed` | Identify upload failure frequency |
| `recommendation_viewed` | Measure entry into the AI experience |
| `recommendation_requested` | Measure submitted requests |
| `recommendation_succeeded` | Measure validated recommendations |
| `recommendation_no_match` | Measure insufficient wardrobe outcomes |
| `recommendation_failed` | Measure service or validation failures |
| `recommendation_saved` | Measure whether users value a result enough to retain it |
| `outfit_worn` | Preserve the existing core-loop event |
| `outfit_worn_confirmed` | Measure successful visible loop closure |

Analytics must not include full free-text user inputs or sensitive model prompts unless there is a clear, documented need.

---

## 15. Success Criteria

V2 success will be assessed across usability, technical validity, AI quality and user value.

### 15.1 Existing-flow success

- Users understand the result of selecting “Wear this”.
- The worn state remains visible after navigation or refresh.
- Users can add a clothing photo directly from their device.
- Saved images remain associated with the correct wardrobe item.
- Existing items without photos continue to work.

### 15.2 Technical recommendation success

Across the defined evaluation set:

- 100% of displayed recommendations use valid wardrobe item identifiers.
- 100% of displayed recommendations contain one valid top and one valid bottom.
- Invalid model responses are blocked or handled safely.
- No displayed recommendation invents an unavailable item.
- The application handles service and no-match states without breaking.

### 15.3 AI-quality success

Across the initial scenario-based evaluation set:

- At least 80% of recommendations satisfy all explicit hard constraints.
- Average occasion-suitability rating is at least 4/5.
- Average outfit-coherence rating is at least 4/5.
- Average explanation-quality rating is at least 4/5.
- The system responds appropriately when the wardrobe cannot satisfy the request.

These thresholds may be refined in the V2 evaluation plan before implementation.

### 15.4 User-value success

In a small user evaluation:

- Average recommendation helpfulness exceeds the MVP baseline of **3.0/5**.
- A majority of participants would consider wearing the recommendation.
- A majority report that the recommendation reduced the effort required to choose an outfit.
- Participants understand that the recommendation uses clothing from their saved wardrobe.
- No critical trust issue emerges from invented items or ignored constraints.

Because the sample will be small, these results should be interpreted as directional rather than statistically conclusive.

---

## 16. Evaluation Plan

A separate V2 evaluation plan will be created before implementation.

It should include approximately 10–15 predefined scenarios covering:

- Different occasions
- Different weather conditions
- Positive preferences
- Negative constraints
- Limited wardrobe options
- Conflicting requirements
- Requests for which no suitable outfit exists

Each result should be assessed against:

- Wardrobe grounding
- Category validity
- Constraint adherence
- Occasion suitability
- Outfit coherence
- Explanation quality
- Appropriate no-match handling

The evaluation should record:

- Model and configuration
- Prompt or instruction version
- Structured input
- Structured output
- Validation outcome
- Human evaluation score
- Failure pattern
- Product or prompt change made in response

Formal AI-quality evaluation should focus on the recommendation workstream.

The “Wear this” and photo-upload workstreams require functional testing and lightweight usability checks rather than separate full research cycles.

---

## 17. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Users did not directly request AI recommendations | Treat the feature as an experiment and evaluate user value |
| Model invents clothing | Require item identifiers and validate all returned IDs |
| Model ignores constraints | Include scenario-based constraint testing and strengthen instructions |
| Wardrobe lacks suitable options | Support an explicit no-match response |
| Recommendation quality is subjective | Use a consistent rubric alongside user judgement |
| Inputs require too much effort | Keep occasion required and other context optional |
| Photos expand into an image-AI project | Do not send images to the model or perform image recognition |
| Weather integration expands scope | Use manually supplied weather context |
| AI work becomes an agent project | Use one bounded model request with structured output |
| V2 becomes too large | Build and test each workstream as a narrow vertical slice |
| AI output appears correct but is generic | Evaluate relevance, coherence and wardrobe specificity |
| Existing MVP functionality regresses | Add regression checks for existing wardrobe and outfit flows |

---

## 18. Dependencies

V2 depends on:

- The existing wardrobe item data model
- The existing outfit-creation and saving flow
- A method for storing and retrieving uploaded images
- A secure server-side boundary for model requests
- A model capable of returning structured output
- Application-side schema and identifier validation
- A test wardrobe containing enough items for scenario evaluation

The choice of image storage, model provider and exact backend architecture will be made during technical planning.

---

## 19. Implementation Sequence

The recommended implementation order is:

### Slice 1 — “Wear this” loop closure

- Add immediate confirmation
- Persist visible worn state
- Display the relevant date
- Test repeat and failure behaviour

### Slice 2 — Direct photo upload

- Select an image
- Preview it
- Validate it
- Store it
- Associate it with a wardrobe item
- Display it in the wardrobe
- Support items without images

### Slice 3 — Recommendation request and mock result

- Create the context form
- Validate the minimum wardrobe
- Define the structured input and output contracts
- Display a recommendation using mocked structured data

### Slice 4 — Model integration

- Add the secure model request
- Supply structured wardrobe context
- Parse the structured response
- Validate returned identifiers
- Handle failures and no-match responses

### Slice 5 — Save and evaluate

- Connect a valid recommendation to the existing save-outfit flow
- Add analytics
- Run the predefined evaluation set
- Address the most important failure patterns

---

## 20. Out of Scope

The initial V2 release will not include:

- Autonomous or multi-step agents
- Tool-calling workflows
- Long-term conversational memory
- Follow-up recommendation conversations
- Fine-tuning
- Retrieval-augmented generation
- Automatic weather retrieval
- Automatic garment recognition
- Image-based styling analysis
- Background removal
- Automatic clothing classification
- Multiple images per wardrobe item
- Footwear, outerwear or accessory recommendations
- Multiple recommendation alternatives
- Shopping or purchase recommendations
- Recommendations containing clothing the user does not own
- Calendar integration
- Social features
- User accounts
- Cloud synchronisation across users
- Production-scale personalisation
- A complete autonomous digital stylist

---

## 21. Resolved Technical Decisions

The decisions below were open when this PRD was drafted. They have since been resolved against the existing repository and are specified in the [V2 Technical Plan](./v2-technical-plan.md):

- Where images should be stored
- How image references should be represented in the existing data model
- Where the server-side model request should run
- Which model and SDK should be used
- The exact structured input and output schemas
- Whether one controlled retry should occur after invalid model output
- How model requests should be mocked in automated tests
- Whether the existing save-outfit flow can be reused without significant changes
- Which current components can support the new interfaces
- Whether any existing fields or categories need migration

These were technical implementation decisions rather than unresolved product-strategy questions. The technical plan is the source of truth for how each was answered.

---

## 22. Release Criteria

V2 will be ready for evaluation when:

- “Wear this” produces a visible and persistent result.
- A user can add and view one photo per wardrobe item.
- Existing items without photos continue to work.
- A user can enter an occasion and optional context.
- The application can produce one validated top-and-bottom recommendation.
- Every displayed item maps to an existing wardrobe record.
- The result includes a concise explanation.
- The no-match, loading and failure states are implemented.
- Model credentials are protected.
- The predefined evaluation scenarios can be run consistently.
- Critical failures identified during evaluation have been addressed.
- The README accurately describes what was built and what remains unproven.

---

## 23. Summary

Wardrobe Manager V2 will improve the existing product in three stages:

1. Clarify the outcome of “Wear this”.
2. Make wardrobe items easier to recognise through direct photo upload.
3. Test whether one grounded, context-aware outfit recommendation can reduce the effort required to decide what to wear.

The AI feature will use structured wardrobe metadata rather than image analysis.

The initial experiment will produce one top-and-bottom recommendation using only saved items. It will not use agents, memory, automatic weather, shopping suggestions or conversational refinement.

The central question for V2 is:

> Can Wardrobe Manager provide a recommendation that is grounded, contextually suitable and useful enough to help the user reach an outfit decision more easily?

The evaluation plan will define how that question is tested before implementation begins.
