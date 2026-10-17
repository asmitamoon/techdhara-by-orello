const puppeteer = require('puppeteer');
const config = require('../../config');

const VALID_CATEGORIES = ['agriculture', 'textiles', 'fisheries', 'bamboo', 'poultry', 'dairy', 'others'];
const VALID_SUBCATEGORIES = ['production', 'processing', 'maintenance_and_management', 'others'];
const VALID_STAGES = ['idea', 'mvp', 'poc', 'sales'];
const VALID_POWER_SOURCES = ['manual', 'bullock', 'petrol_diesel', 'electrical', 'renewable'];
const VALID_RENEWABLE_TYPES = ['solar', 'wind', 'biomass', 'hydro', 'geothermal', 'others'];
const VALID_OPERATIONS = [
  'bed_making', 'drying', 'harvesting', 'interculture', 'irrigation',
  'oil_extraction', 'packaging', 'quality_testing', 'raking', 'shelling',
  'sowing', 'spraying', 'threshing', 'tillage', 'transportation',
  'weeding', 'winnowing',
];

// All optional fields use plain { type: 'string' } — sonar-pro does not
// reliably support anyOf. Enum validation and null coercion are done in
// sanitizeProduct so the schema stays simple and compatible.
const responseSchema = {
  type: 'object',
  properties: {
    products: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          innovationName:        { type: 'string' },
          yearLaunched:          { type: 'string' },
          description:           { type: 'string' },
          category:              { type: 'array', items: { type: 'string', enum: VALID_CATEGORIES } },
          subcategory:           { type: 'array', items: { type: 'string', enum: VALID_SUBCATEGORIES } },
          innovationStage:       { type: 'string' },
          manufacturingLocation: { type: 'string' },
          powerSource:           { type: 'string' },
          renewableType:         { type: 'string' },
          coveredOperations:     { type: 'array', items: { type: 'string', enum: VALID_OPERATIONS } },
          suitableCrops:         { type: 'string' },
          suitableTerrains:      { type: 'string' },
          dimensions:            { type: 'string' },
          weight:                { type: 'string' },
          performanceParams:     { type: 'string' },
          sellingPrice:          { type: 'string' },
        },
        required: ['innovationName', 'description', 'category', 'subcategory'],
      },
    },
  },
  required: ['products'],
};

// ── HTML → plain text helper ───────────────────────────────────────────────
// Extracts JSON-LD structured data FIRST (contains prices, specs, product info
// on most e-commerce/product sites) before stripping all other script/style tags.
const stripHtml = (html) => {
  // Collect JSON-LD blocks — these often hold price, dimensions, weight etc.
  const jsonLdBlocks = [];
  const jsonLdRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = jsonLdRe.exec(html)) !== null) {
    const content = m[1].trim();
    if (content) jsonLdBlocks.push(content);
  }

  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!jsonLdBlocks.length) return bodyText.slice(0, 40000);

  const structured = jsonLdBlocks.join('\n').slice(0, 6000);
  return (bodyText.slice(0, 34000) + '\n\n[STRUCTURED_DATA]\n' + structured).slice(0, 40000);
};

// ── Browser singleton (reused across requests) ────────────────────────────
let _browser = null;

const getBrowser = async () => {
  if (_browser && _browser.isConnected()) return _browser;
  _browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
  return _browser;
};

// ── Plain fetch (fast path for static/server-rendered sites) ──────────────
const fetchPageTextPlain = async (url) => {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InnovationGuildBot/1.0)' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Could not fetch the URL (HTTP ${res.status}).`);
  const html = await res.text();
  return stripHtml(html);
};

// ── Puppeteer fetch (fallback for JS-rendered SPAs) ───────────────────────
const fetchPageTextPuppeteer = async (url) => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setUserAgent('Mozilla/5.0 (compatible; InnovationGuildBot/1.0)');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    const html = await page.content();
    return stripHtml(html);
  } finally {
    await page.close();
  }
};

// ── Orchestrator: Puppeteer primary → plain fetch fallback ───────────────
// Puppeteer is primary because many sites (e.g. Shopify, WooCommerce) load
// prices and specs via JavaScript — plain fetch misses them entirely.
// Falls back to plain fetch only if Puppeteer itself throws.
const fetchPageText = async (url) => {
  try {
    const rendered = await fetchPageTextPuppeteer(url);
    console.log(`[AI] Puppeteer fetch: ${rendered.length} chars`);
    return rendered;
  } catch (err) {
    console.log(`[AI] Puppeteer failed (${err.message}) — falling back to plain fetch...`);
  }

  const plainText = await fetchPageTextPlain(url);
  console.log(`[AI] Plain fetch (fallback): ${plainText.length} chars`);
  return plainText;
};

