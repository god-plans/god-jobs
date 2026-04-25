import { createHash } from 'node:crypto'
import Parser from 'rss-parser'
import { hnTitleLooksLikeJobPost } from './hn-filter'
import { stripHtml, truncate } from './text'
import type { NewJobListing } from './types'
import { getJobsFetchUserAgent } from './http-constants'
import { jobsFetch } from './jobs-fetch'

export type JobSourceId =
  | 'remotive'
  | 'arbeitnow'
  | 'hn'
  | 'remoteok'
  | 'rss'
  | 'jobicy'
  | 'greenhouse'

const rssParser = new Parser({
  timeout: 25000,
  headers: { Accept: 'application/rss+xml, application/atom+xml, */*' },
})

/** Used when `JOBS_RSS_FEEDS` is empty so “RSS” sync still ingests a public job feed. */
export const DEFAULT_JOB_RSS_FEEDS = ['https://weworkremotely.com/remote-jobs.rss'] as const

async function fetchAndParseFeed(feedUrl: string) {
  const res = await jobsFetch(feedUrl, {
    redirect: 'follow',
    headers: {
      'User-Agent': getJobsFetchUserAgent(),
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
  const res = await jobsFetch('https://remotive.com/api/remote-jobs', {
    headers: { 'User-Agent': getJobsFetchUserAgent(), Accept: 'application/json' },
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
  const res = await jobsFetch('https://www.arbeitnow.com/api/job-board-api', {
    headers: { 'User-Agent': getJobsFetchUserAgent(), Accept: 'application/json' },
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

const REMOTE_OK_API_URL = 'https://remoteok.com/api'

/** Public CORS proxy — returns the same JSON as Remote OK when direct requests get HTTP 403 (e.g. Cloudflare + datacenter IP). */
function remoteOkCodetabsProxyUrl(): string {
  return `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(REMOTE_OK_API_URL)}`
}

function remoteOkCodetabsFallbackDisabled(): boolean {
  const v = String(
    process.env.NUXT_JOBS_REMOTEOK_DISABLE_CODETABS_FALLBACK
    ?? process.env.JOBS_REMOTEOK_DISABLE_CODETABS_FALLBACK
    ?? '',
  ).toLowerCase()
  return v === '1' || v === 'true' || v === 'yes'
}

/** Map Remote OK `/api` JSON array rows to listings (skips the legal/terms row). */
function mapRemoteOkApiRows(data: Record<string, unknown>[]): NewJobListing[] {
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

export type FetchRemoteOkResult = { rows: NewJobListing[]; note?: string }

/**
 * Remote OK — public JSON API (first row may be legal/terms metadata).
 * If the origin returns HTTP 403, retries via a public JSON proxy (CodeTabs) so self-hosted sync still works without your own HTTPS_PROXY.
 */
export async function fetchRemoteOkJobsResult(): Promise<FetchRemoteOkResult> {
  const browserLikeUa =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

  async function requestDirect(ua: string) {
    return jobsFetch(REMOTE_OK_API_URL, {
      headers: {
        'User-Agent': ua,
        Accept: 'application/json',
        Referer: 'https://remoteok.com/',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
  }

  let res = await requestDirect(getJobsFetchUserAgent())
  if (res.status === 403) {
    res = await requestDirect(browserLikeUa)
  }

  if (res.ok) {
    const data = (await res.json()) as Record<string, unknown>[]
    return { rows: mapRemoteOkApiRows(Array.isArray(data) ? data : []) }
  }

  if (res.status === 403 && !remoteOkCodetabsFallbackDisabled()) {
    const proxied = await jobsFetch(remoteOkCodetabsProxyUrl(), {
      headers: {
        'User-Agent': getJobsFetchUserAgent(),
        Accept: 'application/json',
      },
    })
    if (proxied.ok) {
      const raw = await proxied.text()
      let data: unknown
      try {
        data = JSON.parse(raw) as unknown
      }
      catch {
        throw new Error(
          'Remote OK HTTP 403; CodeTabs proxy returned non-JSON. Set NUXT_JOBS_HTTPS_PROXY or set NUXT_JOBS_REMOTEOK_DISABLE_CODETABS_FALLBACK=1 to skip this fallback.',
        )
      }
      if (!Array.isArray(data)) {
        throw new Error(
          'Remote OK HTTP 403; CodeTabs proxy returned unexpected JSON. Set NUXT_JOBS_HTTPS_PROXY.',
        )
      }
      return {
        rows: mapRemoteOkApiRows(data as Record<string, unknown>[]),
        note: 'Remote OK API blocked this host (HTTP 403); used CodeTabs public proxy for the same JSON. Prefer NUXT_JOBS_HTTPS_PROXY for a direct trust path, or set NUXT_JOBS_REMOTEOK_DISABLE_CODETABS_FALLBACK=1 to skip this fallback.',
      }
    }
    throw new Error(
      `Remote OK HTTP 403; CodeTabs proxy HTTP ${proxied.status}. Set NUXT_JOBS_HTTPS_PROXY (or HTTPS_PROXY), or retry later.`,
    )
  }

  const hint =
    res.status === 403
      ? ` Datacenter IPs are often blocked. Set NUXT_JOBS_HTTPS_PROXY (or HTTPS_PROXY).${
        remoteOkCodetabsFallbackDisabled()
          ? ' CodeTabs JSON proxy fallback is off (NUXT_JOBS_REMOTEOK_DISABLE_CODETABS_FALLBACK); remove that env var to retry with the automatic fallback.'
          : ''
      }`
      : ''
  throw new Error(`Remote OK HTTP ${res.status}.${hint}`)
}

/** Same as {@link fetchRemoteOkJobsResult} but returns only rows (no sync note). */
export async function fetchRemoteOkJobs(): Promise<NewJobListing[]> {
  const { rows } = await fetchRemoteOkJobsResult()
  return rows
}

/** RSS or Atom feeds — Telegram via RSSHub, job-board RSS, etc. Uses `fetch` + parse (not `parseURL`) for consistent UA/TLS. */
/** Jobicy — remote jobs JSON API (see https://jobicy.com/api/v2/remote-jobs). `count` must be 1–100. */
export async function fetchJobicyJobs(count = 100): Promise<NewJobListing[]> {
  const capped = Math.min(100, Math.max(1, count))
  const u = new URL('https://jobicy.com/api/v2/remote-jobs')
  u.searchParams.set('count', String(capped))
  const res = await jobsFetch(u.toString(), {
    headers: { 'User-Agent': getJobsFetchUserAgent(), Accept: 'application/json' },
  })
  const text = await res.text()
  if (!res.ok) {
    let detail = ''
    try {
      const errBody = JSON.parse(text) as { error?: string; message?: string }
      detail = (typeof errBody.error === 'string' && errBody.error) || (typeof errBody.message === 'string' && errBody.message) || ''
    }
    catch {
      /* ignore */
    }
    throw new Error(detail ? `Jobicy HTTP ${res.status}: ${detail}` : `Jobicy HTTP ${res.status}`)
  }
  const data = JSON.parse(text) as { jobs?: Record<string, unknown>[]; success?: boolean; error?: string }
  if (data.success === false && typeof data.error === 'string' && data.error)
    throw new Error(`Jobicy: ${data.error}`)
  const jobs = data.jobs ?? []
  const out: NewJobListing[] = []
  for (const job of jobs) {
    const id = job.id != null ? String(job.id) : null
    const url = typeof job.url === 'string' ? job.url : ''
    const title = typeof job.jobTitle === 'string' ? job.jobTitle : 'Untitled'
    if (!id || !url) continue
    const excerpt = typeof job.jobExcerpt === 'string' ? job.jobExcerpt : ''
    const desc = typeof job.jobDescription === 'string' ? job.jobDescription : ''
    const geo = typeof job.jobGeo === 'string' ? job.jobGeo : null
    const pub = typeof job.pubDate === 'string' ? job.pubDate : null
    out.push({
      source: 'jobicy',
      externalId: id,
      title,
      company: typeof job.companyName === 'string' ? job.companyName : null,
      url,
      location: geo,
      remote: true,
      postedAt: pub,
      snippet: truncate(stripHtml(excerpt || desc)),
      rawJson: JSON.stringify(job),
    })
  }
  return out
}

/**
 * Greenhouse public job board API — one request per board token.
 * Tokens are the path segment in `https://boards.greenhouse.io/{token}` (e.g. `stripe`).
 * Failed boards are skipped; warnings list human-readable errors.
 */
export async function fetchGreenhouseJobs(boardTokens: string[]): Promise<{ rows: NewJobListing[]; warnings: string[] }> {
  const tokens = [...new Set(boardTokens.map((t) => t.trim()).filter(Boolean))]
  const out: NewJobListing[] = []
  const warnings: string[] = []
  for (const board of tokens) {
    try {
      const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs`
      const res = await jobsFetch(apiUrl, {
        headers: { 'User-Agent': getJobsFetchUserAgent(), Accept: 'application/json' },
      })
      if (!res.ok) {
        warnings.push(`"${board}": HTTP ${res.status}`)
        continue
      }
      const data = (await res.json()) as { jobs?: Record<string, unknown>[]; error?: string }
      if (!Array.isArray(data.jobs)) {
        warnings.push(`"${board}": ${data.error ?? 'unexpected response'}`)
        continue
      }
      for (const job of data.jobs) {
        const id = job.id != null ? String(job.id) : null
        const url = typeof job.absolute_url === 'string' ? job.absolute_url : ''
        const title = typeof job.title === 'string' ? job.title : 'Untitled'
        if (!id || !url) continue
        const loc = job.location && typeof job.location === 'object' && job.location !== null
          && typeof (job.location as { name?: string }).name === 'string'
          ? (job.location as { name: string }).name
          : null
        const company = typeof job.company_name === 'string' ? job.company_name : null
        const published = typeof job.first_published === 'string' ? job.first_published : null
        const updated = typeof job.updated_at === 'string' ? job.updated_at : null
        const desc = typeof job.content === 'string' ? job.content : ''
        out.push({
          source: 'greenhouse',
          externalId: `${board}:${id}`,
          title,
          company,
          url,
          location: loc,
          remote: /remote/i.test(title) || /remote/i.test(loc ?? '') || /remote/i.test(desc),
          postedAt: published ?? updated,
          snippet: desc ? truncate(stripHtml(desc)) : null,
          rawJson: JSON.stringify(job),
        })
      }
    }
    catch (e: unknown) {
      warnings.push(`"${board}": ${e instanceof Error ? e.message : String(e)}`)
    }
  }
  return { rows: out, warnings }
}

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
  const res = await jobsFetch(u.toString(), {
    headers: { 'User-Agent': getJobsFetchUserAgent(), Accept: 'application/json' },
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
