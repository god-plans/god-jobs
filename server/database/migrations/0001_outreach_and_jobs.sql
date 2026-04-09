CREATE TABLE `job_listings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source` text NOT NULL,
	`external_id` text NOT NULL,
	`title` text NOT NULL,
	`company` text,
	`url` text NOT NULL,
	`location` text,
	`remote` integer,
	`posted_at` text,
	`snippet` text,
	`raw_json` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `job_listings_source_external` ON `job_listings` (`source`,`external_id`);--> statement-breakpoint
ALTER TABLE `startups` ADD `contact_email` text;--> statement-breakpoint
ALTER TABLE `startups` ADD `email_subject` text;--> statement-breakpoint
ALTER TABLE `startups` ADD `last_outreach_at` text;--> statement-breakpoint
ALTER TABLE `startups` ADD `last_outreach_error` text;