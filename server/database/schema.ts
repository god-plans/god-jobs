import { sqliteTable, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const startups = sqliteTable('startups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  website: text('website'),
  description: text('description'),
  fundingStage: text('funding_stage'),
  fundingInfo: text('funding_info'),
  employeeRange: text('employee_range'),
  growthSignals: text('growth_signals'),
  ceoName: text('ceo_name'),
  ceoLinkedin: text('ceo_linkedin'),
  ctoName: text('cto_name'),
  ctoLinkedin: text('cto_linkedin'),
  improvementIdea: text('improvement_idea'),
  coldEmail: text('cold_email'),
  notes: text('notes'),
  techStack: text('tech_stack'),
  fitReason: text('fit_reason'),
  /** 1–3 = top priority slots; null = not prioritized */
  priorityRank: integer('priority_rank'),
  status: text('status').notNull().default('researched'),
  /** Verified recipient for outreach */
  contactEmail: text('contact_email'),
  emailSubject: text('email_subject'),
  lastOutreachAt: text('last_outreach_at'),
  lastOutreachError: text('last_outreach_error'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export type Startup = typeof startups.$inferSelect
export type NewStartup = typeof startups.$inferInsert

export const jobListings = sqliteTable(
  'job_listings',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    source: text('source').notNull(),
    externalId: text('external_id').notNull(),
    title: text('title').notNull(),
    company: text('company'),
    url: text('url').notNull(),
    location: text('location'),
    remote: integer('remote', { mode: 'boolean' }),
    postedAt: text('posted_at'),
    snippet: text('snippet'),
    rawJson: text('raw_json'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [uniqueIndex('job_listings_source_external').on(table.source, table.externalId)],
)

export type JobListing = typeof jobListings.$inferSelect
