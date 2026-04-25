export type JobFiltersModel = {
  source: string
  q: string
  workplace: 'any' | 'remote' | 'onsite'
  company: string
  location: string
  postedAfter: string
  postedBefore: string
  category: string
  sortField: 'updatedAt' | 'postedAt'
  sortOrder: 'asc' | 'desc'
}
