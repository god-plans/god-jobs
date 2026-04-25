<script setup lang="ts">
import type { JobFiltersModel } from '~~/shared/jobFilters'
import { JOB_CATEGORY_PRESETS } from '~~/shared/jobCategoryPresets'
import {
  GkAlert,
  GkBottomSheet,
  GkButton,
  GkDialog,
  GkField,
  GkPagination,
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
const aboutDialogOpen = ref(false)
const page = ref(1)
const pageSize = ref(50)
const mobilePagesLoaded = ref(1)

const mdUp = ref(false)
const lgUp = ref(false)

/** Sync before fetch + paint so desktop doesn’t render as “mobile” until onMounted (avoids layout jump). */
function setBreakpoints() {
  if (import.meta.client && typeof window !== 'undefined' && window.matchMedia) {
    mdUp.value = window.matchMedia('(min-width: 768px)').matches
    lgUp.value = window.matchMedia('(min-width: 1024px)').matches
  }
}
setBreakpoints()

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
    mobilePagesLoaded.value = 1
  },
)

watch(pageSize, () => {
  page.value = 1
  mobilePagesLoaded.value = 1
})

watch(mobileFiltersOpen, (open) => {
  if (open) {
    nextTick(() => {
      const el = document.getElementById('jobs-search') as HTMLInputElement | null
      el?.focus()
    })
  }
})

watch(mdUp, () => {
  page.value = 1
  mobilePagesLoaded.value = 1
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
      limit: mdUp.value ? pageSize.value : pageSize.value * mobilePagesLoaded.value,
      offset: mdUp.value ? (page.value - 1) * pageSize.value : 0,
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
      mobilePagesLoaded,
      mdUp,
    ],
  },
)

const total = computed(() => data.value?.meta?.total ?? 0)
const displayedCount = computed(() => data.value?.jobs?.length ?? 0)
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const showingFrom = computed(() => (total.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1))
const showingTo = computed(() => Math.min(page.value * pageSize.value, total.value))
const hasMore = computed(() => total.value > displayedCount.value)

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
  mobilePagesLoaded.value = 1
}

function toggleCategory(id: string) {
  if (filters.category === id) {
    filters.category = ''
  }
  else {
    filters.category = id
    filters.q = ''
  }
}

