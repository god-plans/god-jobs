import { and, desc, eq, like, or, sql } from 'drizzle-orm'
import { getQuery } from 'h3'
import { jobListings } from '../../database/schema'
import { useDb } from '../../utils/db'

export default defineEventHandler((event) => {
  const q = getQuery(event)
  const source = typeof q.source === 'string' ? q.source.trim() : ''
  const search = typeof q.q === 'string' ? q.q.trim() : ''
  const remoteOnly = q.remote === '1' || q.remote === 'true'
  const limit = Math.min(200, Math.max(1, Number(q.limit) || 50))
  const offset = Math.max(0, Number(q.offset) || 0)

  const db = useDb()
  const conditions = []

  if (source) {
    conditions.push(eq(jobListings.source, source))
  }
  if (remoteOnly) {
    conditions.push(eq(jobListings.remote, true))
  }
  if (search) {
    const pattern = `%${search.replace(/%/g, '\\%')}%`
    conditions.push(
      or(
        like(jobListings.title, pattern),
        like(jobListings.company, pattern),
        like(jobListings.snippet, pattern),
      ),
    )
  }

  const where = conditions.length ? and(...conditions) : undefined

  const rows = db
    .select()
    .from(jobListings)
    .where(where)
    .orderBy(desc(jobListings.updatedAt))
    .limit(limit)
    .offset(offset)
    .all()

  const totalRow = db
    .select({ n: sql<number>`count(*)` })
    .from(jobListings)
    .where(where)
    .get()

  const lastSyncRow = db
    .select({ m: sql<string | null>`max(${jobListings.updatedAt})` })
    .from(jobListings)
    .get()

  return {
    jobs: rows,
    meta: {
      lastSync: lastSyncRow?.m ?? null,
      total: totalRow?.n ?? 0,
      limit,
      offset,
    },
  }
})
