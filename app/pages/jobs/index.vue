<script setup lang="ts">
import type { JobListing } from '~~/shared/job'
import type { JobFiltersModel } from '~~/shared/jobFilters'
import {
  GkAlert,
  GkBottomSheet,
  GkButton,
  GkDataTable,
  GkDialog,
  GkExpansionPanel,
  GkExpansionPanels,
  GkExpansionPanelText,
  GkExpansionPanelTitle,
  GkSelect,
  pushGkSnackbar,
} from 'god-kit/vue'

useSiteSeo({
  title: 'Job board — Search remote & on-site jobs',
  description:
    'Browse aggregated job posts from Remotive, Remote OK, Arbeitnow, Jobicy, Hacker News, Greenhouse, and RSS. Filter by keyword, company, location, remote or on-site work, category, and source—every row links to the original listing.',
  path: '/jobs',
  indexable: true,
})

const filters = reactive<JobFiltersModel>({
  source: '',
  q: '',
  workplace: 'any',
  company: '',
  location: '',
  postedAfter: '',
  postedBefore: '',
  category: '',
  sortField: 'updatedAt',
  sortOrder: 'desc',
})
const mobileFiltersOpen = ref(false)
const aboutExpanded = ref<string[]>([])
const page = ref(1)
const pageSize = ref(50)

const { list, sync } = useJobs()

const debouncedQ = ref('')
let qt: ReturnType<typeof setTimeout> | undefined
watch(
  () => filters.q,
  (v) => {
    clearTimeout(qt)
    qt = setTimeout(() => {
      debouncedQ.value = v
    }, 350)
  },
)

watch(debouncedQ, (v) => {
  if (v.trim())
    filters.category = ''
})

watch(
  () => [
    filters.source,
    filters.workplace,
    filters.company,
    filters.location,
    filters.postedAfter,
    filters.postedBefore,
    filters.category,
    filters.sortField,
    filters.sortOrder,
    debouncedQ.value,
  ],
  () => {
    page.value = 1
  },
)

watch(pageSize, () => {
  page.value = 1
})

watch(mobileFiltersOpen, (open) => {
  if (open) {
    nextTick(() => {
      const el = document.getElementById('jobs-search') as HTMLInputElement | null
      el?.focus()
    })
  }
})

const { data, pending, refresh, error } = await useAsyncData(
  'jobs-list',
  () =>
    list({
      source: filters.source || undefined,
      q: debouncedQ.value.trim() || undefined,
      workplace: filters.workplace,
      company: filters.company.trim() || undefined,
      location: filters.location.trim() || undefined,
      postedAfter: filters.postedAfter.trim() || undefined,
      postedBefore: filters.postedBefore.trim() || undefined,
      category: filters.category.trim() || undefined,
      sort: filters.sortField,
      order: filters.sortOrder,
      limit: pageSize.value,
      offset: (page.value - 1) * pageSize.value,
    }),
  {
    watch: [
      () => filters.source,
      () => filters.workplace,
      () => filters.company,
      () => filters.location,
      () => filters.postedAfter,
      () => filters.postedBefore,
      () => filters.category,
      () => filters.sortField,
      () => filters.sortOrder,
      debouncedQ,
      page,
      pageSize,
    ],
  },
)

const total = computed(() => data.value?.meta?.total ?? 0)
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

const hasActiveFilters = computed(() => {
  return Boolean(
    filters.source
    || debouncedQ.value.trim()
    || filters.workplace !== 'any'
    || filters.company.trim()
    || filters.location.trim()
    || filters.postedAfter.trim()
    || filters.postedBefore.trim()
    || filters.category.trim(),
  )
})

function clearFilters() {
  Object.assign(filters, {
    source: '',
    q: '',
    workplace: 'any' as const,
    company: '',
    location: '',
    postedAfter: '',
    postedBefore: '',
    category: '',
  })
  debouncedQ.value = ''
  page.value = 1
}

watch([total, pageCount], () => {
  if (page.value > pageCount.value)
    page.value = Math.max(1, pageCount.value)
})

const syncing = ref(false)
const syncMsg = ref('')

