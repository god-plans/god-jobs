import { readBody } from 'h3'
import { z } from 'zod'
import {
  DEFAULT_JOB_RSS_FEEDS,
  fetchArbeitnowJobs,
  fetchGreenhouseJobs,
  fetchHnJobs,
  fetchJobicyJobs,
  fetchRemoteOkJobs,
  fetchRemotiveJobs,
  fetchRssFeedJobs,
  type JobSourceId,
} from '../../utils/jobs/connectors'
import {
  expandGreenhouseBoardTokens,
  fetchGreenhouseBoardListFromUrl,
  parseGreenhouseBoardTokens,
} from '../../utils/jobs/greenhouse-boards'
import { upsertJobRows } from '../../utils/jobs/upsert'

const sourceEnum = z.enum(['remotive', 'arbeitnow', 'hn', 'remoteok', 'rss', 'jobicy', 'greenhouse'])

const bodySchema = z.object({
  sources: z.array(sourceEnum).optional(),
  query: z.string().optional(),
  hnHitsPerPage: z.number().int().min(1).max(50).optional(),
  /** Extra RSS/Atom URLs for this sync (e.g. RSSHub Telegram). Merged with `JOBS_RSS_FEEDS` / runtime config. */
  rssFeedUrls: z.array(z.string().min(4)).optional(),
})

const defaultSourcesBase: JobSourceId[] = ['remotive', 'arbeitnow', 'remoteok', 'hn', 'rss', 'jobicy']

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

  const greenhouseBoardsRaw =
    String(config.jobsGreenhouseBoards ?? '').trim()
    || String(process.env.NUXT_JOBS_GREENHOUSE_BOARDS ?? '').trim()
    || String(process.env.JOBS_GREENHOUSE_BOARDS ?? '').trim()

  let greenhouseBoards = expandGreenhouseBoardTokens(parseGreenhouseBoardTokens(greenhouseBoardsRaw))

  const boardListUrl =
    String(config.jobsGreenhouseBoardListUrl ?? '').trim()
    || String(process.env.NUXT_JOBS_GREENHOUSE_BOARD_LIST_URL ?? '').trim()
    || String(process.env.JOBS_GREENHOUSE_BOARD_LIST_URL ?? '').trim()

  let greenhouseListUrlWarn: string | undefined
  if (boardListUrl) {
    try {
      const extra = await fetchGreenhouseBoardListFromUrl(boardListUrl)
      greenhouseBoards = [...new Set([...greenhouseBoards, ...extra])]
    }
    catch (e: unknown) {
      greenhouseListUrlWarn = `Board list URL: ${e instanceof Error ? e.message : String(e)}`
    }
  }

  /** Run Greenhouse sync when there are tokens or when a list URL was configured (so fetch errors surface in the sync note). */
  const shouldSyncGreenhouse = greenhouseBoards.length > 0 || Boolean(boardListUrl)
  const defaultSources: JobSourceId[] = shouldSyncGreenhouse
    ? [...defaultSourcesBase, 'greenhouse']
    : [...defaultSourcesBase]

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
      else if (src === 'jobicy') {
        rows = await fetchJobicyJobs(100)
      }
      else if (src === 'greenhouse') {
        if (!greenhouseBoards.length) {
          const hint = 'Add tokens (boards.greenhouse.io/{token}), or use keyword `curated` in NUXT_JOBS_GREENHOUSE_BOARDS for a built-in pack, or set NUXT_JOBS_GREENHOUSE_BOARD_LIST_URL to a text file of tokens. Greenhouse has no API to list every company.'
          result.greenhouse = {
            ok: true,
            count: 0,
            note: greenhouseListUrlWarn ? `${greenhouseListUrlWarn} · ${hint}` : hint,
          }
          continue
        }
        const { rows: ghRows, warnings } = await fetchGreenhouseJobs(greenhouseBoards)
        const count = upsertJobRows(ghRows)
        const noteParts: string[] = []
        if (greenhouseListUrlWarn)
          noteParts.push(greenhouseListUrlWarn)
        if (warnings.length) {
          noteParts.push(
            `${warnings.length} board(s) skipped: ${warnings.slice(0, 5).join('; ')}${warnings.length > 5 ? '…' : ''}`,
          )
        }
        result.greenhouse = { ok: true, count, note: noteParts.length ? noteParts.join(' · ') : undefined }
        continue
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
