const UA = 'god-jobs-outreach/1.0'

export type HnStoryHit = {
  title: string
  url: string | null
  storyText: string | null
  objectID: string
}

export async function searchHnStories(q: string, hitsPerPage: number): Promise<HnStoryHit[]> {
  const u = new URL('https://hn.algolia.com/api/v1/search')
  u.searchParams.set('tags', 'story')
  u.searchParams.set('query', q.trim() || 'startup launch')
  u.searchParams.set('hitsPerPage', String(Math.min(50, Math.max(1, hitsPerPage))))
  const res = await fetch(u.toString(), {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`HN Algolia HTTP ${res.status}`)
  const data = (await res.json()) as { hits?: Record<string, unknown>[] }
  const hits = data.hits ?? []
  const out: HnStoryHit[] = []
  for (const hit of hits) {
    const objectID = hit.objectID != null ? String(hit.objectID) : null
    const title = typeof hit.title === 'string' ? hit.title : ''
    if (!objectID) continue
    out.push({
      objectID,
      title: title || 'Untitled',
      url: typeof hit.url === 'string' ? hit.url : null,
      storyText: typeof hit.story_text === 'string' ? hit.story_text : null,
    })
  }
  return out
}

export function deriveWebsite(hit: HnStoryHit): string | null {
  if (hit.url) {
    try {
      return new URL(hit.url).origin
    }
    catch {
      return hit.url
    }
  }
  return `https://news.ycombinator.com/item?id=${hit.objectID}`
}

export function deriveNameFromTitle(title: string, max = 120) {
  const t = title.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}
