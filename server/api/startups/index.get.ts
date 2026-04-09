import { and, asc, desc, eq, like, or, sql } from 'drizzle-orm'
import { getQuery } from 'h3'
import { startups } from '../../database/schema'
import { useDb } from '../../utils/db'

export default defineEventHandler((event) => {
  const q = getQuery(event)
  const search = typeof q.q === 'string' ? q.q.trim() : ''
  const status = typeof q.status === 'string' ? q.status.trim() : ''
  const sort = typeof q.sort === 'string' ? q.sort : 'updated'

  const db = useDb()
  const conditions = []

  if (search) {
    const pattern = `%${search.replace(/%/g, '\\%')}%`
    conditions.push(
      or(like(startups.name, pattern), like(startups.description, pattern), like(startups.techStack, pattern)),
    )
  }
  if (status && ['researched', 'contacted', 'replied', 'archived'].includes(status)) {
    conditions.push(eq(startups.status, status))
  }

  const where = conditions.length ? and(...conditions) : undefined

  const orderBy =
    sort === 'name'
      ? [asc(startups.name)]
      : sort === 'priority'
        ? [sql`${startups.priorityRank} IS NULL`, asc(startups.priorityRank)]
        : [desc(startups.updatedAt)]

  return db.select().from(startups).where(where).orderBy(...orderBy).all()
})
