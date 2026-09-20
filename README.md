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
- Reel script concepts
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

**AI Images are never generated automatically.** Turning the AI Images switch on only enables the **Generate AI Images** button in the Creative Ideas tab, which shows its own estimated cost and must be clicked deliberately.

If an AI call fails for any reason (missing server-side API key, provider error, network issue), that one stage falls back to its ₹0 built-in result with a clear status message — no panel is ever left blank, and no other stage is affected.

`api/generate.js` is the single serverless endpoint for all of this. It accepts `{ stage, provider, model, brief, creativeConcepts, quality }`, reads `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` from Vercel's server-side environment variables (never sent to or stored in the browser), and returns only the generated content plus usage — never a key. ChatGPT Go and Claude Pro are consumer subscriptions and are unrelated to this — AI Control always uses the OpenAI API / Anthropic API billed to whichever server-side key is configured.

## Tests

The template logic used by Demo Mode lives in `js/campaign-generator.js` (a plain, dependency-free module usable from both the browser and Node). Run the test suite with:

```
npm test
```

## Planned next stages

1. Structured prompt system refinements for strategy, copy, creatives and reels
2. Campaign editing and regeneration history
3. Meta Ads API integration
4. Campaign performance analysis

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
