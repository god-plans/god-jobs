import { readBody } from 'h3'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { startups } from '../../database/schema'
import { useDb } from '../../utils/db'
import { delay } from '../../utils/delay'
import { sendMail, isMailConfigured } from '../../utils/mail'
import { nowIso } from '../../utils/timestamps'

const bodySchema = z.object({
  startupIds: z.array(z.number().int().positive()).min(1),
  delayMs: z.number().int().min(400).max(120_000).optional(),
})

const DEFAULT_DELAY_MS = 2500

export default defineEventHandler(async (event) => {
  if (!isMailConfigured()) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Mail not configured',
      message: 'Set SMTP_* and MAIL_FROM environment variables.',
    })
  }

  const raw = await readBody(event)
  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', data: parsed.error.flatten() })
  }
  const { startupIds, delayMs } = parsed.data
  const wait = delayMs ?? DEFAULT_DELAY_MS
  const db = useDb()
  const defaultSubject = process.env.OUTREACH_SUBJECT || 'Introduction'

  const results: { id: number; ok: boolean; error?: string }[] = []

  for (const id of startupIds) {
    const row = db.select().from(startups).where(eq(startups.id, id)).get()
    if (!row) {
      results.push({ id, ok: false, error: 'not found' })
      continue
    }
    if (!row.contactEmail?.trim()) {
      results.push({ id, ok: false, error: 'missing contactEmail' })
      continue
    }
    if (!row.coldEmail?.trim()) {
      results.push({ id, ok: false, error: 'missing coldEmail body' })
      continue
    }

    const subject = (row.emailSubject?.trim() || defaultSubject).slice(0, 200)

    try {
      await sendMail({
        to: row.contactEmail.trim(),
        subject,
        text: row.coldEmail,
      })
      const ts = nowIso()
      db.update(startups)
        .set({
          status: 'contacted',
          lastOutreachAt: ts,
          lastOutreachError: null,
          updatedAt: ts,
        })
        .where(eq(startups.id, id))
        .run()
      results.push({ id, ok: true })
    }
    catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      const ts = nowIso()
      db.update(startups)
        .set({
          lastOutreachError: msg,
          updatedAt: ts,
        })
        .where(eq(startups.id, id))
        .run()
      results.push({ id, ok: false, error: msg })
    }

    await delay(wait)
  }

  return { results }
})
