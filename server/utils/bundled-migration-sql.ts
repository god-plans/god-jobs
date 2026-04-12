/**
 * Bundled copies of `server/database/migrations/*.sql` for Netlify/serverless where the
 * migrations folder is not on disk. Keep in sync when you add migrations.
 */
export const BUNDLED_SQL: Record<string, string> = {
  '0000_init': `CREATE TABLE \`startups\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`name\` text NOT NULL,
	\`website\` text,
	\`description\` text,
	\`funding_stage\` text,
	\`funding_info\` text,
	\`employee_range\` text,
	\`growth_signals\` text,
	\`ceo_name\` text,
	\`ceo_linkedin\` text,
	\`cto_name\` text,
	\`cto_linkedin\` text,
	\`improvement_idea\` text,
	\`cold_email\` text,
	\`notes\` text,
	\`tech_stack\` text,
	\`fit_reason\` text,
	\`priority_rank\` integer,
	\`status\` text DEFAULT 'researched' NOT NULL,
	\`created_at\` text NOT NULL,
	\`updated_at\` text NOT NULL
);
`,
  '0001_outreach_and_jobs': `CREATE TABLE \`job_listings\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`source\` text NOT NULL,
	\`external_id\` text NOT NULL,
	\`title\` text NOT NULL,
	\`company\` text,
	\`url\` text NOT NULL,
	\`location\` text,
	\`remote\` integer,
	\`posted_at\` text,
	\`snippet\` text,
	\`raw_json\` text,
	\`created_at\` text NOT NULL,
	\`updated_at\` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX \`job_listings_source_external\` ON \`job_listings\` (\`source\`,\`external_id\`);--> statement-breakpoint
ALTER TABLE \`startups\` ADD \`contact_email\` text;--> statement-breakpoint
ALTER TABLE \`startups\` ADD \`email_subject\` text;--> statement-breakpoint
ALTER TABLE \`startups\` ADD \`last_outreach_at\` text;--> statement-breakpoint
ALTER TABLE \`startups\` ADD \`last_outreach_error\` text;`,
}
