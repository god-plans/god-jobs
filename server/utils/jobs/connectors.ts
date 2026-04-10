import { createHash } from 'node:crypto'
import Parser from 'rss-parser'
import { hnTitleLooksLikeJobPost } from './hn-filter'
import { stripHtml, truncate } from './text'
import type { NewJobListing } from './types'

const UA = 'god-jobs-outreach/1.0 (local dev; contact via product)'

export type JobSourceId = 'remotive' | 'arbeitnow' | 'hn' | 'remoteok' | 'rss'

const rssParser = new Parser({
  timeout: 25000,
  headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/atom+xml, */*' },
})

/** Used when `JOBS_RSS_FEEDS` is empty so “RSS” sync still ingests a public job feed. */
export const DEFAULT_JOB_RSS_FEEDS = ['https://weworkremotely.com/remote-jobs.rss'] as const

async function fetchAndParseFeed(feedUrl: string) {
  const res = await fetch(feedUrl, {
    redirect: 'follow',
    headers: {
      'User-Agent': UA,
      Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
    },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  const text = await res.text()
  return rssParser.parseString(text)
}

function hnPostedAt(hit: Record<string, unknown>): string | null {
  if (typeof hit.created_at_i === 'number' && Number.isFinite(hit.created_at_i)) {
    return new Date(hit.created_at_i * 1000).toISOString()
  }
  if (typeof hit.created_at === 'string') {
    const t = Date.parse(hit.created_at)
    return Number.isFinite(t) ? new Date(t).toISOString() : null
  }
  if (typeof hit.created_at === 'number') {
    return new Date(hit.created_at * 1000).toISOString()
  }
  return null
}

export async function fetchRemotiveJobs(): Promise<NewJobListing[]> {
  const res = await fetch('https://remotive.com/api/remote-jobs', {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Remotive HTTP ${res.status}`)
  const data = (await res.json()) as { jobs?: Record<string, unknown>[] }
  const jobs = data.jobs ?? []
  const out: NewJobListing[] = []
  for (const job of jobs) {
    const id = job.id != null ? String(job.id) : null
    const url = typeof job.url === 'string' ? job.url : ''
    const title = typeof job.title === 'string' ? job.title : 'Untitled'
    if (!id || !url) continue
    const jobType = typeof job.job_type === 'string' ? job.job_type : ''
    out.push({
      source: 'remotive',
      externalId: id,
      title,
      company: typeof job.company_name === 'string' ? job.company_name : null,
      url,
      location: typeof job.candidate_required_location === 'string' ? job.candidate_required_location : null,
      remote: jobType.toLowerCase().includes('remote'),
      postedAt: typeof job.publication_date === 'string' ? job.publication_date : null,
      snippet: truncate(stripHtml(describe(job))),
      rawJson: JSON.stringify(job),
    })
  }
  return out
}

function describe(job: Record<string, unknown>) {
  const d = job.description
  return typeof d === 'string' ? d : ''
}

export async function fetchArbeitnowJobs(): Promise<NewJobListing[]> {
  const res = await fetch('https://www.arbeitnow.com/api/job-board-api', {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Arbeitnow HTTP ${res.status}`)
  const data = (await res.json()) as { data?: Record<string, unknown>[] }
  const jobs = data.data ?? []
  const out: NewJobListing[] = []
  for (const job of jobs) {
    const slug = typeof job.slug === 'string' ? job.slug : null
    const id = slug ?? (job.id != null ? String(job.id) : null)
    const url = typeof job.url === 'string' ? job.url : ''
    const title = typeof job.title === 'string' ? job.title : 'Untitled'
    if (!id || !url) continue
    const cities = job.cities
    const location = Array.isArray(cities) && cities.length ? String(cities[0]) : null
    const rawDesc = typeof job.description === 'string' ? job.description : ''
    out.push({
      source: 'arbeitnow',
      externalId: id,
      title,
      company: typeof job.company_name === 'string' ? job.company_name : null,
      url,
      location,
      remote: Boolean(job.remote),
      postedAt: typeof job.created_at === 'string' ? job.created_at : null,
      snippet: truncate(stripHtml(rawDesc)),
      rawJson: JSON.stringify(job),
    })
  }
  return out
}

/** Remote OK — public JSON API (first row may be legal/terms metadata). */
export async function fetchRemoteOkJobs(): Promise<NewJobListing[]> {
  const res = await fetch('https://remoteok.com/api', {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Remote OK HTTP ${res.status}`)
  const data = (await res.json()) as Record<string, unknown>[]
  const out: NewJobListing[] = []
  for (const row of data) {
    if (typeof row.legal === 'string') continue
    const id = row.id != null ? String(row.id) : null
    const slug = typeof row.slug === 'string' ? row.slug : null
    const url = typeof row.url === 'string' ? row.url : ''
    const title = typeof row.position === 'string' ? row.position : 'Untitled'
    const externalId = id ?? slug
    if (!externalId || !url) continue
    const desc = typeof row.description === 'string' ? row.description : ''
    const companyRaw = typeof row.company === 'string' ? row.company : null
    const company = companyRaw ? stripHtml(companyRaw) : null
    const location = typeof row.location === 'string' ? row.location : null
    out.push({
      source: 'remoteok',
      externalId,
      title,
      company,
      url,
      location,
      remote: true,
      postedAt: typeof row.date === 'string' ? row.date : null,
      snippet: truncate(stripHtml(desc)),
      rawJson: JSON.stringify(row),
    })
  }
  return out
}

/** RSS or Atom feeds — Telegram via RSSHub, job-board RSS, etc. Uses `fetch` + parse (not `parseURL`) for consistent UA/TLS. */
export async function fetchRssFeedJobs(feedUrls: string[]): Promise<NewJobListing[]> {
  const urls = [...new Set(feedUrls.map((u) => u.trim()).filter(Boolean))]
  const out: NewJobListing[] = []
  for (const feedUrl of urls) {
    let feed: Awaited<ReturnType<typeof rssParser.parseString>>
    try {
      feed = await fetchAndParseFeed(feedUrl)
    }
    catch (e: unknown) {
      throw new Error(`RSS ${feedUrl}: ${e instanceof Error ? e.message : String(e)}`)
    }
    const feedLabel = feed.title?.trim() || new URL(feedUrl).hostname
    for (const item of feed.items ?? []) {
      const guid = typeof item.guid === 'string' ? item.guid.trim() : ''
      const link = (item.link?.trim() || (guid.startsWith('http') ? guid : '')) || ''
      const title = item.title?.trim()
      if (!link || !title) continue
      const idSource = `${item.guid ?? link}${item.isoDate ?? item.pubDate ?? ''}`
      const externalId = createHash('sha256').update(`${feedUrl}|${idSource}`).digest('hex').slice(0, 32)
      const rawSnippet = item.contentSnippet ?? item.content ?? item.summary ?? ''
      const snippet = truncate(stripHtml(rawSnippet))
      out.push({
        source: 'rss',
        externalId,
        title,
        company: feedLabel,
        url: link,
        location: null,
        remote: /remote/i.test(title) || /remote/i.test(snippet),
        postedAt: item.isoDate ?? item.pubDate ?? null,
        snippet: snippet || null,
        rawJson: JSON.stringify({ feedUrl, feedTitle: feed.title, item }),
      })
    }
  }
  return out
}

/** Hacker News Algolia — story search; results are filtered to hiring-like titles. */
export async function fetchHnJobs(query: string, hitsPerPage = 50): Promise<NewJobListing[]> {
  /** Broad query — the narrow `… OR …` form only matched ~15 indexed stories; filter does the real culling. */
  const q = query.trim() || 'hiring'
  const u = new URL('https://hn.algolia.com/api/v1/search')
  u.searchParams.set('tags', 'story')
  u.searchParams.set('query', q)
  u.searchParams.set('hitsPerPage', String(Math.min(50, Math.max(1, hitsPerPage))))
  const res = await fetch(u.toString(), {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`HN Algolia HTTP ${res.status}`)
  const data = (await res.json()) as { hits?: Record<string, unknown>[] }
  const hits = data.hits ?? []
  const out: NewJobListing[] = []
  for (const hit of hits) {
    const objectID = hit.objectID != null ? String(hit.objectID) : null
    const url = typeof hit.url === 'string' && hit.url ? hit.url : null
    const title = typeof hit.title === 'string' ? hit.title : 'Untitled'
    if (!objectID) continue
    if (!hnTitleLooksLikeJobPost(title)) continue
    const storyUrl = url ?? `https://news.ycombinator.com/item?id=${objectID}`
    const storyText = typeof hit.story_text === 'string' ? hit.story_text : ''
    out.push({
      source: 'hn',
      externalId: objectID,
      title,
      company: 'Hacker News',
      url: storyUrl,
      location: null,
      remote: /remote/i.test(title) || /remote/i.test(storyText),
      postedAt: hnPostedAt(hit),
      snippet: truncate(stripHtml(storyText)),
      rawJson: JSON.stringify(hit),
    })
  }
  return out
}