const buildPrompt = (pageText, url) =>
  `You are extracting structured innovation/product data from a website. Find ALL distinct products or innovations listed. For each product fill in as many fields as possible by inferring from context — only use null when the information truly cannot be determined.

Source URL: ${url}
Use your web search capability to look up individual product pages from this site to find prices, dimensions, weight, and specs that may not appear on the listing page.

Fields to extract for each product:

- innovationName: the product name

- description: concise product description, max 1000 characters

- category (array, pick all that apply from exact values):
  agriculture=farming tools/equipment/inputs, textiles=fabric/clothing/weaving, fisheries=fishing equipment/aquaculture, bamboo=bamboo-based products, poultry=poultry farming equipment, dairy=dairy equipment/processing, others=anything else
  Infer from the product type even if not explicitly stated.

- subcategory (array, pick all that apply from exact values):
  production=making or manufacturing something, processing=transforming raw material into finished goods, maintenance_and_management=upkeep/monitoring/pest-control/management, others=anything else
  Infer from the product function even if not explicitly stated.

- innovationStage: ALWAYS fill this. One of [idea, mvp, poc, sales].
  Infer: "sales" if product is sold/available for purchase or has customers; "mvp" if working prototype mentioned; "poc" if proof-of-concept/testing phase; "idea" if only conceptual. Default to "sales" if product appears market-ready.

- yearLaunched: year product was launched (integer, between 1900 and ${new Date().getFullYear()} only). Null if unknown.

- manufacturingLocation: look for "Made in", "Manufactured in", address, city, state, country mentions. Else null.

- powerSource: infer from product description. One of [manual, bullock, petrol_diesel, electrical, renewable] or null.
  hand/foot/human-operated→manual, animal-drawn→bullock, engine/petrol/diesel/fuel→petrol_diesel, electric motor/battery/grid→electrical, solar/wind/biomass/biogas→renewable

- renewableType: only if powerSource is "renewable". One of [solar, wind, biomass, hydro, geothermal, others].
  solar panels/PV→solar, wind turbine→wind, biogas/biomass/organic→biomass, water/hydro→hydro. Else null.

- coveredOperations (array): match ALL applicable operations from the list below based on what the product does. Infer from the product's function:
  bed_making=forming raised seed beds for planting
  drying=drying crops, grains, or produce after harvest
  harvesting=cutting or collecting mature crops from fields
  interculture=weeding or tilling soil between crop rows during growth
  irrigation=supplying water to agricultural fields
  oil_extraction=extracting oil from seeds, nuts, or other sources
  packaging=packing, filling, or sealing agricultural produce
  quality_testing=grading, sorting, or testing produce quality
  raking=leveling soil surface or gathering cut grass/hay
  shelling=removing outer shells or husks from grains, nuts, or pods
  sowing=planting seeds or seedlings in the ground
  spraying=applying pesticides, herbicides, fertilizers, or water as spray
  threshing=separating grain kernels from stalks or husks after harvest
  tillage=plowing, digging, or breaking up soil for planting
  transportation=moving agricultural goods, produce, or equipment
  weeding=removing unwanted weeds from crop fields
  winnowing=separating grain from chaff using air or wind

- suitableCrops: crops this product works with (comma-separated string). Infer from context. Else null.

- suitableTerrains: terrain types suitable for this product (e.g. flat, hilly, waterlogged). Infer if possible. Else null.

- dimensions: product dimensions if mentioned in specs (e.g. "120cm x 80cm x 60cm"). Else null.

- weight: product weight if mentioned (e.g. "50 kg"). Else null.

- performanceParams: performance specs, output metrics, efficiency data (e.g. "2 acres/hour", "95% efficiency"). Else null.

- sellingPrice: price as numeric string only — strip all currency symbols (₹, Rs., INR, $). Use hyphen for range. Examples: "500", "5000-8000". Else null.

IMPORTANT:
- Only use the exact enum values listed above for category, subcategory, innovationStage, powerSource, renewableType, coveredOperations.
- Fill as many fields as possible. Do not default to null when you can reasonably infer.
- Return a JSON object with key "products" containing an array of all products found.

Website content:
${pageText}`;

const sanitizeProduct = (p) => {
  const currentYear = new Date().getFullYear();
  const clean = (v) => {
    if (v == null) return null;
    const s = String(v).trim();
    if (!s || /^[.\-*_]+$/.test(s) || /^(null|none|n\/a|na|not available|not mentioned|unknown)$/i.test(s)) return null;
    return s;
  };
  const parseYear = (v) => {
    const n = parseInt(String(v ?? ''), 10);
    return !isNaN(n) && n >= 1900 && n <= currentYear ? n : null;
  };
  return {
    ...p,
    innovationName:        clean(p.innovationName)?.slice(0, 100) ?? null,
    description:           clean(p.description)?.slice(0, 1000) ?? null,
    yearLaunched:          parseYear(p.yearLaunched),
    category:              (p.category ?? []).map(v => String(v).toLowerCase()).filter(v => VALID_CATEGORIES.includes(v)),
    subcategory:           (p.subcategory ?? []).map(v => String(v).toLowerCase()).filter(v => VALID_SUBCATEGORIES.includes(v)),
    innovationStage:       VALID_STAGES.includes(String(p.innovationStage ?? '').toLowerCase()) ? String(p.innovationStage).toLowerCase() : null,
    powerSource:           VALID_POWER_SOURCES.includes(String(p.powerSource ?? '').toLowerCase()) ? String(p.powerSource).toLowerCase() : null,
    renewableType:         VALID_RENEWABLE_TYPES.includes(String(p.renewableType ?? '').toLowerCase()) ? String(p.renewableType).toLowerCase() : null,
    coveredOperations:     (p.coveredOperations ?? []).map(v => String(v).toLowerCase()).filter(v => VALID_OPERATIONS.includes(v)),
    manufacturingLocation: clean(p.manufacturingLocation)?.slice(0, 100) ?? null,
    suitableCrops:         clean(p.suitableCrops)?.slice(0, 200) ?? null,
    suitableTerrains:      clean(p.suitableTerrains)?.slice(0, 200) ?? null,
    dimensions:            clean(p.dimensions)?.slice(0, 500) ?? null,
    weight:                clean(p.weight)?.slice(0, 50) ?? null,
    performanceParams:     clean(p.performanceParams)?.slice(0, 200) ?? null,
    sellingPrice:          clean(p.sellingPrice),
  };
};

