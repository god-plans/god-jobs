import type { NewJobListing } from './types'

const UA = 'god-jobs-outreach/1.0 (local dev; contact via product)'

export type JobSourceId = 'remotive' | 'arbeitnow' | 'hn'

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
      snippet: truncate(describe(job)),
      rawJson: JSON.stringify(job),
    })
  }
  return out
}

function describe(job: Record<string, unknown>) {
  const d = job.description
  return typeof d === 'string' ? d : ''
}

function truncate(s: string, n = 400) {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length <= n ? t : `${t.slice(0, n)}…`
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
    out.push({
      source: 'arbeitnow',
      externalId: id,
      title,
      company: typeof job.company_name === 'string' ? job.company_name : null,
      url,
      location,
      remote: Boolean(job.remote),
      postedAt: typeof job.created_at === 'string' ? job.created_at : null,
      snippet: truncate(typeof job.description === 'string' ? job.description : ''),
      rawJson: JSON.stringify(job),
    })
  }
  return out
}

/** Hacker News Algolia — story search (e.g. hiring threads, role keywords) */
export async function fetchHnJobs(query: string, hitsPerPage = 30): Promise<NewJobListing[]> {
  const q = query.trim() || 'hiring remote developer'
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
    const storyUrl = url ?? `https://news.ycombinator.com/item?id=${objectID}`
    out.push({
      source: 'hn',
      externalId: objectID,
      title,
      company: 'Hacker News',
      url: storyUrl,
      location: null,
      remote: /remote/i.test(title) || /remote/i.test(String(hit.story_text ?? '')),
      postedAt: typeof hit.created_at === 'number' ? new Date(hit.created_at * 1000).toISOString() : null,
      snippet: truncate(typeof hit.story_text === 'string' ? hit.story_text : ''),
      rawJson: JSON.stringify(hit),
    })
  }
  return out
}