function loadMore() {
  if (mdUp.value || pending.value || !hasMore.value)
    return
  mobilePagesLoaded.value += 1
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

const jobTableItemsPerPageOptions = [25, 50, 80, 100, 200] as const
const pageSizeSelectOptions = computed(() =>
  jobTableItemsPerPageOptions.map(n => ({ value: n, label: String(n) })),
)

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

let mqMd: MediaQueryList | null = null
let mqLg: MediaQueryList | null = null

onMounted(() => {
  setBreakpoints()
  mqMd = window.matchMedia('(min-width: 768px)')
  mqLg = window.matchMedia('(min-width: 1024px)')
  mqMd.addEventListener('change', setBreakpoints)
  mqLg.addEventListener('change', setBreakpoints)

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
  mqMd?.removeEventListener('change', setBreakpoints)
  mqLg?.removeEventListener('change', setBreakpoints)
  mqMd = null
  mqLg = null
  resultsObserver?.disconnect()
  resultsObserver = null
})
</script>

<template>
  <div class="space-y-4 py-3 pb-32 sm:space-y-6 sm:py-4">
    <!-- Hero -->
    <div class="flex flex-col gap-3 border-b pb-4 sm:gap-4 sm:pb-6" style="border-color: var(--gk-color-border)">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
        <div class="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
          <div class="flex flex-wrap items-center gap-3">
            <AppLogo :as-link="false" size="sm" :show-wordmark="false" />
            <h1 class="text-2xl font-semibold tracking-tight sm:text-3xl" style="color: var(--gk-color-on-surface)">
              Job board
            </h1>
          </div>
          <p class="text-sm" style="color: var(--gk-color-on-surface-variant)">
            Search aggregated listings from multiple feeds. Use categories and filters to narrow results, then open each
            role at its source.
          </p>
          <p class="text-xs" style="color: var(--gk-color-on-surface-variant)">
            <NuxtLink to="/" class="underline opacity-90" style="color: var(--gk-color-primary)">
              ← Back to home
            </NuxtLink>
            <span class="mx-2 opacity-40" aria-hidden="true">·</span>
            <button
              type="button"
              class="cursor-pointer border-0 bg-transparent p-0 text-xs underline"
              style="color: var(--gk-color-primary)"
              @click="aboutDialogOpen = true"
            >
              Sources &amp; export
            </button>
          </p>
        </div>
        <div class="grid w-full shrink-0 grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
          <GkButton type="button" class="col-span-1 w-full sm:w-auto" :disabled="syncing" :loading="syncing" @click="runSync" size="sm">
            {{ syncing ? 'Syncing…' : 'Sync jobs' }}
          </GkButton>
          <GkButton
            type="button"
            class="col-span-1 w-full sm:w-auto"
            size="sm"
            variant="ghost"
            :disabled="pending"
            title="Reload the current list from the server"
            @click="refresh()"
          >
            Refresh
          </GkButton>
        </div>
      </div>
      <p
        v-if="data?.meta?.lastSync"
        class="flex flex-col gap-1 text-[11px] leading-snug sm:flex-row sm:flex-wrap sm:gap-x-1 sm:text-xs"
        style="color: var(--gk-color-on-surface-variant)"
      >
        <span class="min-w-0 break-words sm:max-w-none">
          Last sync {{ new Date(data.meta.lastSync).toLocaleString() }}
        </span>
        <span class="hidden font-normal opacity-60 sm:inline" aria-hidden="true">·</span>
        <span class="font-medium tabular-nums sm:font-normal" style="color: var(--gk-color-on-surface)">
          {{ data.meta.total.toLocaleString() }} matching
        </span>
      </p>
    </div>

    <GkAlert
      v-if="syncMsg"
      :text="syncMsg"
      class="!my-0"
      :variant="syncMsg.includes('error') || syncMsg.includes('failed') || syncMsg.includes('Error') ? 'danger' : 'neutral'"
    />
    <GkAlert v-if="error" :text="String(error?.message || error)" class="!my-0" variant="danger" />

    <!-- Flex (not 2-col grid) so main isn’t stuck in the sidebar track when aside is display:none &lt; lg. -->
    <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <aside
        class="sticky top-20 z-10 hidden min-w-0 shrink-0 self-start rounded-[var(--gk-radius-lg)] border p-4 lg:block lg:w-[min(15rem,100%)] lg:max-w-[15rem]"
        style="
          border-color: var(--gk-color-border);
          background: var(--gk-color-surface-elevated);
          box-shadow: var(--gk-elevation-1);
        "
        aria-label="Job categories"
      >
        <p class="mb-3 text-xs font-medium uppercase tracking-wide" style="color: var(--gk-color-on-surface-variant)">
          Category
        </p>
        <div class="flex flex-col gap-2" role="group" aria-label="Job category filters">
          <GkButton
            v-for="preset in JOB_CATEGORY_PRESETS"
            :key="preset.id"
            type="button"
            size="sm"
            block
            class="!justify-start"
            :variant="filters.category === preset.id ? 'primary' : 'secondary'"
            @click="toggleCategory(preset.id)"
          >
            {{ preset.label }}
          </GkButton>
        </div>
        <p v-if="filters.category" class="mt-3 text-xs leading-snug" style="color: var(--gk-color-on-surface-variant)">
          Keyword matching on title, company, and snippet. Clear the chip or type a new search to switch.
        </p>
      </aside>

      <div class="min-w-0 w-full flex-1 space-y-4">
        <div
          class="hidden gj-surface gj-surface--raised rounded-[var(--gk-radius-lg)] p-4 sm:p-5 md:block"
          style="backface-visibility: hidden"
          role="search"
          aria-label="Job search and filters"
        >
          <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p class="text-sm font-medium tabular-nums" style="color: var(--gk-color-on-surface)">
              <template v-if="pending && displayedCount === 0">
                Searching…
              </template>
              <template v-else>
                {{ total.toLocaleString() }} {{ total === 1 ? 'job' : 'jobs' }}
              </template>
            </p>
            <span
              v-if="hasActiveFilters"
              class="gj-pill inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style="
                background: color-mix(in srgb, var(--gk-color-primary) 16%, transparent);
                color: var(--gk-color-primary);
              "
            >
              Filters active
            </span>
          </div>
          <JobsJobFiltersForm
            v-model="filters"
            search-id="jobs-search-desktop"
            :show-category-chips="mdUp && !lgUp"
          />
          <div
            v-if="hasActiveFilters"
            class="mt-4 flex justify-end border-t pt-4"
            style="border-color: var(--gk-color-border)"
          >
            <GkButton type="button" variant="ghost" size="sm" @click="clearFilters">
              Clear all filters
            </GkButton>
          </div>
        </div>

        <div
          class="gj-surface gj-surface--raised jobs-list-card-wrap overflow-hidden rounded-[var(--gk-radius-lg)]"
        >
          <div class="border-b px-4 py-3 md:hidden" style="border-color: var(--gk-color-border)">
            <p class="text-sm font-medium tabular-nums" style="color: var(--gk-color-on-surface)">
              <template v-if="pending && displayedCount === 0">
                Searching…
              </template>
              <template v-else>
                {{ total.toLocaleString() }} {{ total === 1 ? 'job' : 'jobs' }}
              </template>
            </p>
          </div>

          <div class="jobs-list-card-stack p-3 sm:p-4 md:p-5">
            <ul v-if="pending && displayedCount === 0" class="space-y-3" aria-busy="true" aria-label="Loading jobs">
              <li v-for="n in 6" :key="n" class="gj-job-card-skeleton h-32 rounded-[var(--gk-radius-lg)] sm:h-28" />
            </ul>

            <div
              v-else-if="!pending && displayedCount === 0"
              class="rounded-[var(--gk-radius-md)] border border-dashed px-4 py-14 text-center text-sm"
              style="color: var(--gk-color-on-surface-variant); border-color: var(--gk-color-border)"
            >
              <p class="font-medium" style="color: var(--gk-color-on-surface)">
                No jobs match these filters.
              </p>
              <p v-if="!hasActiveFilters" class="mt-2">
                Sync first to load listings from external sources, or tap “Sync jobs” in the header.
              </p>
              <GkButton v-if="!hasActiveFilters" type="button" class="mt-5" @click="runSync">
                Sync jobs now
              </GkButton>
              <GkButton v-else type="button" variant="secondary" class="mt-5" @click="clearFilters">
                Clear filters
              </GkButton>
            </div>

            <ul v-else class="space-y-3" aria-label="Job listings">
              <li v-for="job in (data?.jobs ?? [])" :key="job.id">
                <JobsJobListingCard :job="job" />
              </li>
            </ul>
          </div>

          <div
            class="jobs-list-footer border-t"
            style="border-color: var(--gk-color-border); background: var(--gk-color-surface-elevated)"
            role="navigation"
            aria-label="Job list pagination"
          >
            <div class="hidden md:block">
              <div class="gj-pagination-bar flex flex-col gap-4 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <p class="jobs-list-footer__summary min-w-0 text-sm" style="color: var(--gk-color-on-surface-variant)">
                  <span v-if="total > 0">Showing {{ showingFrom }}–{{ showingTo }} of {{ total.toLocaleString() }}</span>
                  <span v-else>No matching jobs</span>
                </p>
                <div class="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  <div class="flex min-w-0 max-w-full flex-wrap items-end gap-2 sm:items-center">
                    <span id="jobs-page-size-lbl" class="gj-per-page-label shrink-0">Per page</span>
                    <GkField label-sr-only label="Rows per page" class="gj-per-page-field !mb-0 min-w-0 shrink-0">
                      <GkSelect v-model="pageSize" :options="pageSizeSelectOptions" aria-labelledby="jobs-page-size-lbl" />
                    </GkField>
                  </div>
                  <div class="gj-pagination-bar__pages min-w-0">
                    <GkPagination
                      v-model="page"
                      :length="pageCount"
                      :disabled="pending"
                      :total-visible="7"
                      show-first-last-page
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-3 p-4 md:hidden">
              <p
                v-if="total > 0"
                class="text-center text-sm tabular-nums"
                style="color: var(--gk-color-on-surface-variant)"
              >
                Showing {{ displayedCount.toLocaleString() }} of {{ total.toLocaleString() }}
              </p>
              <GkButton
                v-if="hasMore"
                type="button"
                block
                variant="secondary"
                :loading="pending"
                :disabled="pending"
                @click="loadMore"
              >
                {{ pending ? 'Loading…' : 'Load more' }}
              </GkButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <GkBottomSheet v-model="mobileFiltersOpen" inset aria-labelledby="mobile-filters-title">
      <div
        class="mb-3 flex items-center justify-between gap-3 border-b pb-3"
        style="border-color: var(--gk-color-border)"
      >
        <h2 id="mobile-filters-title" class="text-base font-semibold" style="color: var(--gk-color-on-surface)">
          Search &amp; filters
        </h2>
        <GkButton type="button" @click="mobileFiltersOpen = false">
          Done
        </GkButton>
      </div>
      <JobsJobFiltersForm v-model="filters" search-id="jobs-search" :show-category-chips="true" />
      <div v-if="hasActiveFilters" class="mt-4 flex justify-end">
        <GkButton type="button" variant="ghost" @click="clearFilters">
          Clear all filters
        </GkButton>
      </div>
    </GkBottomSheet>

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-5 w-5"
            style="color: var(--gk-color-primary)"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
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

    <div ref="resultsSentinel" class="pointer-events-none h-1 w-full shrink-0" aria-hidden="true" />

    <GkDialog v-model="aboutDialogOpen" aria-labelledby="jobs-about-title" :max-width="640" scrollable>
      <h2 id="jobs-about-title" class="text-lg font-semibold" style="color: var(--gk-color-on-surface)">
        Sources &amp; export
      </h2>
      <p class="mt-3 max-w-2xl leading-relaxed text-sm" style="color: var(--gk-color-on-surface-variant)">
        Built-in APIs: Remotive, Arbeitnow, Remote OK, Jobicy (remote), filtered HN Algolia, and RSS/Atom (e.g.
        Telegram via
        <a
          href="https://github.com/DIYgod/RSSHub"
          class="underline"
          style="color: var(--gk-color-primary)"
          target="_blank"
          rel="noopener noreferrer"
        >RSSHub</a>).
        Greenhouse has no “all companies” API—only per-board URLs. Set <code class="gj-mono-inline rounded px-1"
          style="background: var(--gk-color-surface-elevated)">NUXT_JOBS_GREENHOUSE_BOARDS</code> to
        comma-separated <code class="gj-mono-inline rounded px-1"
          style="background: var(--gk-color-surface-elevated)">boards.greenhouse.io/{token}</code> slugs, or use
        <code class="gj-mono-inline rounded px-1"
          style="background: var(--gk-color-surface-elevated)">curated</code> to merge a built-in verified pack,
        or <code class="gj-mono-inline rounded px-1"
          style="background: var(--gk-color-surface-elevated)">NUXT_JOBS_GREENHOUSE_BOARD_LIST_URL</code> for a
        hosted text list of tokens.
        Without <code class="gj-mono-inline rounded px-1"
          style="background: var(--gk-color-surface-elevated)">NUXT_JOBS_RSS_FEEDS</code>, RSS sync uses a default
        public feed (We Work Remotely).
        LinkedIn and most large job sites do not offer a stable public API for open aggregation; use RSS where a
        site publishes a feed, or route listings you are allowed to republish through your own connector.
      </p>
      <p class="mt-4 flex flex-wrap gap-3 text-sm">
        <a href="/api/export/jobs" class="underline" style="color: var(--gk-color-primary)">Download JSON</a>
        <a href="/api/export/jobs?format=csv" class="underline" style="color: var(--gk-color-primary)">Download CSV</a>
      </p>
      <div class="mt-5">
        <GkButton type="button" @click="aboutDialogOpen = false">
          Close
        </GkButton>
      </div>
    </GkDialog>

    <GkDialog v-model="contributeDialogOpen" aria-labelledby="jobs-contribute-title" :max-width="480" scrollable>
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
