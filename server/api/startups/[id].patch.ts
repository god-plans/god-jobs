import { eq } from 'drizzle-orm'
import { readBody, getRouterParam } from 'h3'
import { startups } from '../../database/schema'
import { updateStartupSchema } from '../../utils/startup-validation'
import { useDb } from '../../utils/db'
import { nowIso } from '../../utils/timestamps'

export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)
  if (!Number.isFinite(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  }
  const raw = await readBody(event)
  const parsed = updateStartupSchema.safeParse(raw)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', data: parsed.error.flatten() })
  }
  const body = parsed.data
  if (Object.keys(body).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }

  const db = useDb()
  const existing = db.select().from(startups).where(eq(startups.id, id)).get()
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const patch: Record<string, unknown> = { ...body, updatedAt: nowIso() }
  for (const key of Object.keys(patch)) {
    if (patch[key] === undefined) delete patch[key]
  }

  const updated = db
    .update(startups)
    .set(patch as Record<string, never>)
    .where(eq(startups.id, id))
    .returning()
    .all()
  return updated[0]
})
