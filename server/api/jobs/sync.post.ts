import { readBody } from 'h3'
import { z } from 'zod'
import {
  fetchArbeitnowJobs,
  fetchHnJobs,
  fetchRemotiveJobs,
  type JobSourceId,
} from '../../utils/jobs/connectors'
import { upsertJobRows } from '../../utils/jobs/upsert'

const bodySchema = z.object({
  sources: z.array(z.enum(['remotive', 'arbeitnow', 'hn'])).optional(),
  query: z.string().optional(),
  hnHitsPerPage: z.number().int().min(1).max(50).optional(),
})

export default defineEventHandler(async (event) => {
  const raw = await readBody(event)
  const parsed = bodySchema.safeParse(raw ?? {})
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', data: parsed.error.flatten() })
  }
  const { sources, query, hnHitsPerPage } = parsed.data
  const want: JobSourceId[] = sources?.length
    ? (sources as JobSourceId[])
    : ['remotive', 'arbeitnow', 'hn']

  const result: Record<string, { ok: boolean; count?: number; error?: string }> = {}

  for (const src of want) {
    try {
      let rows = []
      if (src === 'remotive') {
        rows = await fetchRemotiveJobs()
      }
      else if (src === 'arbeitnow') {
        rows = await fetchArbeitnowJobs()
      }
      else {
        rows = await fetchHnJobs(query ?? 'remote developer hiring', hnHitsPerPage ?? 30)
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
