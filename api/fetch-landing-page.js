// AI Ads Studio — Landing Page fetch endpoint (Phase 8: Landing Page Intelligence).
//
// Fetches a landing page server-side (avoids browser CORS restrictions) and extracts
// a handful of concrete, verifiable signals via plain regex — no HTML parser dependency,
// no AI, no cost. If the page cannot be fetched, the frontend falls back to a manual
// paste-the-page-text flow instead of inventing anything about the page.

const MAX_RESPONSE_CHARS = 600000; // cap what we read from the response body
const MAX_TEXT_CHARS = 20000;      // cap the plain-text excerpt sent back to the browser
const FETCH_TIMEOUT_MS = 8000;

function stripTagsToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTagText(html, tag) {
  const match = html.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>', 'i'));
  return match ? stripTagsToText(match[1]) : '';
}

function extractAll(html, regex, limit) {
  const out = [];
  let m;
  while ((m = regex.exec(html)) && out.length < limit) {
    const text = stripTagsToText(m[1]).trim();
    if (text) out.push(text);
  }
  return out;
}

function extractMetaDescription(html) {
  const match = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i);
  return match ? stripTagsToText(match[1]) : '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const body = req.body || {};
    const rawUrl = String(body.url || '').trim();
    if (!rawUrl) return res.status(400).json({ error: 'Missing url.' });

    let target;
    try {
      target = new URL(rawUrl);
    } catch {
      return res.status(400).json({ error: 'That does not look like a valid URL.' });
    }
    if (target.protocol !== 'http:' && target.protocol !== 'https:') {
      return res.status(400).json({ error: 'Only http:// and https:// URLs are supported.' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let response;
    try {
      response = await fetch(target.toString(), {
        signal: controller.signal,
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AIAdsStudio-LandingPageAnalyser/1.0)' }
      });
    } catch (err) {
      return res.status(502).json({ error: 'Could not reach that URL (' + (err.name === 'AbortError' ? 'timed out' : err.message) + ').' });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      return res.status(502).json({ error: 'The page responded with status ' + response.status + '.' });
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType && !contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return res.status(415).json({ error: 'That URL did not return an HTML page (content-type: ' + contentType + ').' });
    }

    let html = await response.text();
    if (html.length > MAX_RESPONSE_CHARS) html = html.slice(0, MAX_RESPONSE_CHARS);

    const title = extractTagText(html, 'title');
    const metaDescription = extractMetaDescription(html);
    const h1s = extractAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi, 10);
    const h2s = extractAll(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi, 10);
    const anchors = extractAll(html, /<a\b[^>]*>([\s\S]*?)<\/a>/gi, 60).filter(t => t.length <= 60);
    const buttons = extractAll(html, /<button\b[^>]*>([\s\S]*?)<\/button>/gi, 30).filter(t => t.length <= 60);
    const listItemCount = (html.match(/<li[\s>]/gi) || []).length;
    const hasFormTag = /<form[\s>]/i.test(html);
    const hasViewportMeta = /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html);

    let text = stripTagsToText(html);
    if (text.length > MAX_TEXT_CHARS) text = text.slice(0, MAX_TEXT_CHARS);

    return res.status(200).json({
      ok: true,
      finalUrl: response.url || target.toString(),
      title,
      metaDescription,
      h1s,
      h2s,
      ctaTexts: [...buttons, ...anchors].slice(0, 40),
      listItemCount,
      hasFormTag,
      hasViewportMeta,
      text
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Landing page analysis failed.' });
  }
}
