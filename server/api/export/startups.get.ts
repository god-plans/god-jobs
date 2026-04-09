import { getQuery, setResponseHeader } from 'h3'
import { startups, type Startup } from '../../database/schema'
import { useDb } from '../../utils/db'

function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

const COLUMNS: { key: keyof Startup; label: string }[] = [
  { key: 'id', label: 'id' },
  { key: 'name', label: 'name' },
  { key: 'website', label: 'website' },
  { key: 'description', label: 'description' },
  { key: 'fundingStage', label: 'funding_stage' },
  { key: 'fundingInfo', label: 'funding_info' },
  { key: 'employeeRange', label: 'employee_range' },
  { key: 'growthSignals', label: 'growth_signals' },
  { key: 'ceoName', label: 'ceo_name' },
  { key: 'ceoLinkedin', label: 'ceo_linkedin' },
  { key: 'ctoName', label: 'cto_name' },
  { key: 'ctoLinkedin', label: 'cto_linkedin' },
  { key: 'improvementIdea', label: 'improvement_idea' },
  { key: 'coldEmail', label: 'cold_email' },
  { key: 'notes', label: 'notes' },
  { key: 'techStack', label: 'tech_stack' },
  { key: 'fitReason', label: 'fit_reason' },
  { key: 'contactEmail', label: 'contact_email' },
  { key: 'emailSubject', label: 'email_subject' },
  { key: 'lastOutreachAt', label: 'last_outreach_at' },
  { key: 'lastOutreachError', label: 'last_outreach_error' },
  { key: 'priorityRank', label: 'priority_rank' },
  { key: 'status', label: 'status' },
  { key: 'createdAt', label: 'created_at' },
  { key: 'updatedAt', label: 'updated_at' },
]

export default defineEventHandler((event) => {
  const q = getQuery(event)
  const format = typeof q.format === 'string' ? q.format.toLowerCase() : 'json'
  const db = useDb()
  const rows = db.select().from(startups).all()

  if (format === 'csv') {
    const header = COLUMNS.map((c) => csvEscape(c.label)).join(',')
    const lines = rows.map((row) =>
      COLUMNS.map((c) => csvEscape(String(row[c.key] ?? ''))).join(','),
    )
    const body = [header, ...lines].join('\n')
    setResponseHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setResponseHeader(event, 'Content-Disposition', 'attachment; filename="startups.csv"')
    return body
  }

  setResponseHeader(event, 'Content-Type', 'application/json; charset=utf-8')
  setResponseHeader(event, 'Content-Disposition', 'attachment; filename="startups.json"')
  return JSON.stringify(rows, null, 2)
})
