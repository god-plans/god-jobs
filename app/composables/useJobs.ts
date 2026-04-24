import type { JobListing } from '~~/shared/job'

export type JobsListResponse = {
  jobs: JobListing[]
  meta: { lastSync: string | null; total: number; limit: number; offset: number }
}

export type WorkplaceFilter = 'any' | 'remote' | 'onsite'

export function useJobs() {
  async function list(params?: {
    source?: string
    q?: string
    /** Prefer over legacy `remote`; maps to `workplace` query param. */
    workplace?: WorkplaceFilter
    company?: string
    location?: string
    postedAfter?: string
    postedBefore?: string
    category?: string
    sort?: 'updatedAt' | 'postedAt'
    order?: 'asc' | 'desc'
    limit?: number
    offset?: number
  }) {
    const { workplace, ...rest } = params ?? {}
    const query: Record<string, string | number | boolean | undefined> = { ...rest }
    if (workplace && workplace !== 'any') {
      query.workplace = workplace
    }
    return await $fetch<JobsListResponse>('/api/jobs', { query })
  }

  async function sync(body?: {
    sources?: ('remotive' | 'arbeitnow' | 'hn' | 'remoteok' | 'rss' | 'jobicy' | 'greenhouse')[]
    query?: string
    hnHitsPerPage?: number
    rssFeedUrls?: string[]
  }) {
    return await $fetch<{ result: Record<string, { ok: boolean; count?: number; error?: string; note?: string }>; syncedAt: string }>(
      '/api/jobs/sync',
      { method: 'POST', body: body ?? {} },
    )
  }

  return { list, sync }
}
