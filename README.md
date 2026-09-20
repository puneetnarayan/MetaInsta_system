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

The complete ChatGPT-generated reference input, example placeholders, strategy, ad copy, creative concepts and reel scripts are maintained separately from the application code:

- [Reference Campaign](reference/reference-campaign.md)

This file is the quality reference for future AI-generated campaigns. The application code should not hard-code these campaign outputs.
