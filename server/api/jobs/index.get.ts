import { and, asc, desc, eq, like, or, sql } from 'drizzle-orm'
import { getQuery } from 'h3'
import { getCategoryPreset } from '../../../shared/jobCategoryPresets'
import { jobListings } from '../../database/schema'
import { useDb } from '../../utils/db'

function escapeLike(value: string) {
  return `%${value.replace(/\\/g, '\\\\').replace(/%/g, '\\%')}%`
}

export default defineEventHandler((event) => {
  const q = getQuery(event)
  const source = typeof q.source === 'string' ? q.source.trim() : ''
  const search = typeof q.q === 'string' ? q.q.trim() : ''
  const companyFilter = typeof q.company === 'string' ? q.company.trim() : ''
  const locationFilter = typeof q.location === 'string' ? q.location.trim() : ''
  const postedAfter = typeof q.postedAfter === 'string' ? q.postedAfter.trim() : ''
  const postedBefore = typeof q.postedBefore === 'string' ? q.postedBefore.trim() : ''
  const categoryId = typeof q.category === 'string' ? q.category.trim() : ''
  const sortRaw = typeof q.sort === 'string' ? q.sort.trim().toLowerCase() : 'updatedat'
  const orderRaw = typeof q.order === 'string' ? q.order.trim().toLowerCase() : 'desc'
  const workplaceRaw = typeof q.workplace === 'string' ? q.workplace.trim().toLowerCase() : ''

  const limit = Math.min(200, Math.max(1, Number(q.limit) || 50))
  const offset = Math.max(0, Number(q.offset) || 0)

  const sort = sortRaw === 'postedat' ? 'postedAt' : 'updatedAt'
  const order = orderRaw === 'asc' ? 'asc' : 'desc'

  /** `workplace=remote|onsite|any` — if omitted, legacy `remote=1` still means remote-only. */
  let workplace: 'any' | 'remote' | 'onsite' = 'any'
  if (workplaceRaw === 'remote' || workplaceRaw === 'onsite' || workplaceRaw === 'any') {
    workplace = workplaceRaw === 'any' ? 'any' : workplaceRaw
  }
  else if (q.remote === '1' || q.remote === 'true') {
    workplace = 'remote'
  }

  const db = useDb()
  const conditions = []

  if (source) {
    conditions.push(eq(jobListings.source, source))
  }

  if (workplace === 'remote') {
    conditions.push(eq(jobListings.remote, true))
  }
  else if (workplace === 'onsite') {
    conditions.push(eq(jobListings.remote, false))
  }

  if (search) {
    const pattern = escapeLike(search)
    conditions.push(
      or(
        like(jobListings.title, pattern),
        like(jobListings.company, pattern),
        like(jobListings.snippet, pattern),
      ),
    )
  }

  if (companyFilter) {
    conditions.push(like(jobListings.company, escapeLike(companyFilter)))
  }

  if (locationFilter) {
    conditions.push(like(jobListings.location, escapeLike(locationFilter)))
  }

  if (postedAfter) {
    conditions.push(sql`${jobListings.postedAt} >= ${postedAfter}`)
  }

  if (postedBefore) {
    const boundary = postedBefore.length === 10 ? `${postedBefore}T23:59:59.999Z` : postedBefore
    conditions.push(sql`${jobListings.postedAt} <= ${boundary}`)
  }

  const preset = categoryId ? getCategoryPreset(categoryId) : undefined
  if (preset && preset.keywords.length) {
    const keywordOrs = preset.keywords.flatMap((kw) => {
      const pattern = escapeLike(kw)
      return [
        like(jobListings.title, pattern),
        like(jobListings.snippet, pattern),
        like(jobListings.company, pattern),
      ]
    })
    conditions.push(or(...keywordOrs))
  }

  const where = conditions.length ? and(...conditions) : undefined

  const orderByClause =
    sort === 'postedAt'
      ? order === 'asc'
        ? [asc(sql`${jobListings.postedAt} IS NULL`), asc(jobListings.postedAt)]
        : [asc(sql`${jobListings.postedAt} IS NULL`), desc(jobListings.postedAt)]
      : order === 'asc'
        ? [asc(jobListings.updatedAt)]
        : [desc(jobListings.updatedAt)]

  const rows = db
    .select()
    .from(jobListings)
    .where(where)
    .orderBy(...orderByClause)
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
