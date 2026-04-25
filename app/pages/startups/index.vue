<script setup lang="ts">
import { GkAlert, GkButton, GkField, GkInput, GkSelect, GkSpinner } from 'god-kit/vue'
import type { Startup } from '~~/shared/startup'
import { isComingSoon } from '~~/shared/comingSoon'

useSiteSeo({
  title: 'Startups',
  description: 'Internal startup research and outreach list for God Jobs.',
  path: '/startups',
  indexable: false,
})

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

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'researched', label: 'Researched' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
] as const

const sortOptions = [
  { value: 'updated', label: 'Sort: Recently updated' },
  { value: 'name', label: 'Sort: Name' },
  { value: 'priority', label: 'Sort: Priority' },
] as const
</script>

<template>
  <div class="space-y-6 lg:p-8 p-4">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div class="flex flex-wrap items-center gap-3">
          <AppLogo :as-link="false" size="sm" :show-wordmark="false" />
          <h1 class="text-2xl font-semibold" style="color: var(--gk-color-on-surface)">Startups</h1>
        </div>
        <p class="mt-1 text-sm" style="color: var(--gk-color-on-surface-variant)">
          Track research, contacts, and cold emails. Top 3 priorities are highlighted.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <a
          class="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium no-underline transition-opacity hover:opacity-90"
          style="border-color: var(--gk-color-border); background: var(--gk-color-surface-elevated); color: var(--gk-color-on-surface)"
          :href="exportUrl('json')"
          download
        >Export JSON</a>
        <a
          class="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium no-underline transition-opacity hover:opacity-90"
          style="border-color: var(--gk-color-border); background: var(--gk-color-surface-elevated); color: var(--gk-color-on-surface)"
          :href="exportUrl('csv')"
          download
        >Export CSV</a>
        <GkButton
          v-if="isComingSoon"
          type="button"
          disabled
          variant="secondary"
        >
          Import CSV — coming soon
        </GkButton>
        <NuxtLink v-else to="/startups/import" class="inline-flex !no-underline">
          <GkButton type="button" variant="secondary">Import CSV</GkButton>
        </NuxtLink>
        <GkButton
          v-if="isComingSoon"
          type="button"
          disabled
        >
          Add startup — coming soon
        </GkButton>
        <NuxtLink v-else to="/startups/new" class="inline-flex !no-underline">
          <GkButton type="button">Add startup</GkButton>
        </NuxtLink>
      </div>
    </div>

    <section class="rounded-xl border border-amber-900/40 bg-gradient-to-br from-amber-950/30 to-slate-900/80 p-5">
      <h2 class="text-lg font-semibold text-amber-100">
        God Plans
      </h2>
      <p class="mt-2 text-sm leading-relaxed text-slate-300">
        <strong class="text-amber-200/90">God Plans</strong> are the upcoming paid tiers for this workspace: deeper startup CRM,
        guided outreach sequences, and tighter integration with the God Jobs board (saved searches, alerts, and shared shortlists for teams).
        We are finishing the core job experience first; CRM actions above are temporarily marked <em class="text-slate-400">coming soon</em> until billing and quotas are ready.
      </p>
      <p class="mt-3 text-xs text-slate-500">
        Expect a simple <span class="text-slate-400">Starter</span> tier for solo operators and a <span class="text-slate-400">Team / God</span> tier with seats, exports, and priority sync—details will ship with pricing.
      </p>
    </section>

    <div class="gj-surface flex flex-col gap-3 rounded-[var(--gk-radius-lg)] p-4 sm:flex-row sm:items-end">
      <GkField class="min-w-0 flex-1" label="Search">
        <GkInput
          v-model="q"
          type="search"
          placeholder="Search name, description, stack…"
        />
      </GkField>
      <div class="w-full min-w-0 sm:max-w-[10rem]">
        <GkField label="Status">
          <GkSelect
            v-model="status"
            :options="[...statusOptions]"
          />
        </GkField>
      </div>
      <div class="w-full min-w-0 sm:max-w-[12rem]">
        <GkField label="Order">
          <GkSelect
            v-model="sort"
            :options="[...sortOptions]"
          />
        </GkField>
      </div>
      <GkButton type="button" variant="secondary" :disabled="pending" @click="refresh()">
        Refresh
      </GkButton>
    </div>

    <GkAlert v-if="error" variant="danger" :text="String(error?.message || error)" />
    <div v-else-if="pending" class="flex items-center gap-2 text-sm" style="color: var(--gk-color-on-surface-variant)">
      <GkSpinner />
      <span>Loading…</span>
    </div>

    <div v-else class="overflow-x-auto rounded-[var(--gk-radius-lg)] border" style="border-color: var(--gk-color-border)">
      <table class="min-w-full divide-y text-left text-sm" style="color: var(--gk-color-on-surface); --tw-divide-opacity:1; border-color: var(--gk-color-border)">
        <thead class="text-xs uppercase tracking-wide" style="background: var(--gk-color-surface-elevated); color: var(--gk-color-on-surface-variant)">
          <tr>
            <th class="px-4 py-3">Priority</th>
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Stage</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Updated</th>
          </tr>
        </thead>
        <tbody class="divide-y" style="border-color: var(--gk-color-border)">
          <tr
            v-for="row in startups ?? []"
            :key="row.id"
            :class="['transition-colors', priorityClass(row)]"
          >
            <td class="px-4 py-3" style="color: var(--gk-color-on-surface-variant)">
              <span v-if="row.priorityRank" class="font-mono text-amber-200">P{{ row.priorityRank }}</span>
              <span v-else class="text-slate-600">—</span>
            </td>
            <td class="px-4 py-3">
              <NuxtLink :to="`/startups/${row.id}`" class="font-medium" style="color: var(--gk-color-primary)">
                {{ row.name }}
              </NuxtLink>
              <div v-if="row.website" class="truncate text-xs" style="color: var(--gk-color-on-surface-variant)">
                {{ row.website }}
              </div>
            </td>
            <td class="max-w-xs truncate px-4 py-3" style="color: var(--gk-color-on-surface-variant)">
              {{ row.fundingStage || '—' }}
            </td>
            <td class="px-4 py-3">
              <span class="rounded-full px-2 py-0.5 text-xs" :class="statusBadge(row.status)">
                {{ row.status }}
              </span>
            </td>
            <td class="whitespace-nowrap px-4 py-3" style="color: var(--gk-color-on-surface-variant)">
              {{ row.updatedAt?.slice(0, 10) }}
            </td>
          </tr>
        </tbody>
      </table>
      <p
        v-if="!pending && startups && startups.length === 0"
        class="px-4 py-8 text-center text-sm"
        style="color: var(--gk-color-on-surface-variant)"
      >
        No startups yet. Add one or adjust filters.
      </p>
    </div>
  </div>
</template>
