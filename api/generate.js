// AI Ads Studio — per-stage, per-provider generation endpoint.
//
// The frontend calls this with { stage, provider, model, brief, creativeConcepts, quality }.
// It never receives an API key; keys live only in Vercel environment variables
// (OPENAI_API_KEY, ANTHROPIC_API_KEY) and are never logged or echoed back.
//
// stage: 'strategy' | 'copy' | 'creative' | 'reels' | 'images'
// provider (text stages only): 'openai' | 'anthropic'
// Image generation currently supports OpenAI only.

const DEFAULT_OPENAI_TEXT_MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-luna';
const DEFAULT_ANTHROPIC_TEXT_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';
const DEFAULT_OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5';

const QUALITY_REFERENCE = `REFERENCE QUALITY:
- Understand the customer problem in the customer's own words.
- Do not invent testimonials, guarantees, statistics, certifications, outcomes, scarcity, or proof the brief does not provide. Keep claims supportable.
- Keep the selected tone and campaign objective.`;

function briefBlock(brief) {
  return `USER BRIEF:\n${JSON.stringify(brief || {}, null, 2)}`;
}

const STAGE_SPECS = {
  strategy: {
    toolName: 'strategy_output',
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        strategy: {
          type: 'object',
          additionalProperties: false,
          properties: {
            objective: { type: 'string' },
            audience: { type: 'string' },
            corePain: { type: 'string' },
            desiredOutcome: { type: 'string' },
            positioning: { type: 'string' },
            keyMessage: { type: 'string' },
            funnelAngle: { type: 'string' },
            testing: { type: 'array', items: { type: 'string' } }
          },
          required: ['objective', 'audience', 'corePain', 'desiredOutcome', 'positioning', 'keyMessage', 'funnelAngle', 'testing']
        }
      },
      required: ['strategy']
    },
    prompt: (brief) => `You are the strategy engine for AI Ads Studio, a Facebook and Instagram campaign planning tool.

Produce a campaign strategy connecting audience -> problem -> desired outcome -> positioning -> message -> funnel -> testing ideas.

${QUALITY_REFERENCE}

${briefBlock(brief)}

Return ONLY valid JSON matching the requested schema.`
  },
  copy: {
    toolName: 'copy_output',
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        copy: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              name: { type: 'string' },
              hook: { type: 'string' },
              primaryText: { type: 'string' },
              headline: { type: 'string' },
              description: { type: 'string' },
              cta: { type: 'string' }
            },
            required: ['name', 'hook', 'primaryText', 'headline', 'description', 'cta']
          }
        }
      },
      required: ['copy']
    },
    prompt: (brief) => `You are the ad copy engine for AI Ads Studio, a Facebook and Instagram campaign planning tool.

Produce exactly 3 materially different ad copy variants: a problem-led angle, an outcome-led angle and a conversational angle. Each needs a distinct name, hook, primaryText, headline, description and cta.

${QUALITY_REFERENCE}

${briefBlock(brief)}

Return ONLY valid JSON matching the requested schema.`
  },
  creative: {
    toolName: 'creative_output',
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        creative: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              format: { type: 'string', enum: ['Single Image Ad', 'Carousel', 'Instagram Story', 'Instagram Reel'] },
              concept: { type: 'string' }
            },
            required: ['format', 'concept']
          }
        }
      },
      required: ['creative']
    },
    prompt: (brief) => `You are the creative concepts engine for AI Ads Studio, a Facebook and Instagram campaign planning tool.

Produce exactly 4 creative concepts, one for each format: "Single Image Ad", "Carousel", "Instagram Story", "Instagram Reel". Each concept must describe format-appropriate structure (e.g. on-image headline/supporting text/CTA for a single image; card-by-card breakdown for a carousel; frame-by-frame for a story; scene sequence for a reel) and visual direction, as a single well-structured paragraph.

${QUALITY_REFERENCE}

${briefBlock(brief)}

Return ONLY valid JSON matching the requested schema.`
  },
  reels: {
    toolName: 'reels_output',
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        reels: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              title: { type: 'string' },
              hook: { type: 'string' },
              angle: { type: 'string', enum: ['Problem-led', 'Outcome-led', 'Question', 'Story', 'Educational', 'Objection', 'Testimonial'] },
              duration: { type: 'string', enum: ['15', '30', '45', '60'] },
              scenes: { type: 'array', items: { type: 'string' } },
              voiceover: { type: 'string' },
              onScreenText: { type: 'string' },
              cameraDirection: { type: 'string' },
              bRoll: { type: 'string' },
              cta: { type: 'string' },
              caption: { type: 'string' }
            },
            required: ['title', 'hook', 'angle', 'duration', 'scenes', 'voiceover', 'onScreenText', 'cameraDirection', 'bRoll', 'cta', 'caption']
          }
        }
      },
      required: ['reels']
    },
    prompt: (brief) => `You are the reel script engine for AI Ads Studio, a Facebook and Instagram campaign planning tool.

Produce exactly 3 reel scripts, each using a different angle from: Problem-led, Outcome-led, Question, Story, Educational, Objection, Testimonial. For each reel, produce:
- title, hook
- angle (one of the list above)
- duration: one of "15", "30", "45", "60" (seconds), chosen to fit the content
- scenes: 5-6 timed beats (e.g. "0-3s — ...") covering the arc of the reel
- voiceover: the full spoken script/voiceover text for the reel
- onScreenText: the key on-screen text/captions shown during the reel
- cameraDirection: shot/camera guidance (e.g. handheld selfie-style, static tripod, close-up, etc.)
- bRoll: suggested supporting b-roll footage to cut in
- cta: the final call to action
- caption: a ready-to-post social caption/description for the reel (separate from on-screen text)

${QUALITY_REFERENCE}

${briefBlock(brief)}

Return ONLY valid JSON matching the requested schema.`
  }
};

