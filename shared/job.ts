export interface JobListing {
  id: number
  source: string
  externalId: string
  title: string
  company: string | null
  url: string
  location: string | null
  remote: boolean | number | null
  postedAt: string | null
  snippet: string | null
  rawJson: string | null
  createdAt: string
  updatedAt: string
}