// ── Recovery: salvage complete product objects from a truncated response ──
// Handles the wrapper object shape: { "products": [ {...}, {...}, ... (cut)
const recoverTruncatedProducts = (text) => {
  // Find where the products array starts
  const arrayStart = text.indexOf('"products"');
  if (arrayStart === -1) return null;
  const bracketPos = text.indexOf('[', arrayStart);
  if (bracketPos === -1) return null;

  // Walk the array portion and find the last fully-closed product object
  let depth = 0;
  let inString = false;
  let escape = false;
  let lastCompleteEnd = -1;

  for (let i = bracketPos; i < text.length; i++) {
    const c = text[i];
    if (escape)               { escape = false; continue; }
    if (c === '\\' && inString) { escape = true; continue; }
    if (c === '"')             { inString = !inString; continue; }
    if (inString)              continue;
    if (c === '{')             depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) lastCompleteEnd = i; // closed an item object (depth 0 relative to array)
    }
  }

  if (lastCompleteEnd === -1) return null;
  try {
    const recovered = JSON.parse(
      '{"products":' + text.slice(bracketPos, lastCompleteEnd + 1) + ']}'
    );
    return recovered.products ?? null;
  } catch {
    return null;
  }
};

// ── Clean up ":null" strings the model sometimes emits ────────────────────
const cleanNullStrings = (obj) => {
  if (Array.isArray(obj)) return obj.map(cleanNullStrings);
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k,
        (typeof v === 'string' && /^:?\s*null$/i.test(v.trim())) ? null : cleanNullStrings(v),
      ])
    );
  }
  return obj;
};

const extractProductsFromUrl = async (url) => {
  const apiKey = config.perplexityApiKey;
  if (!apiKey) throw new Error('PERPLEXITY_API_KEY is not configured on the server.');

  const pageText = await fetchPageText(url);
  const hasPriceData = /[₹$]|Rs\.|price|Price|\d+\s*\/-/.test(pageText);
  console.log(`[AI] Fetched page text: ${pageText.length} chars | contains price indicators: ${hasPriceData}`);

  if (pageText.length < 100) {
    throw new Error('The page appears to be JavaScript-rendered or empty. Try linking directly to a product listing page.');
  }

  const prompt = buildPrompt(pageText, url);

  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are a structured data extractor. Return only valid JSON matching the provided schema. No explanations, no markdown, no extra text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'innovations_extraction',
          schema: responseSchema,
        },
      },
      web_search_options: {
        search_context_size: 'high',
      },
      temperature: 0.1,
      max_tokens: 24000,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Perplexity API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const finishReason = data.choices?.[0]?.finish_reason;
  const rawText = data.choices?.[0]?.message?.content ?? '';
  console.log(`[AI] Perplexity finish_reason: ${finishReason}`);

  let products;
  try {
    const parsed = JSON.parse(rawText);
    products = parsed.products ?? parsed; // handle both {products:[]} and bare []
  } catch {
    // Response was truncated (finish_reason === 'length') — salvage complete objects
    console.warn('[AI] Full parse failed — attempting truncation recovery...');
    products = recoverTruncatedProducts(rawText);
    if (!products) {
      throw new Error('Could not parse Perplexity response. The page may contain too many products — try a more specific URL.');
    }
    console.log(`[AI] Recovered ${products.length} product(s) from truncated response`);
  }

  console.log(`[AI] Parsed ${products?.length ?? 0} products before sanitize`);

  if (!Array.isArray(products)) return [];

  const sanitized = products
    .map((p) => {
      const cleaned = cleanNullStrings(p);
      const s = sanitizeProduct(cleaned);
      if (s.category.length === 0) s.category = ['others'];
      if (s.subcategory.length === 0) s.subcategory = ['others'];
      return s;
    })
    .filter(p => p.innovationName);

  console.log(`[AI] ${sanitized.length} products after sanitize/filter`);
  return sanitized;
};

module.exports = { extractProductsFromUrl };