async function runSync() {
  syncMsg.value = ''
  syncing.value = true
  try {
    const res = await sync({})
    const parts = Object.entries(res.result).map(([k, v]) => {
      if (!v.ok)
        return `${k}: error ${v.error}`
      const note = 'note' in v && v.note ? ` (${v.note})` : ''
      return `${k}: ${v.count ?? 0}${note}`
    })
    syncMsg.value = parts.join(' · ')
    pushGkSnackbar({ text: 'Sync completed', variant: 'success', timeout: 5000 })
    await refresh()
  }
  catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Sync failed'
    syncMsg.value = msg
    pushGkSnackbar({ text: msg, variant: 'warning', timeout: 8000 })
  }
  finally {
    syncing.value = false
  }
}

function remoteLabel(job: JobListing) {
  if (job.remote === true || job.remote === 1)
    return 'Remote'
  if (job.remote === false || job.remote === 0)
    return 'On-site'
  return '—'
}

function sourcePillClass(src: string) {
  const map: Record<string, string> = {
    remotive: 'bg-violet-500/20 text-violet-300 ring-1 ring-inset ring-violet-500/40',
    arbeitnow: 'bg-amber-500/20 text-amber-200 ring-1 ring-inset ring-amber-500/35',
    hn: 'bg-orange-500/20 text-orange-200 ring-1 ring-inset ring-orange-500/35',
    remoteok: 'bg-sky-500/20 text-sky-200 ring-1 ring-inset ring-sky-500/35',
    rss: 'bg-emerald-500/20 text-emerald-200 ring-1 ring-inset ring-emerald-500/35',
    jobicy: 'bg-fuchsia-500/20 text-fuchsia-200 ring-1 ring-inset ring-fuchsia-500/35',
    greenhouse: 'bg-lime-500/15 text-lime-200 ring-1 ring-inset ring-lime-500/35',
  }
  return map[src] ?? 'bg-slate-500/20 text-slate-300 ring-1 ring-inset ring-slate-500/30'
}

const jobTableHeaders = [
  { key: 'source', title: 'Source', sortable: false },
  { key: 'title', title: 'Title', sortable: false },
  { key: 'company', title: 'Company', sortable: false },
  { key: 'remote', title: 'Remote', sortable: false },
  { key: 'location', title: 'Location', sortable: false },
  { key: 'updatedAt', title: 'Updated', sortable: true },
  { key: 'postedAt', title: 'Posted', sortable: true },
] as const

const jobTableItems = computed(() =>
  (data.value?.jobs ?? []).map((job) => ({
    id: job.id,
    source: job.source,
    title: job.title,
    company: job.company ?? '—',
    remote: remoteLabel(job),
    location: job.location ?? '—',
    updatedAt: job.updatedAt,
    postedAt: job.postedAt,
    snippet: job.snippet,
    url: job.url,
  })),
)

/** Binds GkDataTable sort UI to API filter state (updatedAt / postedAt only). */
const tableSortBy = computed({
  get: () => [{ key: filters.sortField, order: filters.sortOrder as 'asc' | 'desc' }],
  set: (v) => {
    const first = v[0]
    if (first && (first.key === 'updatedAt' || first.key === 'postedAt')) {
      filters.sortField = first.key
      filters.sortOrder = first.order
    }
  },
})

const jobTableItemsPerPageOptions = [25, 50, 80, 100, 200] as const

const REPO_URL = 'https://github.com/god-plans/god-jobs'
const SPONSOR_URL = 'https://github.com/sponsors/parsajiravand'
const NUDGE_DISMISS_KEY = 'god-jobs-opensource-nudge-dismiss'
const NUDGE_DAILY_KEY = 'god-jobs-opensource-nudge-daily'
const MAX_NUDGES_PER_DAY = 2

function localDateString() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getTodayNudgeCount(): number {
  if (import.meta.server) return MAX_NUDGES_PER_DAY
  try {
    const raw = localStorage.getItem(NUDGE_DAILY_KEY)
    if (!raw) return 0
    const parsed = JSON.parse(raw) as { date?: string, count?: number }
    if (parsed.date !== localDateString()) return 0
    return typeof parsed.count === 'number' ? parsed.count : 0
  }
  catch {
    return 0
  }
}

function incrementTodayNudgeCount(): number {
  const today = localDateString()
  let next = 1
  try {
    const raw = localStorage.getItem(NUDGE_DAILY_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { date?: string, count?: number }
      if (parsed.date === today && typeof parsed.count === 'number')
        next = parsed.count + 1
    }
    localStorage.setItem(NUDGE_DAILY_KEY, JSON.stringify({ date: today, count: next }))
  }
  catch {
    /* ignore */
  }
  return next
}

