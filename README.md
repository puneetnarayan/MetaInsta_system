# AI Ads Studio

AI-assisted Facebook + Instagram campaign creator built with plain HTML, CSS and JavaScript.

## Current V1

- Campaign Brief form
- Demo Mode strategy generation (₹0, local, no API calls)
- **AI Control panel**: an AI Master Switch plus five independent per-stage switches (Strategy, Ad Copy, Creative Concepts, AI Images, Reel Scripts), a Text Provider (OpenAI or Anthropic) with model selector, and separate Image Provider/Model/Quality/Aspect Ratio controls
- **Audience tab**: primary customer, demographics, awareness level and buying intent inputs, a ₹0 local audience plan (primary audience, pain, motivation, awareness guidance, message, audience-strategy options) and an editable Audience/Angle/Creative/Purpose testing matrix
- **Offer tab**: product/price/bonuses/guarantee/proof/scarcity/CTA inputs, a ₹0 heuristic offer analysis (✓/⚠ per clarity, value proposition, risk reversal, proof, urgency, CTA) and three offer variants (current, outcome-focused, bonus-focused)
- **Campaign tab**: a ₹0 local Campaign → Ad Set → Ad structure builder with an editable naming convention (`SM_<Objective>_<Country>_<Age>_<MonYY>`, `AS_<Strategy>_<Country>_<Age>`, `AD_<Angle>_Hook##`), generated from the Audience strategies and existing Ad Copy — a planning layer only, it never creates anything in Meta Ads Manager
- Ad copy variations with live Meta character-count guidance (primary text / headline / description)
- Creative concepts, with inline (non-blocking) editing, and optional manually-triggered AI image generation per concept
- **Creative Matrix** (within Creative Ideas): an editable Angle × Format planning table (Angle/Format/Hook/Visual/CTA), selecting from 15 reusable angles (Problem, Outcome, Question, Story, Objection, Myth, Education, Proof, Testimonial, Comparison, Before/After, Demonstration, FAQ, Urgency, Offer), generated locally at ₹0 and additive to the existing format cards
- **AI Image Factory** (within Creative Ideas): select which creative concepts to generate images for, generate a structured, editable prompt per concept at ₹0 (Subject, Setting, Emotion, Composition, Lighting, Brand context, Text-overlay guidance, Aspect ratio, Negative guidance), review/edit every field with a live prompt preview, and only then trigger AI image generation from the reviewed prompts — see below
- **Reel scripts**: each reel has a Title, Hook, Angle (Problem-led / Outcome-led / Question / Story / Educational / Objection / Testimonial), Duration (15/30/45/60s), timed Scenes, Voiceover, On-Screen Text, Camera Direction, B-Roll, CTA and a ready-to-post Caption — all editable, with a one-click Copy Script per reel
- **Reel Factory** (within Reel Scripts): select one or more reel scripts → generate a ₹0, fully-local, beat-by-beat shot list (Hook / Problem / Turn / Solution / CTA), each beat with editable Time, Visual Direction, Voiceover/Caption, On-Screen Text and Sound/Music fields, plus a Copy Shot List action per reel
- **Landing Page** tab: analyses the campaign's destination URL at ₹0 — server-side fetch (avoids browser CORS), heuristic checks (Headline/Subheadline/Offer/CTA/Proof/Benefits/Objections/Trust/Form/Mobile usability) drawn only from signals actually found on the page, a Message Match comparison against the selected Ad Copy, and a manual paste-the-text fallback when a page can't be fetched — see below
- **Launch Checklist** tab: an editable, ₹0 checklist across four sections (Pre-launch, Campaign, Ads, Final — 31 items total, matching Meta's real pre-flight steps), each with a per-section completion count, saved with the campaign — nothing here is auto-verified, it's a manual sign-off
- Save, duplicate, load and delete campaigns in browser localStorage (including AI settings and usage)
- New Campaign / Clear workflow with an inline confirmation (no blocking browser dialogs)
- JSON and text export (including AI configuration and usage, never secrets)
- Responsive desktop/mobile layout
- Basic accessibility: ARIA tab roles, live status region
- Vercel-ready static deployment
- Unit tests for the campaign-generation logic (`npm test`)

## AI Control: ₹0 by default, AI only where you choose

The generator is a local, deterministic placeholder (₹0 Mode) unless you explicitly turn AI on. Nothing calls an external API or exposes a key in the browser by default.

The Campaign Brief tab has an **AI Control** panel:

- **AI Master Switch** — must be on for any stage's AI switch to take effect.
- **Per-stage switches** — Strategy AI, Ad Copy AI, Creative Concepts AI, AI Images, Reel Scripts AI. Each is fully independent: turning one on never affects the others, and `Generate Campaign` always computes the ₹0 built-in result for every stage first, then overwrites only the stages whose AI switch is on.
- **Text Provider / Text Model** — OpenAI (`gpt-5.6-luna`) or Anthropic (`claude-sonnet-5`), used for Strategy/Ad Copy/Creative Concepts/Reel Scripts.
- **Image Provider / Image Model / Image Quality** — OpenAI only for now (`gpt-image-1.5`, Low/Medium/High).
- **AI Images Only** preset — one click sets Master ON, AI Images ON, and every text stage OFF.
- **Estimated campaign AI cost** — computed from `AI_COST_CONFIG` (approximate, sourced provider pricing) and planning token assumptions, always labeled as an ESTIMATE, never a live bill.
- **AI Usage** (collapsible) — actual token counts and cost per stage once generated, using the provider's own returned usage figures where available.

**AI Images are never generated automatically.** Turning the AI Images switch on only enables the **Generate AI Images** button in the AI Image Factory (Creative Ideas tab), which shows its own estimated cost and must be clicked deliberately.

If an AI call fails for any reason (missing server-side API key, provider error, network issue), that one stage falls back to its ₹0 built-in result with a clear status message — no panel is ever left blank, and no other stage is affected.

`api/generate.js` is the single serverless endpoint for all of this. It accepts `{ stage, provider, model, brief, creativeConcepts, quality, aspectRatio }`, reads `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` from Vercel's server-side environment variables (never sent to or stored in the browser), and returns only the generated content plus usage — never a key. ChatGPT Go and Claude Pro are consumer subscriptions and are unrelated to this — AI Control always uses the OpenAI API / Anthropic API billed to whichever server-side key is configured.

### AI Image Factory (Creative Ideas tab)

Generating an image is a deliberate, four-step, always-reviewable flow — nothing is sent to an image API until step 2 is clicked, and nothing is generated as an image until step 4:

1. **Select concepts** — check which of the existing creative concepts (from Creative Ideas / the Creative Matrix) you want an image for.
2. **Generate Prompts — ₹0** — builds one structured, editable prompt per selected concept, entirely locally: `Subject`, `Setting` and `Composition` are derived per concept from its format (Single Image Ad / Carousel / Instagram Story / Instagram Reel) and the campaign brief; `Emotion`, `Lighting`, `Brand context`, `Text-overlay guidance`, `Aspect ratio` and `Negative guidance` are shared fields you fill in once and apply to every selected concept.
3. **Review / edit** — every field on every prompt card is a plain editable text input, with a live prompt-text preview underneath that updates as you type — this is exactly the text that will be sent if you continue.
4. **Generate AI Images** — only enabled once AI Images is switched on; sends the reviewed prompt text (not a prompt rebuilt from scratch) for each selected concept to `api/generate.js`, which passes it straight to the image API. The cost estimate updates to reflect the number of prompts actually selected/generated, not a fixed count.

Per the roadmap's own guidance: **do not rely on generated images for readable text** — the default Text-overlay guidance field tells the model not to render text, and final text overlays belong in the app / ad creative tool, not baked into the image.

### Reel Scripts (Reel Scripts tab)

Each reel carries: Title, Hook, Angle, Duration, timed Scenes, Voiceover, On-Screen Text, Camera Direction, B-Roll, CTA and Caption — all editable inline, with a per-reel Copy Script that includes every field. Reel Scripts AI (when on) also produces this full shape; older saved reels with only `{title, hook, scenes}` are normalised with sensible defaults (Problem-led angle, 30s duration, empty text fields) rather than breaking.

### Reel Factory (Reel Scripts tab)

An additive, always-₹0 tool on top of the reel scripts above — turns a reel into a production-ready shot list, entirely local, no AI involved:

1. **Select reels** — check which reel script(s) to build a shot list for.
2. **Generate Shot List — ₹0** — derives a standard 5-beat structure (Hook / Problem / Turn / Solution / CTA) from the reel's hook and the campaign brief, each beat with a suggested Time range, Visual Direction, Voiceover/Caption, On-Screen Text and Sound/Music cue.
3. **Review / edit** — every field on every beat is a plain editable textarea; edits are kept in `state.reelFactory` and included in Save/Export.
4. **Copy Shot List** — copies the full beat-by-beat breakdown for one reel to the clipboard, ready to hand to an editor or use as a filming brief.

### Landing Page Intelligence (Landing Page tab)

Always ₹0 — this never calls an AI provider, only (optionally) fetches the page itself:

1. **Analyse Landing Page** — `api/fetch-landing-page.js` fetches the URL server-side (dependency-free regex extraction, no HTML parser library), capped at an 8-second timeout and ~600KB of response body, and returns only what it can actually find: `<title>`, meta description, `<h1>`/`<h2>` text, button/link text, list-item count, and whether a `<form>` tag and a responsive viewport `<meta>` tag are present.
2. **Heuristic checks** — Headline, Subheadline, Offer, CTA, Proof, Benefits, Objections, Trust, Form and Mobile usability are each marked ✓ or ⚠ from those real signals (e.g. a price/currency pattern for Offer, testimonial/review language for Proof, FAQ/guarantee language for Objections). Nothing about the page is invented — a check that can't be determined is shown as *not checked* rather than a false ⚠.
3. **If the fetch fails** (network error, timeout, non-HTML response, CORS-restricted target, etc.) the UI clearly says so and reveals a **paste the page text** fallback; the same heuristic checks then run against the pasted text, except Form and Mobile usability, which require the live page's markup and are explicitly marked *not checked* rather than guessed.
4. **Message Match** — compares the selected Ad Copy's hook, product/offer name and CTA against the landing page's headline/text using simple keyword overlap, and reports each as a testable observation ("this may be a mismatch — verify manually"), never a definitive claim.

### Launch Checklist (Launch Checklist tab)

Four sections, matching Meta's actual pre-flight steps, each rendered as a plain checkbox list with a live "N / total complete" count:

- **Pre-launch** (11 items) — Business Manager, ad account, payment method, Facebook Page, Instagram, tracking, domain, conversion event, landing page tested, mobile page tested, UTM parameters.
- **Campaign** (7 items) — objective, budget, campaign name, ad set structure, audience, placements, optimisation.
- **Ads** (7 items) — primary text, headline, description, CTA, image/video, destination URL, tracking.
- **Final** (6 items) — preview, links tested, mobile preview, policy-sensitive wording checked, tracking checked, ready to publish.

Checking an item only records that *you* confirmed it — nothing is verified automatically, and the checklist state is saved and loaded with the rest of the campaign (including in Save/Load/Duplicate and JSON/text export).

## Tests

The template logic used by Demo Mode lives in `js/campaign-generator.js` (a plain, dependency-free module usable from both the browser and Node). Run the test suite with:

```
npm test
```

## Planned next stages

Following the Meta Ads Campaign Operating System roadmap:

1. Performance Analyzer (Phase 10)
2. Campaign Doctor + Optimisation (Phase 11)
3. Prompt Library (Phase 12)
4. 90-Day Plan (Phase 13)
6. Direct Meta Ads API integration (explicitly out of scope for this roadmap; left as an architectural option for later)

## Deployment

This is a static Vercel application. No build step is required.

Target deployment URL:
https://meta-insta-system-git-main-puneetnarayan.vercel.app/


## Reference Campaign

The complete reference input, strategy, ad copy, creative concepts and reel scripts are maintained as data files under `reference/`, separate from the application code:

- [Reference Campaign](reference/reference-campaign.md) — the human-readable write-up of the full campaign (quality bar for future AI generation)
- `reference/reference-input.json` — the brief fields (also matches every placeholder shown in the Campaign Brief form)
- `reference/reference-strategy.json` — the reference Strategy tab output
- `reference/reference-copy-variations.json` — the 3 reference Ad Copy variations
- `reference/reference-creative.json` — the 4 reference Creative Ideas (one per format)
- `reference/reference-reel-scripts.json` — the 3 reference Reel Scripts
- `reference/reference-audience.json` — the reference Audience tab (inputs, plan and testing matrix)
- `reference/reference-offer.json` — the reference Offer tab (inputs, analysis and 3 variants)
- `reference/reference-campaign-structure.json` — the reference Campaign Structure tab (1 campaign, 3 ad sets, 9 ads)
- `reference/reference-creative-matrix.json` — the reference Creative Matrix (5 angle/format rows)
- `reference/images/*.svg`, `reference/creative-board.svg` — the sample creative visuals

Clicking **Use Reference Example** on the Campaign Brief tab loads all of the above into every tab (Strategy, Audience, Offer, Campaign, Ad Copy, Creative Ideas + Creative Matrix, Reel Scripts) — this is what a fully generated campaign is expected to look like end to end, at ₹0, with no API calls. If any reference JSON file can't be fetched (e.g. running the HTML file directly instead of through a server), the app falls back to an equivalent copy of the same content built into `js/app.js`.

The application's own generator (`js/campaign-generator.js`) should not hard-code these campaign outputs — they exist only as the reference/example data set.
