import { readBody } from 'h3'
import { z } from 'zod'
import {
  DEFAULT_JOB_RSS_FEEDS,
  fetchArbeitnowJobs,
  fetchHnJobs,
  fetchRemoteOkJobs,
  fetchRemotiveJobs,
  fetchRssFeedJobs,
  type JobSourceId,
} from '../../utils/jobs/connectors'
import { upsertJobRows } from '../../utils/jobs/upsert'

const sourceEnum = z.enum(['remotive', 'arbeitnow', 'hn', 'remoteok', 'rss'])

const bodySchema = z.object({
  sources: z.array(sourceEnum).optional(),
  query: z.string().optional(),
  hnHitsPerPage: z.number().int().min(1).max(50).optional(),
  /** Extra RSS/Atom URLs for this sync (e.g. RSSHub Telegram). Merged with `JOBS_RSS_FEEDS` / runtime config. */
  rssFeedUrls: z.array(z.string().min(4)).optional(),
})

const defaultSources: JobSourceId[] = ['remotive', 'arbeitnow', 'remoteok', 'hn', 'rss']

export default defineEventHandler(async (event) => {
  const raw = await readBody(event)
  const parsed = bodySchema.safeParse(raw ?? {})
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', data: parsed.error.flatten() })
  }
  const { sources, query, hnHitsPerPage, rssFeedUrls } = parsed.data
  const config = useRuntimeConfig(event)
  const feedsFromEnv = String(config.jobsRssFeeds ?? '')
    .split(/[\n,]+/)
    .map((s: string) => s.trim())
    .filter(Boolean)

  const want: JobSourceId[] = sources?.length ? (sources as JobSourceId[]) : defaultSources

  const result: Record<string, { ok: boolean; count?: number; error?: string; note?: string }> = {}

  for (const src of want) {
    try {
      let rows = []
      if (src === 'remotive') {
        rows = await fetchRemotiveJobs()
      }
      else if (src === 'arbeitnow') {
        rows = await fetchArbeitnowJobs()
      }
      else if (src === 'remoteok') {
        rows = await fetchRemoteOkJobs()
      }
      else if (src === 'rss') {
        const configured = [...new Set([...feedsFromEnv, ...(rssFeedUrls ?? [])])]
        const urls = configured.length ? configured : [...DEFAULT_JOB_RSS_FEEDS]
        rows = await fetchRssFeedJobs(urls)
        if (!configured.length) {
          result.rss = { ok: true, count: upsertJobRows(rows), note: `No JOBS_RSS_FEEDS: used default (${DEFAULT_JOB_RSS_FEEDS.join(', ')})` }
          continue
        }
      }
      else {
        rows = await fetchHnJobs(query ?? '', hnHitsPerPage ?? 50)
      }
      const count = upsertJobRows(rows)
      result[src] = { ok: true, count }
    }
    catch (e: unknown) {
      result[src] = { ok: false, error: e instanceof Error ? e.message : String(e) }
    }
  }

  return { result, syncedAt: new Date().toISOString() }
})
