# AI Import from Website

Allows an innovator to import products from their registered website automatically. The URL is read from their innovator profile — no manual input required. Perplexity's `sonar-pro` model extracts structured product data and saves each as a DRAFT innovation.

---

## Endpoint

```
POST /api/innovator/ai/import-from-website
```

**Auth:** Required (innovator role)

**Request body:**
```json
{ "url": "https://example.com/products" }
```

**Success response (`201` when innovations saved, `200` when all skipped):**
```json
{
  "status": "success",
  "data": {
    "savedCount": 4,
    "skippedCount": 2,
    "innovations": [
      { "_id": "...", "innovationName": "Product A" },
      { "_id": "...", "innovationName": "Product B" }
    ]
  }
}
```

**Rate limit response (`429`):**
```json
{
  "status": "error",
  "message": "You have reached your daily import limit of 5. Please try again tomorrow."
}
```

---

## How It Works

1. **Rate limit check** — Per-user daily limit of 5 imports enforced via Redis. Fail-open if Redis is unavailable.
2. **Fetch page** — Puppeteer renders the URL (60s timeout, `networkidle2`) to capture JS-loaded prices and specs. Falls back to plain `fetch` if Puppeteer fails.
3. **Extract text** — JSON-LD structured data (`<script type="application/ld+json">`) is collected first (prices, specs on e-commerce sites), then all scripts/styles are stripped. Total sent to AI: up to 40,000 chars.
4. **AI extraction** — Page text + source URL sent to Perplexity `sonar-pro` with `search_context_size: 'high'`, allowing it to look up individual product pages for additional data not on the listing page.
5. **Sanitize** — All fields validated and trimmed to Innovation model constraints. Enum values normalised to lowercase. Null-like strings (`"null"`, `"n/a"`, `"."`, etc.) converted to null.
6. **Deduplication** — Any product whose `innovationName` already exists for this innovator (any status) is skipped. Case-insensitive match.
7. **Save** — New products inserted as DRAFT innovations via `insertMany` (bypasses pre-save validators — no image required at this stage).

---

## Extracted Fields

| Field | Notes |
|---|---|
| `innovationName` | Max 100 chars |
| `description` | Max 1000 chars |
| `category` | Enum array — defaults to `["others"]` if unresolvable |
| `subcategory` | Enum array — defaults to `["others"]` if unresolvable |
| `innovationStage` | Inferred from context; defaults to `"sales"` for market-ready products |
| `yearLaunched` | Integer 1900–current year only |
| `manufacturingLocation` | Max 100 chars |
| `powerSource` | Inferred from product description |
| `renewableType` | Only set if `powerSource` is `"renewable"` |
| `coveredOperations` | Enum array |
| `suitableCrops` | Max 200 chars |
| `suitableTerrains` | Max 200 chars |
| `dimensions` | Max 500 chars |
| `weight` | Max 50 chars |
| `performanceParams` | Max 200 chars |
| `sellingPrice` | Numeric string only, currency symbols stripped. Stored as `{ min, max }` in DB |
| `media.images` | Always saved as `[]` — innovator must upload images manually |

---

## Limits & Protection

| Setting | Value |
|---|---|
| Daily import limit per innovator | 5 (Redis, 24h TTL) |
| Page text sent to AI | 40,000 chars |
| JSON-LD structured data | 6,000 chars |
| Max response tokens | 24,000 |
| Practical product limit | ~40–60 per import |
| Puppeteer timeout | 60s |
| Perplexity API timeout | 60s |
| Pagination support | None — only the given URL is fetched |
| Duplicate handling | Skipped by name (case-insensitive, per innovator, all statuses) |

> **Tip:** For best results, link to an individual product page or a product listing page with specs visible. Category/landing pages with no product details will return minimal data.

---

## Frontend

The import panel (`AiImportPanel.jsx`) appears on the Innovation Submission page (create mode only). It:
- Reads the website URL directly from the innovator's profile (`user.links`, returned by `/api/auth/me`)
- Shows a full-screen loading overlay with rotating status messages during import (can take up to 90s)
- Displays `savedCount` and `skippedCount` in the success toast
- If no website URL is set in the profile, shows a warning instead of the import button

The `/api/auth/me` endpoint was updated to include `links` from `InnovatorProfile` for innovator users.

---

## Configuration

| Env variable | Description |
|---|---|
| `PERPLEXITY_API_KEY` | Required. sonar-pro API key |

---

## Key Files

| File | Purpose |
|---|---|
| `src/services/ai/aiService.js` | Core logic: fetch, strip, prompt, call Perplexity, sanitize |
| `src/api/controllers/innovator/aiController.js` | Rate limit, dedup, map AI output to Innovation model, save |
| `src/api/controllers/auth/meController.js` | Returns `links` from InnovatorProfile in `/me` response |
| `src/services/cache/cacheKeys.js` | `generateAiImportRateLimitKey` — Redis key for daily limit |
| `src/api/routes/innovator.js` | Route registration (`POST /ai/import-from-website`) |
