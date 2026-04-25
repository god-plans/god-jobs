<script setup lang="ts">
import type { JobListing } from '~~/shared/job'
import { useJobSourcePill } from '~/composables/useJobSourcePill'
import { formatJobRelativeTime } from '~/utils/jobRelativeTime'
import { companyAvatarStyle, companyInitials } from '~/utils/companyAvatar'

const props = defineProps<{
  job: JobListing
}>()

const { sourcePillClass } = useJobSourcePill()

function remoteLabel(job: JobListing) {
  if (job.remote === true || job.remote === 1)
    return 'Remote'
  if (job.remote === false || job.remote === 0)
    return 'On-site'
  return null
}

const initials = computed(() => companyInitials(props.job.company))
const avatarStyle = computed(() => companyAvatarStyle(props.job.company))
const remote = computed(() => remoteLabel(props.job))
const updatedRel = computed(() => formatJobRelativeTime(props.job.updatedAt))
const updatedTitle = computed(() =>
  props.job.updatedAt ? new Date(props.job.updatedAt).toLocaleString() : undefined,
)
</script>

<template>
  <article
    class="gj-job-card group flex flex-col gap-2.5 rounded-[var(--gk-radius-lg)] border p-3 transition-[box-shadow,border-color] duration-150 sm:flex-row sm:items-start sm:gap-3 sm:p-4 md:gap-4 md:p-5"
    style="
      border-color: var(--gk-color-border);
      background: var(--gk-color-surface-elevated);
    "
  >
    <!-- Avatar: beside content on sm+; top row with timestamp on mobile -->
    <div class="flex shrink-0 items-start justify-between gap-2 sm:block sm:w-auto">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold sm:h-11 sm:w-11 sm:text-xs md:h-12 md:w-12 md:text-sm"
        :style="avatarStyle"
        aria-hidden="true"
      >
        {{ initials }}
      </div>
      <time
        class="pt-1 text-end text-[10px] tabular-nums leading-none sm:hidden"
        style="color: var(--gk-color-on-surface-variant)"
        :datetime="job.updatedAt ?? undefined"
        :title="updatedTitle"
      >
        <span class="sr-only">Last updated </span>{{ updatedRel }}
      </time>
    </div>

    <div class="flex min-w-0 flex-1 flex-col gap-1.5 sm:gap-2">
      <!-- Title: full card width on mobile; shares row with CTA from sm up -->
      <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <a
          :href="job.url"
          target="_blank"
          rel="noopener noreferrer"
          class="order-1 block w-full min-w-0 text-[15px] font-semibold leading-snug tracking-tight underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:order-none sm:flex-1 sm:text-base"
          style="color: var(--gk-color-primary)"
        >
          {{ job.title }}
        </a>
        <div class="order-2 hidden shrink-0 items-center gap-2 sm:order-none sm:flex sm:gap-2">
          <time
            class="text-end text-xs tabular-nums"
            style="color: var(--gk-color-on-surface-variant)"
            :datetime="job.updatedAt ?? undefined"
            :title="updatedTitle"
          >
            <span class="sr-only">Last updated </span>{{ updatedRel }}
          </time>
          <a
            :href="job.url"
            target="_blank"
            rel="noopener noreferrer"
            class="gj-job-card__open gj-job-card__open--inline inline-flex h-8 shrink-0 items-center justify-center rounded-md border px-3 text-xs font-semibold no-underline transition-colors sm:text-sm"
          >
            Open
          </a>
        </div>
      </div>

      <p class="text-sm font-medium leading-snug" style="color: var(--gk-color-on-surface)">
        {{ job.company ?? '—' }}
      </p>

      <p class="flex min-w-0 items-start gap-1 text-xs leading-snug sm:text-sm" style="color: var(--gk-color-on-surface-variant)">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-70 sm:h-4 sm:w-4" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <span class="min-w-0 break-words">{{ job.location?.trim() || 'Location not listed' }}</span>
      </p>

      <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span
          class="gj-pill inline-flex rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
          :class="sourcePillClass(String(job.source ?? ''))"
        >
          {{ job.source }}
        </span>
        <span
          v-if="remote"
          class="inline-flex rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset"
          style="
            background: color-mix(in srgb, var(--gk-color-on-surface) 8%, transparent);
            color: var(--gk-color-on-surface-variant);
            border-color: var(--gk-color-border);
          "
        >
          {{ remote }}
        </span>
      </div>

      <p
        v-if="job.snippet"
        class="line-clamp-2 text-[11px] leading-relaxed sm:text-xs"
        style="color: var(--gk-color-on-surface-variant)"
        v-html="job.snippet"
      />

      <a
        :href="job.url"
        target="_blank"
        rel="noopener noreferrer"
        class="gj-job-card__open gj-job-card__open--block mt-1 flex w-full items-center justify-center rounded-md border py-2.5 text-sm font-semibold no-underline transition-colors sm:hidden"
      >
        Open
      </a>
    </div>
  </article>
</template>