async function callOpenAIText({ model, prompt, schema, toolName }) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { error: 'OpenAI API key is not configured. Using ₹0 built-in result.' };
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
    body: JSON.stringify({
      model,
      reasoning: { effort: 'low' },
      instructions: 'Return concise but useful marketing content. Never include markdown fences around JSON.',
      input: prompt,
      text: { format: { type: 'json_schema', name: toolName, strict: true, schema } }
    })
  });
  const data = await response.json();
  if (!response.ok) return { error: data.error?.message || 'OpenAI request failed.' };
  let text = data.output_text;
  if (!text && data.output) text = data.output.flatMap((x) => x.content || []).map((x) => x.text || '').join('');
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: 'OpenAI returned unparseable output.' };
  }
  return {
    data: parsed,
    usage: {
      inputTokens: data.usage?.input_tokens ?? data.usage?.prompt_tokens ?? 0,
      outputTokens: data.usage?.output_tokens ?? data.usage?.completion_tokens ?? 0
    }
  };
}

async function callAnthropicText({ model, prompt, schema, toolName }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { error: 'Anthropic API key is not configured. Using ₹0 built-in result.' };
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model,
      max_tokens: 3000,
      system: 'Return concise but useful marketing content for AI Ads Studio, a Facebook and Instagram campaign planning tool. Always respond by calling the provided tool with the structured result.',
      messages: [{ role: 'user', content: prompt }],
      tools: [{ name: toolName, description: 'Return the requested structured campaign data.', input_schema: schema }],
      tool_choice: { type: 'tool', name: toolName }
    })
  });
  const data = await response.json();
  if (!response.ok) return { error: data.error?.message || 'Anthropic request failed.' };
  const toolUse = (data.content || []).find((c) => c.type === 'tool_use');
  if (!toolUse) return { error: 'Anthropic did not return structured data.' };
  return {
    data: toolUse.input,
    usage: {
      inputTokens: data.usage?.input_tokens ?? 0,
      outputTokens: data.usage?.output_tokens ?? 0
    }
  };
}

