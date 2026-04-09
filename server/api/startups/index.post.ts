import { readBody } from 'h3'
import { startups } from '../../database/schema'
import { insertStartupSchema } from '../../utils/startup-validation'
import { useDb } from '../../utils/db'
import { nowIso } from '../../utils/timestamps'

export default defineEventHandler(async (event) => {
  const raw = await readBody(event)
  const parsed = insertStartupSchema.safeParse(raw)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', data: parsed.error.flatten() })
  }
  const body = parsed.data
  const ts = nowIso()
  const db = useDb()
  const row = {
    name: body.name,
    website: body.website ?? null,
    description: body.description ?? null,
    fundingStage: body.fundingStage ?? null,
    fundingInfo: body.fundingInfo ?? null,
    employeeRange: body.employeeRange ?? null,
    growthSignals: body.growthSignals ?? null,
    ceoName: body.ceoName ?? null,
    ceoLinkedin: body.ceoLinkedin ?? null,
    ctoName: body.ctoName ?? null,
    ctoLinkedin: body.ctoLinkedin ?? null,
    improvementIdea: body.improvementIdea ?? null,
    coldEmail: body.coldEmail ?? null,
    notes: body.notes ?? null,
    techStack: body.techStack ?? null,
    fitReason: body.fitReason ?? null,
    priorityRank: body.priorityRank ?? null,
    status: body.status ?? 'researched',
    createdAt: ts,
    updatedAt: ts,
  }
  const inserted = db.insert(startups).values(row).returning().all()
  return inserted[0]
})
