<script setup lang="ts">
import { GkButton, GkGrid, GkStack } from 'god-kit/vue'

useSiteSeo({
  title: 'Open-source job board & feed aggregator',
  description:
    'Search remote jobs and on-site roles in one place. God Jobs aggregates listings from Remotive, Remote OK, Arbeitnow, Jobicy, Hacker News, optional Greenhouse boards, and RSS—filter by keyword, company, location, and workplace; open each post at the source.',
  path: '/',
  indexable: true,
})

const config = useRuntimeConfig()
const siteBase = computed(() => String(config.public.siteUrl ?? '').trim().replace(/\/$/, ''))
const router = useRouter()

function go(path: string) {
  return router.push(path)
}

const websiteJsonLd = computed(() => {
  const base = siteBase.value
  if (!base)
    return null
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'God Jobs',
    url: base,
    description:
      'Open-source job board aggregating remote and on-site listings from public APIs and RSS. Search and filter roles; apply at each employer’s original listing.',
    publisher: {
      '@type': 'Organization',
      name: 'God Jobs',
      url: base,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${base}/jobs?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
})

useHead({
  script: computed(() =>
    websiteJsonLd.value
      ? [{ type: 'application/ld+json', key: 'ld-json-website', children: JSON.stringify(websiteJsonLd.value) }]
      : [],
  ),
})
</script>

<template>
  <div class="w-full space-y-20">
    <!-- Hero -->
    <section class=" relative overflow-hidden px-6 py-14 sm:px-10 sm:py-20">
      <div
        class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-sky-500/5 blur-3xl"
        aria-hidden="true"
      />
      <div class="relative mx-auto max-w-3xl text-center">
        <div class="mb-6 flex justify-center">
          <AppLogo :as-link="false" size="xl" :show-wordmark="false" />
        </div>
        <p class="text-xs font-medium uppercase tracking-widest" style="color: var(--gk-color-primary)">
          Curated job feeds · One search
        </p>
        <h1 class="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl" style="color: var(--gk-color-on-surface)">
          The best jobs in one place
        </h1>
        <p class="mx-auto mt-5 max-w-xl text-lg leading-relaxed" style="color: var(--gk-color-on-surface-variant)">
          Aggregate listings from Remotive, Remote OK, Arbeitnow, Hacker News, and optional RSS—then filter by role,
          company, location, and remote or on-site. Every row links out so you apply where the role actually lives.
        </p>
        <div class="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <GkButton type="button" class="w-full sm:w-auto" @click="go('/jobs')">
            Open the job board
          </GkButton>
          <GkButton type="button" class="w-full sm:w-auto" variant="secondary" @click="go('/jobs')">
            Browse all listings
          </GkButton>
        </div>
        <p class="mt-6 text-xs" style="color: var(--gk-color-on-surface-variant)">
          No account required to search. Export JSON/CSV from the jobs page when you need a spreadsheet.
        </p>
      </div>
    </section>

    <!-- Job board intro -->
    <section class="mx-auto mt-16 max-w-5xl px-1">
      <GkStack direction="row" :wrap="true" :gap="4" align="start" class="!flex-col lg:!flex-row lg:items-start lg:gap-16" tag="div">
        <div class="min-w-0 flex-1 space-y-4">
          <h2 class="text-2xl font-semibold tracking-tight sm:text-3xl" style="color: var(--gk-color-on-surface)">
            Meet the job page
          </h2>
          <p class="leading-relaxed" style="color: var(--gk-color-on-surface-variant)">
            The <strong class="font-medium" style="color: var(--gk-color-on-surface)">Jobs</strong> area is the heart of God Jobs: a single table of
            opportunities with category chips, full-text search, source filters, date ranges, and pagination. Sync pulls
            the latest posts from configured feeds so your view stays fresh.
          </p>
          <ul class="space-y-3 text-sm" style="color: var(--gk-color-on-surface)">
            <li class="flex gap-3">
              <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold" style="background: color-mix(in srgb, var(--gk-color-primary) 25%, transparent); color: var(--gk-color-primary)">1</span>
              <span><strong style="color: var(--gk-color-on-surface)">Search &amp; chips</strong> — Filter by frontend, backend, DevOps, and more, or type your own keywords.</span>
            </li>
            <li class="flex gap-3">
              <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold" style="background: color-mix(in srgb, var(--gk-color-primary) 25%, transparent); color: var(--gk-color-primary)">2</span>
              <span><strong style="color: var(--gk-color-on-surface)">Workplace &amp; place</strong> — Remote, on-site, company name, and location in one place.</span>
            </li>
            <li class="flex gap-3">
              <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold" style="background: color-mix(in srgb, var(--gk-color-primary) 25%, transparent); color: var(--gk-color-primary)">3</span>
              <span><strong style="color: var(--gk-color-on-surface)">Source-aware</strong> — See which feed each row came from, then open the original posting in a click.</span>
            </li>
          </ul>
          <div class="pt-2">
            <NuxtLink
              to="/jobs"
              class="inline-flex items-center gap-2 text-sm font-semibold underline-offset-2"
              style="color: var(--gk-color-primary)"
            >
              Go to job listings
              <span aria-hidden="true">→</span>
            </NuxtLink>
          </div>
        </div>
        <aside class="gj-surface w-full shrink-0 rounded-2xl p-6 lg:max-w-sm">
          <h3 class="text-sm font-semibold uppercase tracking-wide" style="color: var(--gk-color-on-surface-variant)">
            On the jobs page
          </h3>
          <ul class="mt-4 space-y-3 text-sm" style="color: var(--gk-color-on-surface)">
            <li class="flex items-start gap-2">
              <span style="color: var(--gk-color-primary)">✓</span>
              Sticky search and filters while you scroll
            </li>
            <li class="flex items-start gap-2">
              <span style="color: var(--gk-color-primary)">✓</span>
              Sync button to refresh from APIs and RSS
            </li>
            <li class="flex items-start gap-2">
              <span style="color: var(--gk-color-primary)">✓</span>
              JSON &amp; CSV export for your own tracking
            </li>
          </ul>
          <GkButton type="button" class="mt-6 w-full" @click="go('/jobs')">
            Explore jobs
          </GkButton>
        </aside>
      </GkStack>
    </section>

    <!-- How it works -->
    <section class="mx-auto mt-20 max-w-5xl px-1">
      <h2 class="text-center text-2xl font-semibold tracking-tight sm:text-3xl" style="color: var(--gk-color-on-surface)">
        How it works
      </h2>
      <p class="mx-auto mt-3 max-w-2xl text-center" style="color: var(--gk-color-on-surface-variant)">
        Three steps from browse to application—without locking you into a proprietary apply flow.
      </p>
      <GkGrid :columns="3" :columns-mobile="1" :gap="4" class="mt-10" tag="div">
        <div class="gj-surface rounded-[var(--gk-radius-lg)] p-6">
          <div class="text-2xl font-semibold" style="color: var(--gk-color-primary)">01</div>
          <h3 class="mt-3 font-semibold" style="color: var(--gk-color-on-surface)">Aggregate</h3>
          <p class="mt-2 text-sm leading-relaxed" style="color: var(--gk-color-on-surface-variant)">
            Feeds and APIs are normalized into one list so you are not jumping between ten career sites every morning.
          </p>
        </div>
        <div class="gj-surface rounded-[var(--gk-radius-lg)] p-6">
          <div class="text-2xl font-semibold" style="color: var(--gk-color-primary)">02</div>
          <h3 class="mt-3 font-semibold" style="color: var(--gk-color-on-surface)">Refine</h3>
          <p class="mt-2 text-sm leading-relaxed" style="color: var(--gk-color-on-surface-variant)">
            Use categories, text search, and filters to match how you actually job hunt—not just keyword bingo.
          </p>
        </div>
        <div class="gj-surface rounded-[var(--gk-radius-lg)] p-6">
          <div class="text-2xl font-semibold" style="color: var(--gk-color-primary)">03</div>
          <h3 class="mt-3 font-semibold" style="color: var(--gk-color-on-surface)">Apply at the source</h3>
          <p class="mt-2 text-sm leading-relaxed" style="color: var(--gk-color-on-surface-variant)">
            Each listing links to the original post. You apply where the employer expects—not through a middleman form.
          </p>
        </div>
      </GkGrid>
    </section>

    <!-- Workspace / God Plans teaser -->
    <section class="mx-auto mt-20 max-w-5xl px-1">
      <div class="gj-surface rounded-2xl px-6 py-10 sm:px-10">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-xl font-semibold sm:text-2xl" style="color: var(--gk-color-on-surface)">
            Private workspace &amp; God Plans
          </h2>
          <p class="mt-3 leading-relaxed" style="color: var(--gk-color-on-surface-variant)">
            Beyond the public job board, God Jobs includes a private area for startup research, outreach drafts, and
            prompt tooling—tied to upcoming <strong class="font-medium" style="color: var(--gk-color-on-surface)">God Plans</strong> tiers for teams who want CRM-style workflows next to the feed.
          </p>
          <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <GkButton type="button" variant="secondary" @click="go('/startups')">
              Startup workspace
            </GkButton>
            <GkButton type="button" variant="ghost" @click="go('/prompts')">
              Prompt pack
            </GkButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom CTA -->
    <section class="mx-auto mt-20 mb-4 max-w-5xl px-1 pb-8">
      <div
        class="rounded-2xl border px-6 py-10 text-center sm:px-12"
        style="
          border-color: color-mix(in srgb, var(--gk-color-primary) 30%, var(--gk-color-border));
          background: linear-gradient(140deg, color-mix(in srgb, var(--gk-color-primary) 15%, var(--gk-color-surface)) 0%, var(--gk-color-surface) 100%);
        "
      >
        <h2 class="text-xl font-semibold sm:text-2xl" style="color: var(--gk-color-on-surface)">
          Ready to find your next role?
        </h2>
        <p class="mx-auto mt-2 max-w-lg text-sm" style="color: var(--gk-color-on-surface-variant)">
          Jump into the job board and start searching—filters and exports are there when you need them.
        </p>
        <GkButton type="button" class="mt-6" @click="go('/jobs')">
          View job listings
        </GkButton>
        <p class="mt-5 text-xs" style="color: var(--gk-color-on-surface-variant)">
          Part of
          <a
            href="https://github.com/god-plans"
            target="_blank"
            rel="noopener noreferrer"
            class="underline underline-offset-2"
            style="color: var(--gk-color-primary)"
          >God Plans on GitHub</a>
          — open-source tools for builders.
        </p>
      </div>
    </section>
  </div>
</template>