const resultsSentinel = ref<HTMLElement | null>(null)
const contributeDialogOpen = ref(false)
const pendingExitBeforeNextNudge = ref(false)

let resultsObserver: IntersectionObserver | null = null

function nudgeAllowed() {
  if (import.meta.server) return false
  try {
    if (localStorage.getItem(NUDGE_DISMISS_KEY) === '1') return false
  }
  catch {
    return false
  }
  return getTodayNudgeCount() < MAX_NUDGES_PER_DAY
}

function closeContributeDialog(options?: { permanent?: boolean }) {
  contributeDialogOpen.value = false
  if (options?.permanent) {
    try {
      localStorage.setItem(NUDGE_DISMISS_KEY, '1')
    }
    catch {
      /* ignore */
    }
    resultsObserver?.disconnect()
    resultsObserver = null
  }
  else {
    pendingExitBeforeNextNudge.value = true
  }
}

function openExternal(url: string) {
  closeContributeDialog()
  if (import.meta.client)
    window.open(url, '_blank', 'noopener,noreferrer')
}

onMounted(() => {
  if (!nudgeAllowed()) return
  const el = resultsSentinel.value
  if (!el) return
  resultsObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          pendingExitBeforeNextNudge.value = false
          continue
        }
        if (nudgeAllowed() && !contributeDialogOpen.value && !pendingExitBeforeNextNudge.value) {
          contributeDialogOpen.value = true
          const shownToday = incrementTodayNudgeCount()
          if (shownToday >= MAX_NUDGES_PER_DAY) {
            resultsObserver?.disconnect()
            resultsObserver = null
          }
          break
        }
      }
    },
    { root: null, rootMargin: '0px', threshold: 0 },
  )
  resultsObserver.observe(el)
  void runSync()
})

onBeforeUnmount(() => {
  resultsObserver?.disconnect()
  resultsObserver = null
})
</script>

