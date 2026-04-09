import type { Startup } from '~~/shared/startup'

export function useStartups() {
  async function list(params?: { q?: string; status?: string; sort?: string }) {
    return await $fetch<Startup[]>('/api/startups', { query: params })
  }

  async function get(id: number) {
    return await $fetch<Startup>(`/api/startups/${id}`)
  }

  async function create(body: Record<string, unknown>) {
    return await $fetch<Startup>('/api/startups', { method: 'POST', body })
  }

  async function update(id: number, body: Record<string, unknown>) {
    return await $fetch<Startup>(`/api/startups/${id}`, { method: 'PATCH', body })
  }

  async function remove(id: number) {
    await $fetch(`/api/startups/${id}`, { method: 'DELETE' })
  }

  function exportUrl(format: 'json' | 'csv') {
    return `/api/export/startups?format=${format}`
  }

  async function importCsv(file: File) {
    const form = new FormData()
    form.append('file', file)
    return await $fetch<{ imported: number; rows: { id: number; name: string }[]; errors: { row: number; message: string }[] }>(
      '/api/startups/import',
      { method: 'POST', body: form },
    )
  }

  async function fetchDiscovery(body: { type: 'github' | 'hn'; q: string; limit?: number }) {
    return await $fetch<{ count: number; created: { id: number; name: string }[] }>('/api/fetch/startups', {
      method: 'POST',
      body,
    })
  }

  async function sendOutreach(startupIds: number[], delayMs?: number) {
    return await $fetch<{ results: { id: number; ok: boolean; error?: string }[] }>('/api/outreach/send', {
      method: 'POST',
      body: { startupIds, delayMs },
    })
  }

  return { list, get, create, update, remove, exportUrl, importCsv, fetchDiscovery, sendOutreach }
}
