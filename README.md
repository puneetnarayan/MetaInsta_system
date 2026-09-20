# AI Ads Studio

AI-assisted Facebook + Instagram campaign creator built with plain HTML, CSS and JavaScript.

## Current V1

- Campaign Brief form
- Demo Mode strategy generation
- Ad copy variations
- Creative concepts
- Reel script concepts
- Save campaigns in browser localStorage
- Load and delete saved campaigns
- New Campaign / Clear workflow
- JSON and text export
- Responsive desktop/mobile layout
- Vercel-ready static deployment

## Demo Mode

The current generator is intentionally a local placeholder. It does **not** call Claude or expose any API key in the browser.

The interface is structured so the generator can later be replaced by a secure Vercel serverless API endpoint.

## Planned next stages

1. Secure Claude API integration through a Vercel serverless function
2. Structured prompt system for strategy, copy, creatives and reels
3. Campaign editing and regeneration
4. Image-generation workflow
5. Meta Ads API integration
6. Campaign performance analysis

## Deployment

This is a static Vercel application. No build step is required.

Target deployment URL:
https://meta-insta-system-git-main-puneetnarayan.vercel.app/
