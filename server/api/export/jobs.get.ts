import { desc } from 'drizzle-orm'
import { getQuery, setResponseHeader } from 'h3'
import { jobListings, type JobListing } from '../../database/schema'
import { useDb } from '../../utils/db'
import { stripHtml } from '../../utils/jobs/text'

function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

const COLUMNS: { key: keyof JobListing; label: string; format?: (v: unknown) => string }[] = [
  { key: 'id', label: 'id' },
  { key: 'source', label: 'source' },
  { key: 'externalId', label: 'external_id' },
  { key: 'title', label: 'title' },
  { key: 'company', label: 'company' },
  { key: 'url', label: 'url' },
  { key: 'location', label: 'location' },
  { key: 'remote', label: 'remote', format: (v) => (v === true || v === 1 ? 'true' : v === false || v === 0 ? 'false' : '') },
  { key: 'postedAt', label: 'posted_at' },
  {
    key: 'snippet',
    label: 'snippet',
    format: (v) => stripHtml(typeof v === 'string' ? v : ''),
  },
  { key: 'createdAt', label: 'created_at' },
  { key: 'updatedAt', label: 'updated_at' },
]

export default defineEventHandler((event) => {
  const q = getQuery(event)
  const format = typeof q.format === 'string' ? q.format.toLowerCase() : 'json'
  const db = useDb()
  const rows = db.select().from(jobListings).orderBy(desc(jobListings.updatedAt)).all()

  if (format === 'csv') {
    const header = COLUMNS.map((c) => csvEscape(c.label)).join(',')
    const lines = rows.map((row) =>
      COLUMNS.map((c) => {
        const raw = row[c.key]
        const s = c.format ? c.format(raw) : String(raw ?? '')
        return csvEscape(s)
      }).join(','),
    )
    const body = [header, ...lines].join('\n')
    setResponseHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setResponseHeader(event, 'Content-Disposition', 'attachment; filename="jobs.csv"')
    return body
  }

  const cleaned = rows.map((row) => ({
    ...row,
    snippet: row.snippet ? stripHtml(row.snippet) : row.snippet,
  }))

  setResponseHeader(event, 'Content-Type', 'application/json; charset=utf-8')
  setResponseHeader(event, 'Content-Disposition', 'attachment; filename="jobs.json"')
  return JSON.stringify(cleaned, null, 2)
})
