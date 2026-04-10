import type { JobListing } from '~~/shared/job'

export type JobsListResponse = {
  jobs: JobListing[]
  meta: { lastSync: string | null; total: number; limit: number; offset: number }
}

export function useJobs() {
  async function list(params?: {
    source?: string
    q?: string
    remote?: boolean
    limit?: number
    offset?: number
  }) {
    return await $fetch<JobsListResponse>('/api/jobs', { query: params as Record<string, string | number | boolean | undefined> })
  }

  async function sync(body?: {
    sources?: ('remotive' | 'arbeitnow' | 'hn' | 'remoteok' | 'rss')[]
    query?: string
    hnHitsPerPage?: number
    rssFeedUrls?: string[]
  }) {
    return await $fetch<{ result: Record<string, { ok: boolean; count?: number; error?: string }>; syncedAt: string }>(
      '/api/jobs/sync',
      { method: 'POST', body: body ?? {} },
    )
  }

  return { list, sync }
}
