/** Row shape for insert/upsert into job_listings (timestamps added by caller) */
export type NewJobListing = {
  source: string
  externalId: string
  title: string
  company: string | null
  url: string
  location: string | null
  remote: boolean | null
  postedAt: string | null
  snippet: string | null
  rawJson: string | null
}
