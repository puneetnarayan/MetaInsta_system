# AI Ads Studio

AI-assisted Facebook + Instagram campaign creator built with plain HTML, CSS and JavaScript.

## Current V1

- Campaign Brief form
- Demo Mode strategy generation (₹0, local, no API calls)
- Optional real AI generation via an opt-in toggle, calling the `api/generate.js` Vercel serverless function (OpenAI, your own key/billing)
- Ad copy variations with live Meta character-count guidance (primary text / headline / description)
- Creative concepts, with inline (non-blocking) editing
- Reel script concepts
- Save, duplicate, load and delete campaigns in browser localStorage
- New Campaign / Clear workflow with an inline confirmation (no blocking browser dialogs)
- JSON and text export
- Responsive desktop/mobile layout
- Basic accessibility: ARIA tab roles, live status region
- Vercel-ready static deployment
- Unit tests for the campaign-generation logic (`npm test`)

## Demo Mode vs. real AI

By default, the generator is a local, deterministic placeholder (₹0 Mode). It does **not** call any external API or expose a key in the browser.

The brief screen also has an opt-in "Use real AI generation" checkbox. When enabled, campaign generation calls the `api/generate.js` Vercel serverless function, which uses the OpenAI Responses API server-side (via `OPENAI_API_KEY`/`OPENAI_MODEL` environment variables on Vercel). This mode incurs your own OpenAI usage cost — it is off by default and clearly labeled in the UI. If the AI call fails, the app falls back to the ₹0 demo campaign and reports the error.

## Tests

The template logic used by Demo Mode lives in `js/campaign-generator.js` (a plain, dependency-free module usable from both the browser and Node). Run the test suite with:

```
npm test
```

## Planned next stages

1. Structured prompt system refinements for strategy, copy, creatives and reels
2. Campaign editing and regeneration history
3. Image-generation workflow
4. Meta Ads API integration
5. Campaign performance analysis

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
- `reference/images/*.svg`, `reference/creative-board.svg` — the sample creative visuals

Clicking **Use Reference Example** on the Campaign Brief tab loads all of the above into every tab (Strategy, Ad Copy, Creative Ideas, Reel Scripts) — this is what a fully generated campaign is expected to look like end to end, at ₹0, with no API calls. If any reference JSON file can't be fetched (e.g. running the HTML file directly instead of through a server), the app falls back to an equivalent copy of the same content built into `js/app.js`.

The application's own generator (`js/campaign-generator.js`) should not hard-code these campaign outputs — they exist only as the reference/example data set.
