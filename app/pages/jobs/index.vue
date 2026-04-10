<script setup lang="ts">
import type { JobListing } from '~~/shared/job'

const source = ref<string | ''>('')
const q = ref('')
const remoteOnly = ref(false)
const page = ref(1)
const pageSize = ref(50)

const { list, sync } = useJobs()

const debouncedQ = ref('')
let qt: ReturnType<typeof setTimeout> | undefined
watch(q, (v) => {
  clearTimeout(qt)
  qt = setTimeout(() => {
    debouncedQ.value = v
  }, 350)
})

watch([source, remoteOnly, debouncedQ], () => {
  page.value = 1
})

watch(pageSize, () => {
  page.value = 1
})

const { data, pending, refresh, error } = await useAsyncData(
  'jobs-list',
  () =>
    list({
      source: source.value || undefined,
      q: debouncedQ.value.trim() || undefined,
      remote: remoteOnly.value || undefined,
      limit: pageSize.value,
      offset: (page.value - 1) * pageSize.value,
    }),
  { watch: [source, remoteOnly, debouncedQ, page, pageSize] },
)

const total = computed(() => data.value?.meta?.total ?? 0)
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const showingFrom = computed(() => (total.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1))
const showingTo = computed(() => Math.min(page.value * pageSize.value, total.value))

function goPrev() {
  page.value = Math.max(1, page.value - 1)
}

function goNext() {
  page.value = Math.min(pageCount.value, page.value + 1)
}

watch([total, pageCount], () => {
  if (page.value > pageCount.value) page.value = Math.max(1, pageCount.value)
})

const syncing = ref(false)
const syncMsg = ref('')

async function runSync() {
  syncMsg.value = ''
  syncing.value = true
  try {
    const res = await sync({})
    const parts = Object.entries(res.result).map(([k, v]) =>
      v.ok ? `${k}: ${v.count ?? 0}` : `${k}: error ${v.error}`,
    )
    syncMsg.value = parts.join(' · ')
    await refresh()
  }
  catch (e: unknown) {
    syncMsg.value = e instanceof Error ? e.message : 'Sync failed'
  }
  finally {
    syncing.value = false
  }
}

function remoteLabel(job: JobListing) {
  if (job.remote === true || job.remote === 1) return 'Remote'
  if (job.remote === false || job.remote === 0) return 'On-site'
  return '—'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-white">Jobs</h1>
        <p class="mt-1 text-sm text-slate-400">
          Remotive, Arbeitnow, Remote OK, filtered HN Algolia, and optional RSS (e.g. Telegram via
          <a
            href="https://github.com/DIYgod/RSSHub"
            class="text-emerald-500 underline hover:text-emerald-400"
            target="_blank"
            rel="noopener noreferrer"
          >RSSHub</a>).
          Without <code class="rounded bg-slate-800 px-1 text-xs">NUXT_JOBS_RSS_FEEDS</code>, RSS sync uses a default public feed (We Work Remotely). Export:
          <a href="/api/export/jobs" class="text-emerald-500 hover:text-emerald-400">JSON</a>
          ·
          <a href="/api/export/jobs?format=csv" class="text-emerald-500 hover:text-emerald-400">CSV</a>.
        </p>
        <p v-if="data?.meta?.lastSync" class="mt-1 text-xs text-slate-500">
          Last row update: {{ data.meta.lastSync }} · Total (filtered): {{ data.meta.total }}
        </p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        :disabled="syncing"
        @click="runSync"
      >
        {{ syncing ? 'Syncing…' : 'Sync jobs now' }}
      </button>
    </div>

    <p v-if="syncMsg" class="text-sm text-slate-300">{{ syncMsg }}</p>
    <p v-if="error" class="text-sm text-red-400">{{ error.message }}</p>

    <div class="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4 sm:flex-row sm:items-center">
      <input
        v-model="q"
        type="search"
        placeholder="Search title, company, snippet…"
        class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
      >
      <select
        v-model="source"
        class="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
      >
        <option value="">All sources</option>
        <option value="remotive">Remotive</option>
        <option value="arbeitnow">Arbeitnow</option>
        <option value="hn">Hacker News</option>
        <option value="remoteok">Remote OK</option>
        <option value="rss">RSS (Telegram, etc.)</option>
      </select>
      <label class="flex items-center gap-2 text-sm text-slate-300">
        <input v-model="remoteOnly" type="checkbox" class="rounded border-slate-600">
        Remote only
      </label>
      <button
        type="button"
        class="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
        @click="refresh()"
      >
        Refresh
      </button>
    </div>

    <div class="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm text-slate-400">
        <span v-if="total > 0">Showing {{ showingFrom }}–{{ showingTo }} of {{ total }}</span>
        <span v-else>No matching rows</span>
      </p>
      <div class="flex flex-wrap items-center gap-2">
        <label class="flex items-center gap-2 text-sm text-slate-400">
          Per page
          <select
            v-model.number="pageSize"
            class="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-white"
          >
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="80">80</option>
            <option :value="100">100</option>
            <option :value="200">200</option>
          </select>
        </label>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="pending || page <= 1"
            @click="goPrev"
          >
            Previous
          </button>
          <span class="px-2 text-sm tabular-nums text-slate-400">
            {{ page }} / {{ pageCount }}
          </span>
          <button
            type="button"
            class="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="pending || page >= pageCount || total === 0"
            @click="goNext"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <p v-if="pending" class="text-sm text-slate-400">Loading…</p>

    <div v-else class="overflow-x-auto rounded-xl border border-slate-800">
      <table class="min-w-full divide-y divide-slate-800 text-left text-sm">
        <thead class="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th class="px-4 py-3">Source</th>
            <th class="px-4 py-3">Title</th>
            <th class="px-4 py-3">Company</th>
            <th class="px-4 py-3">Remote</th>
            <th class="px-4 py-3">Location</th>
            <th class="px-4 py-3">Updated</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800">
          <tr v-for="job in data?.jobs ?? []" :key="`${job.source}-${job.externalId}`" class="hover:bg-slate-900/40">
            <td class="whitespace-nowrap px-4 py-2 font-mono text-xs text-slate-500">{{ job.source }}</td>
            <td class="max-w-md px-4 py-2">
              <a :href="job.url" target="_blank" rel="noopener noreferrer" class="font-medium text-emerald-400 hover:text-emerald-300">
                {{ job.title }}
              </a>
              <p v-if="job.snippet" class="mt-1 line-clamp-2 text-xs text-slate-500">{{ job.snippet }}</p>
            </td>
            <td class="px-4 py-2 text-slate-300">{{ job.company || '—' }}</td>
            <td class="px-4 py-2 text-slate-400">{{ remoteLabel(job) }}</td>
            <td class="max-w-xs truncate px-4 py-2 text-slate-500">{{ job.location || '—' }}</td>
            <td class="whitespace-nowrap px-4 py-2 text-xs text-slate-500">{{ job.updatedAt?.slice(0, 16) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!pending && (data?.jobs?.length ?? 0) === 0" class="px-4 py-8 text-center text-sm text-slate-500">
        No jobs yet. Click “Sync jobs now”, then refresh.
      </p>
    </div>
  </div>
</template>
