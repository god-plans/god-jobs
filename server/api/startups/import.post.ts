import { readBody, readMultipartFormData, readRawBody, getRequestHeader } from 'h3'
import Papa from 'papaparse'
import { startups } from '../../database/schema'
import { insertStartupSchema } from '../../utils/startup-validation'
import { useDb } from '../../utils/db'
import { nowIso } from '../../utils/timestamps'

/** CSV headers (snake_case) -> insertStartupSchema field names */
const HEADER_MAP: Record<string, string> = {
  name: 'name',
  website: 'website',
  description: 'description',
  funding_stage: 'fundingStage',
  funding_info: 'fundingInfo',
  employee_range: 'employeeRange',
  growth_signals: 'growthSignals',
  ceo_name: 'ceoName',
  ceo_linkedin: 'ceoLinkedin',
  cto_name: 'ctoName',
  cto_linkedin: 'ctoLinkedin',
  improvement_idea: 'improvementIdea',
  cold_email: 'coldEmail',
  notes: 'notes',
  tech_stack: 'techStack',
  fit_reason: 'fitReason',
  priority_rank: 'priorityRank',
  contact_email: 'contactEmail',
  email_subject: 'emailSubject',
  status: 'status',
}

function normalizeHeader(h: string) {
  return h.trim().toLowerCase().replace(/\s+/g, '_')
}

/** Map one CSV row (headers normalized to snake_case) to insert payload keys */
function rowToPayload(row: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, rawVal] of Object.entries(row)) {
    const nk = normalizeHeader(k)
    if (nk === 'id') continue
    const field = HEADER_MAP[nk]
    if (!field) continue
    const v = (rawVal ?? '').trim()
    if (v === '') continue
    if (field === 'priorityRank') {
      const n = Number(v)
      if (Number.isFinite(n)) out.priorityRank = n
      continue
    }
    out[field] = v
  }
  return out
}

async function getCsvText(event: import('h3').H3Event) {
  const ct = getRequestHeader(event, 'content-type') || ''
  if (ct.includes('multipart/form-data')) {
    const form = await readMultipartFormData(event)
    const file = form?.find((f) => f.name === 'file' && f.filename)
    if (!file?.data) {
      throw createError({ statusCode: 400, statusMessage: 'Missing multipart field "file"' })
    }
    return file.data.toString('utf-8')
  }
  if (ct.includes('text/csv') || ct.includes('text/plain')) {
    const raw = await readRawBody(event)
    return raw ? raw.toString('utf-8') : ''
  }
  const body = await readBody(event)
  if (typeof body === 'string') return body
  if (body && typeof body === 'object' && 'csv' in body && typeof (body as { csv: unknown }).csv === 'string') {
    return (body as { csv: string }).csv
  }
  throw createError({
    statusCode: 400,
    statusMessage: 'Send multipart/form-data with field "file", JSON { "csv": "..." }, or raw text/csv body',
  })
}

export default defineEventHandler(async (event) => {
  const text = await getCsvText(event)
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => normalizeHeader(h),
  })

  if (parsed.errors.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'CSV parse error',
      data: parsed.errors.slice(0, 5),
    })
  }

  const rows = parsed.data ?? []
  const db = useDb()
  const inserted: { id: number; name: string }[] = []
  const errors: { row: number; message: string }[] = []

  for (let i = 0; i < rows.length; i++) {
    const payload = rowToPayload(rows[i]!)
    const checked = insertStartupSchema.safeParse(payload)
    if (!checked.success) {
      errors.push({ row: i + 2, message: JSON.stringify(checked.error.flatten()) })
      continue
    }
    const body = checked.data
    const ts = nowIso()
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
      contactEmail: body.contactEmail ?? null,
      emailSubject: body.emailSubject ?? null,
      lastOutreachAt: null,
      lastOutreachError: null,
      priorityRank: body.priorityRank ?? null,
      status: body.status ?? 'researched',
      createdAt: ts,
      updatedAt: ts,
    }
    const ins = db.insert(startups).values(row).returning({ id: startups.id, name: startups.name }).all()
    const first = ins[0]
    if (first) inserted.push(first)
  }

  return { imported: inserted.length, rows: inserted, errors }
})
