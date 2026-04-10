<script setup lang="ts">
import type { JobListing } from '~~/shared/job'
import { JOB_CATEGORY_PRESETS } from '~~/shared/jobCategoryPresets'

const source = ref<string | ''>('')
const q = ref('')
const workplace = ref<'any' | 'remote' | 'onsite'>('any')
const company = ref('')
const location = ref('')
const postedAfter = ref('')
const postedBefore = ref('')
const category = ref('')
const sortField = ref<'updatedAt' | 'postedAt'>('updatedAt')
const sortOrder = ref<'asc' | 'desc'>('desc')
const moreFiltersOpen = ref(false)
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

watch(debouncedQ, (v) => {
  if (v.trim()) category.value = ''
})

watch(
  [source, workplace, company, location, postedAfter, postedBefore, category, sortField, sortOrder, debouncedQ],
  () => {
    page.value = 1
  },
)

watch(pageSize, () => {
  page.value = 1
})

const { data, pending, refresh, error } = await useAsyncData(
  'jobs-list',
  () =>
    list({
      source: source.value || undefined,
      q: debouncedQ.value.trim() || undefined,
      workplace: workplace.value,
      company: company.value.trim() || undefined,
      location: location.value.trim() || undefined,
      postedAfter: postedAfter.value.trim() || undefined,
      postedBefore: postedBefore.value.trim() || undefined,
      category: category.value.trim() || undefined,
      sort: sortField.value,
      order: sortOrder.value,
      limit: pageSize.value,
      offset: (page.value - 1) * pageSize.value,
    }),
  { watch: [source, workplace, company, location, postedAfter, postedBefore, category, sortField, sortOrder, debouncedQ, page, pageSize] },
)

const total = computed(() => data.value?.meta?.total ?? 0)
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const showingFrom = computed(() => (total.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1))
const showingTo = computed(() => Math.min(page.value * pageSize.value, total.value))

const hasActiveFilters = computed(() => {
  return Boolean(
    source.value
    || debouncedQ.value.trim()
    || workplace.value !== 'any'
    || company.value.trim()
    || location.value.trim()
    || postedAfter.value.trim()
    || postedBefore.value.trim()
    || category.value.trim(),
  )
})

function clearFilters() {
  source.value = ''
  q.value = ''
  debouncedQ.value = ''
  workplace.value = 'any'
  company.value = ''
  location.value = ''
  postedAfter.value = ''
  postedBefore.value = ''
  category.value = ''
  page.value = 1
}

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

function sourcePillClass(src: string) {
  const map: Record<string, string> = {
    remotive: 'bg-violet-500/20 text-violet-300 ring-violet-500/40',
    arbeitnow: 'bg-amber-500/20 text-amber-200 ring-amber-500/35',
    hn: 'bg-orange-500/20 text-orange-200 ring-orange-500/35',
    remoteok: 'bg-sky-500/20 text-sky-200 ring-sky-500/35',
    rss: 'bg-emerald-500/20 text-emerald-200 ring-emerald-500/35',
  }
  return map[src] ?? 'bg-slate-700/50 text-slate-300 ring-slate-600'
}