function buildImagePrompt(concept, brief) {
  const brand = brief?.brandName || 'the brand';
  const product = brief?.productName || 'the product/service';
  const tone = brief?.tone || 'Professional + Friendly';
  return `Create a ${concept.format} social media ad visual for "${product}" by ${brand}. Tone: ${tone}. Scene/creative direction: ${concept.concept} Photorealistic or clean flat-design commercial ad style, mobile-friendly composition, no readable body text or logos rendered in the image (text will be added separately).`;
}

function mapQuality(quality) {
  return ['low', 'medium', 'high', 'auto'].includes(quality) ? quality : 'medium';
}

// OpenAI's gpt-image-1 family only supports these three fixed sizes (plus "auto").
// Map the app's marketing aspect ratios onto the closest supported size.
const ASPECT_TO_SIZE = {
  '1:1': '1024x1024',
  '4:5': '1024x1536',
  '9:16': '1024x1536',
  '16:9': '1536x1024'
};
function mapAspectToSize(aspectRatio) {
  return ASPECT_TO_SIZE[aspectRatio] || '1024x1024';
}

async function callOpenAIImages({ model, quality, aspectRatio, concepts, brief }) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { error: 'OpenAI API key is not configured. Using ₹0 built-in result.' };
  const list = (Array.isArray(concepts) ? concepts : []).slice(0, 6);
  if (!list.length) return { error: 'No creative concepts supplied to generate images from.' };
  try {
    const results = await Promise.all(
      list.map(async (concept) => {
        const size = mapAspectToSize(concept.aspectRatio || aspectRatio);
        const prompt = typeof concept.prompt === 'string' && concept.prompt.trim() ? concept.prompt.trim() : buildImagePrompt(concept, brief);
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
          body: JSON.stringify({
            model,
            prompt,
            size,
            quality: mapQuality(quality),
            n: 1
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error((data.error?.message || 'Image generation failed') + ' (' + concept.format + ')');
        const item = data.data?.[0];
        const image = item?.b64_json ? 'data:image/png;base64,' + item.b64_json : item?.url;
        if (!image) throw new Error('No image returned for ' + concept.format);
        return { format: concept.format, image };
      })
    );
    return { images: results, usage: { imageCount: results.length } };
  } catch (err) {
    return { error: err.message || 'Image generation failed.' };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const body = req.body || {};
    const stage = body.stage;
    const provider = body.provider === 'anthropic' ? 'anthropic' : 'openai';
    const brief = body.brief || {};

    if (!stage) return res.status(400).json({ error: 'Missing stage.' });

    if (stage === 'images') {
      if (provider !== 'openai') return res.status(400).json({ error: 'Image generation currently supports OpenAI only.' });
      const model = body.model || DEFAULT_OPENAI_IMAGE_MODEL;
      const quality = body.quality || 'medium';
      const aspectRatio = body.aspectRatio || '1:1';
      const result = await callOpenAIImages({ model, quality, aspectRatio, concepts: body.creativeConcepts, brief });
      if (result.error) return res.status(503).json({ error: result.error });
      return res.status(200).json(result);
    }

    const spec = STAGE_SPECS[stage];
    if (!spec) return res.status(400).json({ error: 'Unknown stage: ' + stage });

    const model = body.model || (provider === 'anthropic' ? DEFAULT_ANTHROPIC_TEXT_MODEL : DEFAULT_OPENAI_TEXT_MODEL);
    const prompt = spec.prompt(brief);
    const caller = provider === 'anthropic' ? callAnthropicText : callOpenAIText;
    const result = await caller({ model, prompt, schema: spec.schema, toolName: spec.toolName });
    if (result.error) return res.status(503).json({ error: result.error });

    return res.status(200).json({ [stage]: result.data[stage], usage: result.usage });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Generation failed.' });
  }
}
