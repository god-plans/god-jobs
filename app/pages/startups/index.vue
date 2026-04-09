<script setup lang="ts">
import type { Startup } from '~~/shared/startup'

const q = ref('')
const status = ref<string | ''>('')
const sort = ref<'updated' | 'name' | 'priority'>('updated')

const { list, exportUrl } = useStartups()

const debouncedQ = ref('')
let t: ReturnType<typeof setTimeout> | undefined
watch(q, (v) => {
  clearTimeout(t)
  t = setTimeout(() => {
    debouncedQ.value = v
  }, 300)
})

const { data: startups, pending, refresh, error } = await useAsyncData<Startup[]>(
  'startups-list',
  () =>
    list({
      q: debouncedQ.value || undefined,
      status: status.value || undefined,
      sort: sort.value,
    }),
  { watch: [debouncedQ, status, sort] },
)

function priorityClass(row: Startup) {
  if (row.priorityRank === 1) return 'ring-2 ring-amber-400/80 bg-amber-950/40'
  if (row.priorityRank === 2) return 'ring-2 ring-slate-500/80 bg-slate-900/60'
  if (row.priorityRank === 3) return 'ring-2 ring-sky-600/60 bg-sky-950/30'
  return 'hover:bg-slate-900/50'
}

function statusBadge(s: string) {
  const map: Record<string, string> = {
    researched: 'bg-slate-700 text-slate-100',
    contacted: 'bg-indigo-900/80 text-indigo-100',
    replied: 'bg-emerald-900/80 text-emerald-100',
    archived: 'bg-slate-800 text-slate-400',
  }
  return map[s] ?? 'bg-slate-700'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-white">Startups</h1>
        <p class="mt-1 text-sm text-slate-400">
          Track research, contacts, and cold emails. Top 3 priorities are highlighted.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <a
          class="inline-flex items-center rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 hover:bg-slate-700"
          :href="exportUrl('json')"
          download
        >
          Export JSON
        </a>
        <a
          class="inline-flex items-center rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 hover:bg-slate-700"
          :href="exportUrl('csv')"
          download
        >
          Export CSV
        </a>
        <NuxtLink
          to="/startups/new"
          class="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Add startup
        </NuxtLink>
      </div>
    </div>

    <div class="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 sm:flex-row sm:items-center">
      <input
        v-model="q"
        type="search"
        placeholder="Search name, description, stack…"
        class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
      >
      <select
        v-model="status"
        class="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-600 focus:outline-none"
      >
        <option value="">All statuses</option>
        <option value="researched">Researched</option>
        <option value="contacted">Contacted</option>
        <option value="replied">Replied</option>
        <option value="archived">Archived</option>
      </select>
      <select
        v-model="sort"
        class="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-600 focus:outline-none"
      >
        <option value="updated">Sort: Recently updated</option>
        <option value="name">Sort: Name</option>
        <option value="priority">Sort: Priority</option>
      </select>
      <button
        type="button"
        class="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
        @click="refresh()"
      >
        Refresh
      </button>
    </div>

    <p v-if="error" class="text-sm text-red-400">{{ error.message }}</p>
    <p v-else-if="pending" class="text-sm text-slate-400">Loading…</p>

    <div v-else class="overflow-x-auto rounded-xl border border-slate-800">
      <table class="min-w-full divide-y divide-slate-800 text-left text-sm">
        <thead class="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th class="px-4 py-3">Priority</th>
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Stage</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Updated</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800">
          <tr
            v-for="row in startups ?? []"
            :key="row.id"
            :class="['transition-colors', priorityClass(row)]"
          >
            <td class="px-4 py-3 text-slate-300">
              <span v-if="row.priorityRank" class="font-mono text-amber-200">P{{ row.priorityRank }}</span>
              <span v-else class="text-slate-600">—</span>
            </td>
            <td class="px-4 py-3">
              <NuxtLink :to="`/startups/${row.id}`" class="font-medium text-emerald-400 hover:text-emerald-300">
                {{ row.name }}
              </NuxtLink>
              <div v-if="row.website" class="truncate text-xs text-slate-500">
                {{ row.website }}
              </div>
            </td>
            <td class="max-w-xs truncate px-4 py-3 text-slate-400">
              {{ row.fundingStage || '—' }}
            </td>
            <td class="px-4 py-3">
              <span class="rounded-full px-2 py-0.5 text-xs" :class="statusBadge(row.status)">
                {{ row.status }}
              </span>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-slate-500">
              {{ row.updatedAt?.slice(0, 10) }}
            </td>
          </tr>
        </tbody>
      </table>
      <p
        v-if="!pending && startups && startups.length === 0"
        class="px-4 py-8 text-center text-sm text-slate-500"
      >
        No startups yet. Add one or adjust filters.
      </p>
    </div>
  </div>
</template>
