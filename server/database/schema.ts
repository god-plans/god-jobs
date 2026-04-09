import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

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
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export type Startup = typeof startups.$inferSelect
export type NewStartup = typeof startups.$inferInsert