<template>
  <div class="space-y-6 pb-24 md:pb-0 lg:p-8 p-4">
    <!-- Hero -->
    <div class="flex flex-col gap-4 border-b pb-6" style="border-color: var(--gk-color-border)">
      <div class="min-w-0 flex-1 space-y-2">
        <div class="flex flex-wrap items-center gap-3">
          <AppLogo :as-link="false" size="sm" :show-wordmark="false" />
          <h1 class="text-3xl font-semibold tracking-tight" style="color: var(--gk-color-on-surface)">
            Job board
          </h1>
        </div>
        <p class="text-sm" style="color: var(--gk-color-on-surface-variant)">
          Search aggregated listings from multiple feeds. Use categories and filters to narrow results, then open each role at its source.
        </p>
        <p class="text-xs" style="color: var(--gk-color-on-surface-variant)">
          <NuxtLink to="/" class="underline opacity-90" style="color: var(--gk-color-primary)">← Back to home</NuxtLink>
        </p>
        <GkExpansionPanels v-model="aboutExpanded" :multiple="true">
          <GkExpansionPanel value="sources">
            <GkExpansionPanelTitle>
              About sources &amp; export
            </GkExpansionPanelTitle>
            <GkExpansionPanelText>
              <p class="max-w-2xl leading-relaxed" style="color: var(--gk-color-on-surface-variant)">
                Built-in APIs: Remotive, Arbeitnow, Remote OK, Jobicy (remote), filtered HN Algolia, and RSS/Atom (e.g. Telegram via
                <a href="https://github.com/DIYgod/RSSHub" class="underline" style="color: var(--gk-color-primary)" target="_blank" rel="noopener noreferrer">RSSHub</a>).
                Greenhouse has no “all companies” API—only per-board URLs. Set <code class="gj-mono-inline rounded px-1" style="background: var(--gk-color-surface-elevated)">NUXT_JOBS_GREENHOUSE_BOARDS</code> to comma-separated <code class="gj-mono-inline rounded px-1" style="background: var(--gk-color-surface-elevated)">boards.greenhouse.io/{token}</code> slugs, or use <code class="gj-mono-inline rounded px-1" style="background: var(--gk-color-surface-elevated)">curated</code> to merge a built-in verified pack, or <code class="gj-mono-inline rounded px-1" style="background: var(--gk-color-surface-elevated)">NUXT_JOBS_GREENHOUSE_BOARD_LIST_URL</code> for a hosted text list of tokens.
                Without <code class="gj-mono-inline rounded px-1" style="background: var(--gk-color-surface-elevated)">NUXT_JOBS_RSS_FEEDS</code>, RSS sync uses a default public feed (We Work Remotely).
                LinkedIn and most large job sites do not offer a stable public API for open aggregation; use RSS where a site publishes a feed, or route listings you are allowed to republish through your own connector.
              </p>
              <p class="mt-2 flex flex-wrap gap-3">
                <a href="/api/export/jobs" class="underline" style="color: var(--gk-color-primary)">Download JSON</a>
                <a href="/api/export/jobs?format=csv" class="underline" style="color: var(--gk-color-primary)">Download CSV</a>
              </p>
            </GkExpansionPanelText>
          </GkExpansionPanel>
        </GkExpansionPanels>
        <p v-if="data?.meta?.lastSync" class="text-xs" style="color: var(--gk-color-on-surface-variant)">
          Last row update: {{ data.meta.lastSync }} · Total matching: {{ data.meta.total }}
        </p>
      </div>
      <div class="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
        <GkButton
          type="button"
          class="w-full sm:w-auto"
          :disabled="syncing"
          :loading="syncing"
          @click="runSync"
        >
          {{ syncing ? 'Syncing…' : 'Sync jobs' }}
        </GkButton>
        <GkButton type="button" class="w-full sm:w-auto" variant="secondary" :disabled="pending" @click="refresh()">
          Refresh
        </GkButton>
      </div>
    </div>

    <GkAlert v-if="syncMsg" :text="syncMsg" class="!my-0" :variant="syncMsg.includes('error') || syncMsg.includes('failed') || syncMsg.includes('Error') ? 'danger' : 'neutral'" />
    <GkAlert v-if="error" :text="String(error?.message || error)" class="!my-0" variant="danger" />

    <!-- Desktop filters -->
    <div
      class="hidden flex-col space-y-3 md:sticky md:top-0 md:z-10 md:flex md:overflow-visible md:p-5"
      :class="['gj-surface', 'gj-surface--raised', 'rounded-[var(--gk-radius-lg)]']"
      style="backface-visibility: hidden"
      role="region"
      aria-label="Job search and filters"
    >
      <JobsJobFiltersForm v-model="filters" />
      <div v-if="hasActiveFilters" class="flex w-full shrink-0 justify-end border-t pt-3" style="border-color: var(--gk-color-border)">
        <GkButton type="button" variant="ghost" @click="clearFilters">
          Clear all filters
        </GkButton>
      </div>
    </div>

    <GkBottomSheet
      v-model="mobileFiltersOpen"
      inset
      aria-labelledby="mobile-filters-title"
    >
      <div class="mb-3 flex items-center justify-between gap-3 border-b pb-3" style="border-color: var(--gk-color-border)">
        <h2 id="mobile-filters-title" class="text-base font-semibold" style="color: var(--gk-color-on-surface)">
          Search &amp; filters
        </h2>
        <GkButton type="button" @click="mobileFiltersOpen = false">
          Done
        </GkButton>
      </div>
      <JobsJobFiltersForm v-model="filters" />
      <div v-if="hasActiveFilters" class="mt-4 flex justify-end">
        <GkButton type="button" variant="ghost" @click="clearFilters">
          Clear all filters
        </GkButton>
      </div>
    </GkBottomSheet>

    <!-- Mobile: fixed entry to search & filters -->
    <div
      v-show="!mobileFiltersOpen"
      class="fixed inset-x-0 bottom-0 z-50 border-t shadow-lg md:hidden"
      style="
        background: var(--gk-color-surface-elevated);
        border-color: var(--gk-color-border);
        padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0px));
        box-shadow: 0 -12px 40px color-mix(in srgb, #000 35%, transparent);
      "
    >
      <div class="mx-auto max-w-6xl px-4 pt-3">
        <GkButton
          type="button"
          block
          variant="secondary"
          aria-haspopup="dialog"
          :aria-expanded="mobileFiltersOpen"
          aria-controls="jobs-filters-panel"
          @click="mobileFiltersOpen = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5" style="color: var(--gk-color-primary)" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <span>Search &amp; filters</span>
          <span
            v-if="hasActiveFilters"
            class="rounded-full px-2 py-0.5 text-xs font-semibold"
            style="background: var(--gk-color-primary); color: var(--gk-color-on-primary)"
          >
            Active
          </span>
        </GkButton>
      </div>
    </div>

    <div
      ref="resultsSentinel"
      class="pointer-events-none h-1 w-full shrink-0"
      aria-hidden="true"
    />

    <div class="gj-surface gj-surface--raised jobs-list-table-wrap overflow-hidden">
      <GkDataTable
        mode="server"
        v-model:page="page"
        v-model:items-per-page="pageSize"
        v-model:sort-by="tableSortBy"
        :headers="[...jobTableHeaders]"
        :items="jobTableItems"
        :items-length="total"
        :loading="pending"
        :items-per-page-options="[...jobTableItemsPerPageOptions]"
        item-value="id"
        caption="Job listings"
        density="compact"
        striped
        mobile="auto"
        fixed-header
        :max-height="560"
        :bordered="false"
        class="jobs-gk-data-table"
      >
        <template #item.source="{ item }">
          <span
            class="gj-pill inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
            :class="sourcePillClass(String(item.source ?? ''))"
          >
            {{ item.source }}
          </span>
        </template>
        <template #item.title="{ item }">
          <div class="min-w-0 max-w-md">
            <a
              :href="String(item.url ?? '#')"
              target="_blank"
              rel="noopener noreferrer"
              class="font-medium"
              style="color: var(--gk-color-primary)"
            >
              {{ item.title }}
            </a>
            <p
              v-if="item.snippet"
              class="mt-1 line-clamp-2 text-xs"
              style="color: var(--gk-color-on-surface-variant)"
            >
              {{ item.snippet }}
            </p>
          </div>
        </template>
        <template #item.location="{ item }">
          <span class="max-w-xs truncate" style="color: var(--gk-color-on-surface-variant)">{{ item.location ?? '—' }}</span>
        </template>
        <template #item.updatedAt="{ item }">
          <span class="whitespace-nowrap text-xs tabular-nums" style="color: var(--gk-color-on-surface-variant)">
            {{ typeof item.updatedAt === 'string' ? item.updatedAt.slice(0, 16) : '—' }}
          </span>
        </template>
        <template #item.postedAt="{ item }">
          <span class="whitespace-nowrap text-xs tabular-nums" style="color: var(--gk-color-on-surface-variant)">
            {{ item.postedAt && typeof item.postedAt === 'string' ? item.postedAt.slice(0, 16) : '—' }}
          </span>
        </template>
        <template #no-data>
          <div
            v-if="!pending"
            class="rounded-md border border-dashed px-4 py-12 text-center text-sm"
            style="color: var(--gk-color-on-surface-variant); border-color: var(--gk-color-border)"
          >
            <p>No jobs match these filters.</p>
            <p v-if="!hasActiveFilters" class="mt-2" style="color: var(--gk-color-on-surface)">
              Sync first to load listings from external sources, or click “Sync jobs” above.
            </p>
            <GkButton v-if="!hasActiveFilters" type="button" class="mt-4" @click="runSync">
              Sync jobs now
            </GkButton>
          </div>
        </template>
      </GkDataTable>
    </div>

    <GkDialog
      v-model="contributeDialogOpen"
      aria-labelledby="jobs-contribute-title"
      :max-width="480"
      scrollable
    >
      <h2 id="jobs-contribute-title" class="text-lg font-semibold" style="color: var(--gk-color-on-surface)">
        Enjoying God Jobs?
      </h2>
      <p class="mt-2 text-sm leading-relaxed" style="color: var(--gk-color-on-surface-variant)">
        Star the repo, sponsor development, or open a PR—your support keeps this board improving.
      </p>
      <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <GkButton type="button" class="min-w-0 flex-1" @click="openExternal(REPO_URL)">
          Star &amp; contribute
        </GkButton>
        <GkButton type="button" variant="secondary" class="min-w-0 flex-1" @click="openExternal(SPONSOR_URL)">
          Sponsor on GitHub
        </GkButton>
      </div>
      <p class="mt-4 text-sm" style="color: var(--gk-color-on-surface-variant)">
        <button
          type="button"
          class="cursor-pointer border-0 bg-transparent p-0 underline"
          style="color: var(--gk-color-on-surface)"
          @click="closeContributeDialog()"
        >
          Maybe later
        </button>
      </p>
    </GkDialog>
  </div>
</template>
