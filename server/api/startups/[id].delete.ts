import { eq } from 'drizzle-orm'
import { getRouterParam } from 'h3'
import { startups } from '../../database/schema'
import { useDb } from '../../utils/db'

export default defineEventHandler((event) => {
  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)
  if (!Number.isFinite(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }
  const db = useDb()
  const existing = db.select().from(startups).where(eq(startups.id, id)).get()
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  db.delete(startups).where(eq(startups.id, id)).run()
  setResponseStatus(event, 204)
  return null
})