function toggleCategory(id: string) {
  if (category.value === id) {
    category.value = ''
  }
  else {
    category.value = id
    q.value = ''
    debouncedQ.value = ''
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Hero -->
    <div class="flex flex-col gap-4 border-b border-slate-800/80 pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0 flex-1 space-y-2">
        <h1 class="text-3xl font-semibold tracking-tight text-white">
          Jobs
        </h1>
        <p class="text-sm text-slate-400">
          Search aggregated listings. Use categories and filters to narrow results.
        </p>
        <details class="group text-sm text-slate-500">
          <summary class="cursor-pointer list-none text-emerald-500/90 hover:text-emerald-400 [&::-webkit-details-marker]:hidden">
            <span class="underline decoration-emerald-500/40 underline-offset-2">About sources &amp; export</span>
          </summary>
          <p class="mt-2 max-w-2xl leading-relaxed">
            Remotive, Arbeitnow, Remote OK, filtered HN Algolia, and optional RSS (e.g. Telegram via
            <a href="https://github.com/DIYgod/RSSHub" class="text-emerald-500 hover:text-emerald-400" target="_blank" rel="noopener noreferrer">RSSHub</a>).
            Without <code class="rounded bg-slate-800 px-1 text-xs text-slate-300">NUXT_JOBS_RSS_FEEDS</code>, RSS sync uses a default public feed (We Work Remotely).
          </p>
          <p class="mt-2 flex flex-wrap gap-3">
            <a href="/api/export/jobs" class="text-emerald-500 hover:text-emerald-400">Download JSON</a>
            <a href="/api/export/jobs?format=csv" class="text-emerald-500 hover:text-emerald-400">Download CSV</a>
          </p>
        </details>
        <p v-if="data?.meta?.lastSync" class="text-xs text-slate-500">
          Last row update: {{ data.meta.lastSync }} · Total matching: {{ data.meta.total }}
        </p>
      </div>
      <div class="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          class="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 disabled:opacity-50"
          :disabled="syncing"
          @click="runSync"
        >
          {{ syncing ? 'Syncing…' : 'Sync jobs' }}
        </button>
        <button
          type="button"
          class="rounded-lg border border-slate-600 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800"
          @click="refresh()"
        >
          Refresh
        </button>
      </div>
    </div>

    <p v-if="syncMsg" class="rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
      {{ syncMsg }}
    </p>
    <p v-if="error" class="text-sm text-red-400">
      {{ error.message }}
    </p>

    <!-- Toolbar row 1 -->
    <div class="sticky top-0 z-10 space-y-3 rounded-xl border border-slate-800 bg-slate-950/95 p-4 shadow-xl shadow-black/20 backdrop-blur sm:p-5">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div class="min-w-0 flex-1">
          <label class="sr-only" for="jobs-search">Search</label>
          <input
            id="jobs-search"
            v-model="q"
            type="search"
            placeholder="Search title, company, snippet…"
            class="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
          >
        </div>
        <div class="flex flex-wrap gap-2 sm:gap-3">
          <div class="flex min-w-[10rem] flex-1 flex-col gap-1 sm:min-w-0 sm:max-w-[11rem]">
            <label class="text-xs font-medium uppercase tracking-wide text-slate-500">Source</label>
            <select
              v-model="source"
              class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            >
              <option value="">
                All sources
              </option>
              <option value="remotive">
                Remotive
              </option>
              <option value="arbeitnow">
                Arbeitnow
              </option>
              <option value="hn">
                Hacker News
              </option>
              <option value="remoteok">
                Remote OK
              </option>
              <option value="rss">
                RSS
              </option>
            </select>
          </div>
          <div class="flex min-w-[10rem] flex-1 flex-col gap-1 sm:min-w-0 sm:max-w-[11rem]">
            <label class="text-xs font-medium uppercase tracking-wide text-slate-500">Workplace</label>
            <select
              v-model="workplace"
              class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            >
              <option value="any">
                Any
              </option>
              <option value="remote">
                Remote
              </option>
              <option value="onsite">
                On-site
              </option>
            </select>
          </div>
          <div class="flex min-w-[9rem] flex-col gap-1">
            <label class="text-xs font-medium uppercase tracking-wide text-slate-500">Sort</label>
            <div class="flex gap-1">
              <select
                v-model="sortField"
                class="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-white"
              >
                <option value="updatedAt">
                  Updated
                </option>
                <option value="postedAt">
                  Posted
                </option>
              </select>
              <select
                v-model="sortOrder"
                class="w-20 shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-white"
              >
                <option value="desc">
                  Desc
                </option>
                <option value="asc">
                  Asc
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Category chips -->
      <div>
        <p class="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Category
        </p>
        <div class="flex flex-wrap gap-2" role="group" aria-label="Job category filters">
          <button
            v-for="preset in JOB_CATEGORY_PRESETS"
            :key="preset.id"
            type="button"
            class="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600/50"
            :class="category === preset.id
              ? 'border-emerald-500 bg-emerald-600/20 text-emerald-200'
              : 'border-slate-600 bg-slate-900/80 text-slate-400 hover:border-slate-500 hover:text-slate-200'"
            @click="toggleCategory(preset.id)"
          >
            {{ preset.label }}
          </button>
        </div>
        <p v-if="category" class="mt-2 text-xs text-slate-500">
          Category filter uses keyword matching on title, company, and snippet. Clear the chip or type a new search to switch.
        </p>
      </div>

      <!-- More filters -->
      <div>
        <button
          type="button"
          class="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
          :aria-expanded="moreFiltersOpen"
          @click="moreFiltersOpen = !moreFiltersOpen"
        >
          <span class="select-none">{{ moreFiltersOpen ? '▼' : '▶' }}</span>
          More filters (company, location, posted dates)
        </button>
        <div v-show="moreFiltersOpen" class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs text-slate-500" for="f-company">Company contains</label>
            <input
              id="f-company"
              v-model="company"
              type="text"
              autocomplete="organization"
              class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              placeholder="e.g. Acme"
            >
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-slate-500" for="f-location">Location contains</label>
            <input
              id="f-location"
              v-model="location"
              type="text"
              class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              placeholder="e.g. Germany"
            >
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-slate-500" for="f-after">Posted on or after</label>
            <input
              id="f-after"
              v-model="postedAfter"
              type="date"
              class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            >
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-xs text-slate-500" for="f-before">Posted on or before</label>
            <input
              id="f-before"
              v-model="postedBefore"
              type="date"
              class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            >
          </div>
        </div>
      </div>

      <div v-if="hasActiveFilters" class="flex justify-end border-t border-slate-800/80 pt-3">
        <button
          type="button"
          class="text-sm text-slate-400 underline decoration-slate-600 underline-offset-2 hover:text-white"
          @click="clearFilters"
        >
          Clear all filters
        </button>
      </div>
    </div>

    <!-- Pagination bar -->
    <div class="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
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
            <option :value="25">
              25
            </option>
            <option :value="50">
              50
            </option>
            <option :value="80">
              80
            </option>
            <option :value="100">
              100
            </option>
            <option :value="200">
              200
            </option>
          </select>
        </label>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
            :disabled="pending || page <= 1"
            @click="goPrev"
          >
            Previous
          </button>
          <span class="min-w-[4.5rem] px-2 text-center text-sm tabular-nums text-slate-400">
            {{ page }} / {{ pageCount }}
          </span>
          <button
            type="button"
            class="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
            :disabled="pending || page >= pageCount || total === 0"
            @click="goNext"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="pending" class="space-y-3" aria-busy="true" aria-label="Loading jobs">
      <div
        v-for="n in 6"
        :key="n"
        class="animate-pulse rounded-xl border border-slate-800 bg-slate-900/50 p-4 xl:hidden"
      >
        <div class="h-4 w-3/4 rounded bg-slate-700/80" />
        <div class="mt-3 h-3 w-1/2 rounded bg-slate-800" />
        <div class="mt-4 h-10 rounded bg-slate-800/80" />
      </div>
      <div class="hidden overflow-hidden rounded-xl border border-slate-800 xl:block">
        <div class="divide-y divide-slate-800">
          <div v-for="n in 6" :key="`t-${n}`" class="animate-pulse px-4 py-4">
            <div class="flex gap-4">
              <div class="h-4 w-16 rounded bg-slate-700/80" />
              <div class="h-4 flex-1 rounded bg-slate-800" />
              <div class="h-4 w-24 rounded bg-slate-800" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cards (mobile / tablet) -->
    <div v-else class="space-y-3 xl:hidden">
      <article
        v-for="job in data?.jobs ?? []"
        :key="`c-${job.source}-${job.externalId}`"
        class="rounded-xl border border-slate-800 bg-slate-900/40 p-4 shadow-sm transition-colors hover:border-slate-700"
      >
        <div class="flex flex-wrap items-start justify-between gap-2">
          <a
            :href="job.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-base font-medium leading-snug text-emerald-400 hover:text-emerald-300"
          >
            {{ job.title }}
          </a>
        </div>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <span
            class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset"
            :class="sourcePillClass(job.source)"
          >
            {{ job.source }}
          </span>
          <span class="text-sm text-slate-400">{{ job.company || '—' }}</span>
        </div>
        <div class="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
          <span class="rounded-md bg-slate-800/80 px-2 py-0.5">{{ remoteLabel(job) }}</span>
          <span v-if="job.location" class="rounded-md bg-slate-800/80 px-2 py-0.5">{{ job.location }}</span>
          <span class="tabular-nums">{{ job.updatedAt?.slice(0, 16) }}</span>
        </div>
        <p v-if="job.snippet" class="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-500">
          {{ job.snippet }}
        </p>
      </article>
      <div v-if="(data?.jobs?.length ?? 0) === 0" class="rounded-xl border border-dashed border-slate-700 px-6 py-12 text-center">
        <p class="text-slate-400">
          No jobs match these filters.
        </p>
        <p v-if="!hasActiveFilters" class="mt-2 text-sm text-slate-500">
          Sync first to load listings from external sources.
        </p>
        <button
          type="button"
          class="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          @click="runSync"
        >
          Sync jobs now
        </button>
      </div>
    </div>

    <!-- Table (desktop xl+) -->
    <div v-if="!pending" class="hidden overflow-x-auto rounded-xl border border-slate-800 xl:block">
      <table class="min-w-full divide-y divide-slate-800 text-left text-sm">
        <thead class="bg-slate-900/90 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th class="px-4 py-3">
              Source
            </th>
            <th class="px-4 py-3">
              Title
            </th>
            <th class="px-4 py-3">
              Company
            </th>
            <th class="px-4 py-3">
              Remote
            </th>
            <th class="px-4 py-3">
              Location
            </th>
            <th class="px-4 py-3">
              Updated
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800">
          <tr
            v-for="job in data?.jobs ?? []"
            :key="`t-${job.source}-${job.externalId}`"
            class="hover:bg-slate-900/50"
          >
            <td class="whitespace-nowrap px-4 py-3 align-top">
              <span
                class="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset"
                :class="sourcePillClass(job.source)"
              >
                {{ job.source }}
              </span>
            </td>
            <td class="max-w-md px-4 py-3 align-top">
              <a
                :href="job.url"
                target="_blank"
                rel="noopener noreferrer"
                class="font-medium text-emerald-400 hover:text-emerald-300"
              >
                {{ job.title }}
              </a>
              <p v-if="job.snippet" class="mt-1 line-clamp-2 text-xs text-slate-500">
                {{ job.snippet }}
              </p>
            </td>
            <td class="px-4 py-3 align-top text-slate-300">
              {{ job.company || '—' }}
            </td>
            <td class="px-4 py-3 align-top text-slate-400">
              {{ remoteLabel(job) }}
            </td>
            <td class="max-w-xs truncate px-4 py-3 align-top text-slate-500">
              {{ job.location || '—' }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 align-top text-xs tabular-nums text-slate-500">
              {{ job.updatedAt?.slice(0, 16) }}
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="(data?.jobs?.length ?? 0) === 0" class="px-4 py-12 text-center text-sm text-slate-500">
        No jobs match these filters.
        <span v-if="!hasActiveFilters" class="mt-2 block text-slate-600">Click “Sync jobs” to load listings.</span>
      </p>
    </div>
  </div>
</template>
