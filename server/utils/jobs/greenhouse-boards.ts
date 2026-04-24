import { JOBS_FETCH_UA } from './http-constants'

/**
 * Greenhouse does not publish an API to discover every public board. This list is a
 * small, verified subset of `boards.greenhouse.io/{token}` slugs (HTTP 200 on the jobs endpoint).
 * Use the keyword `curated` in `NUXT_JOBS_GREENHOUSE_BOARDS` to merge these with your own tokens,
 * or host a longer list via `NUXT_JOBS_GREENHOUSE_BOARD_LIST_URL`.
 */
export const GREENHOUSE_CURATED_BOARD_TOKENS: readonly string[] = [
  'airtable',
  'asana',
  'block',
  'brex',
  'cloudflare',
  'coinbase',
  'databricks',
  'discord',
  'dropbox',
  'duolingo',
  'elastic',
  'figma',
  'flexport',
  'hubspot',
  'instacart',
  'lyft',
  'mongodb',
  'robinhood',
  'stripe',
  'twilio',
  'webflow',
  'zoominfo',
]

const CURATED_ALIASES = new Set(['curated', 'pack', 'default', '*'])

/** Comma/newline tokens; lines after `#` are comments (for pasted lists). */
export function parseGreenhouseBoardTokens(raw: string | undefined | null): string[] {
  const text = String(raw ?? '')
  const parts = text.split(/[\n,]+/)
  const out: string[] = []
  for (const p of parts) {
    const line = p.replace(/#.*$/, '').trim()
    if (line)
      out.push(line)
  }
  return [...new Set(out)]
}

/** If the list contains `curated`, `pack`, `default`, or `*`, append {@link GREENHOUSE_CURATED_BOARD_TOKENS}. */
export function expandGreenhouseBoardTokens(tokens: string[]): string[] {
  const out: string[] = []
  let addCurated = false
  for (const raw of tokens) {
    const t = raw.trim()
    if (!t) continue
    if (CURATED_ALIASES.has(t.toLowerCase())) {
      addCurated = true
      continue
    }
    out.push(t)
  }
  if (addCurated)
    out.push(...GREENHOUSE_CURATED_BOARD_TOKENS)
  return [...new Set(out)]
}

/** Fetch a plain-text or comma-separated list of board tokens (one token per line; `#` comments allowed). */
export async function fetchGreenhouseBoardListFromUrl(url: string): Promise<string[]> {
  const res = await fetch(url.trim(), {
    headers: { 'User-Agent': JOBS_FETCH_UA, Accept: 'text/plain,text/csv,*/*' },
    signal: AbortSignal.timeout(25_000),
  })
  if (!res.ok)
    throw new Error(`HTTP ${res.status}`)
  const text = await res.text()
  return parseGreenhouseBoardTokens(text)
}
