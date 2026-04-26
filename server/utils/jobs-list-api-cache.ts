const TTL_MS = 24 * 60 * 60 * 1000

let generation = 0
const store = new Map<string, { expires: number; payload: unknown }>()

function stableQueryKey(query: Record<string, unknown>): string {
  const sorted: Record<string, string> = {}
  for (const key of Object.keys(query).sort()) {
    const v = query[key]
    if (v === undefined || v === null || v === '')
      continue
    sorted[key] = Array.isArray(v) ? v.map(String).join(',') : String(v)
  }
  return JSON.stringify(sorted)
}

/**
 * Invalidate cached GET /api/jobs responses (e.g. after sync). Clears entries and bumps generation.
 */
export function bumpJobsListApiCache() {
  generation++
  store.clear()
}

export function getCachedJobsListResponse<T>(query: Record<string, unknown>, compute: () => T): T {
  const key = `${generation}:${stableQueryKey(query)}`
  const now = Date.now()
  const hit = store.get(key)
  if (hit && hit.expires > now)
    return hit.payload as T
  const payload = compute()
  store.set(key, { expires: now + TTL_MS, payload })
  return payload
}
