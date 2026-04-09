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

  return { list, get, create, update, remove, exportUrl }
}
