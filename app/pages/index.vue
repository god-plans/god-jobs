<script setup lang="ts">
useSiteSeo({
  title: 'Home',
  description:
    'God Jobs aggregates remote and on-site roles from trusted feeds—search by role, company, and workplace, then open listings at the source.',
  path: '/',
  indexable: true,
})
</script>

<template>
  <div class="w-full space-y-20">
    <!-- Hero -->
    <section class="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 px-6 py-14 sm:px-10 sm:py-20">
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
        <p class="text-xs font-medium uppercase tracking-widest text-emerald-400/90">
          Curated job feeds · One search
        </p>
        <h1 class="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          The best jobs in one place
        </h1>
        <p class="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-400">
          Aggregate listings from Remotive, Remote OK, Arbeitnow, Hacker News, and optional RSS—then filter by role,
          company, location, and remote or on-site. Every row links out so you apply where the role actually lives.
        </p>
        <div class="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <NuxtLink
            to="/jobs"
            class="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 sm:w-auto"
          >
            Open the job board
          </NuxtLink>
          <NuxtLink
            to="/jobs"
            class="inline-flex w-full items-center justify-center rounded-xl border border-slate-600 bg-slate-900/80 px-8 py-3.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 sm:w-auto"
          >
            Browse all listings
          </NuxtLink>
        </div>
        <p class="mt-6 text-xs text-slate-500">
          No account required to search. Export JSON/CSV from the jobs page when you need a spreadsheet.
        </p>
      </div>
    </section>

    <!-- Job board intro -->
    <section class="mx-auto mt-16 max-w-5xl px-1">
      <div class="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
        <div class="min-w-0 flex-1 space-y-4">
          <h2 class="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Meet the job page
          </h2>
          <p class="text-slate-400 leading-relaxed">
            The <strong class="font-medium text-slate-200">Jobs</strong> area is the heart of God Jobs: a single table of
            opportunities with category chips, full-text search, source filters, date ranges, and pagination. Sync pulls
            the latest posts from configured feeds so your view stays fresh.
          </p>
          <ul class="space-y-3 text-sm text-slate-300">
            <li class="flex gap-3">
              <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">1</span>
              <span><strong class="text-slate-200">Search &amp; chips</strong> — Filter by frontend, backend, DevOps, and more, or type your own keywords.</span>
            </li>
            <li class="flex gap-3">
              <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">2</span>
              <span><strong class="text-slate-200">Workplace &amp; place</strong> — Remote, on-site, company name, and location in one place.</span>
            </li>
            <li class="flex gap-3">
              <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">3</span>
              <span><strong class="text-slate-200">Source-aware</strong> — See which feed each row came from, then open the original posting in a click.</span>
            </li>
          </ul>
          <div class="pt-2">
            <NuxtLink
              to="/jobs"
              class="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Go to job listings
              <span aria-hidden="true">→</span>
            </NuxtLink>
          </div>
        </div>
        <aside class="w-full shrink-0 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:max-w-sm">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-400">
            On the jobs page
          </h3>
          <ul class="mt-4 space-y-3 text-sm text-slate-300">
            <li class="flex items-start gap-2">
              <span class="text-emerald-500/90">✓</span>
              Sticky search and filters while you scroll
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-500/90">✓</span>
              Sync button to refresh from APIs and RSS
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-500/90">✓</span>
              JSON &amp; CSV export for your own tracking
            </li>
          </ul>
          <NuxtLink
            to="/jobs"
            class="mt-6 flex w-full items-center justify-center rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Explore jobs
          </NuxtLink>
        </aside>
      </div>
    </section>

    <!-- How it works -->
    <section class="mx-auto mt-20 max-w-5xl px-1">
      <h2 class="text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        How it works
      </h2>
      <p class="mx-auto mt-3 max-w-2xl text-center text-slate-400">
        Three steps from browse to application—without locking you into a proprietary apply flow.
      </p>
      <div class="mt-10 grid gap-6 sm:grid-cols-3">
        <div class="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <div class="text-2xl font-semibold text-emerald-400/90">01</div>
          <h3 class="mt-3 font-semibold text-white">Aggregate</h3>
          <p class="mt-2 text-sm leading-relaxed text-slate-400">
            Feeds and APIs are normalized into one list so you are not jumping between ten career sites every morning.
          </p>
        </div>
        <div class="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <div class="text-2xl font-semibold text-emerald-400/90">02</div>
          <h3 class="mt-3 font-semibold text-white">Refine</h3>
          <p class="mt-2 text-sm leading-relaxed text-slate-400">
            Use categories, text search, and filters to match how you actually job hunt—not just keyword bingo.
          </p>
        </div>
        <div class="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <div class="text-2xl font-semibold text-emerald-400/90">03</div>
          <h3 class="mt-3 font-semibold text-white">Apply at the source</h3>
          <p class="mt-2 text-sm leading-relaxed text-slate-400">
            Each listing links to the original post. You apply where the employer expects—not through a middleman form.
          </p>
        </div>
      </div>
    </section>

    <!-- Workspace / God Plans teaser -->
    <section class="mx-auto mt-20 max-w-5xl px-1">
      <div class="rounded-2xl border border-slate-800 bg-slate-900/50 px-6 py-10 sm:px-10">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-xl font-semibold text-white sm:text-2xl">
            Private workspace &amp; God Plans
          </h2>
          <p class="mt-3 text-slate-400 leading-relaxed">
            Beyond the public job board, God Jobs includes a private area for startup research, outreach drafts, and
            prompt tooling—tied to upcoming <strong class="font-medium text-slate-300">God Plans</strong> tiers for teams who want CRM-style workflows next to the feed.
          </p>
          <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <NuxtLink
              to="/startups"
              class="inline-flex rounded-lg border border-slate-600 bg-slate-950 px-5 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Startup workspace
            </NuxtLink>
            <NuxtLink
              to="/prompts"
              class="inline-flex rounded-lg border border-slate-700 px-5 py-2.5 text-sm text-slate-400 hover:text-slate-300"
            >
              Prompt pack
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom CTA -->
    <section class="mx-auto mt-20 mb-4 max-w-5xl px-1 pb-8">
      <div class="rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-emerald-950/40 to-slate-900/80 px-6 py-10 text-center sm:px-12">
        <h2 class="text-xl font-semibold text-white sm:text-2xl">
          Ready to find your next role?
        </h2>
        <p class="mx-auto mt-2 max-w-lg text-sm text-slate-400">
          Jump into the job board and start searching—filters and exports are there when you need them.
        </p>
        <NuxtLink
          to="/jobs"
          class="mt-6 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-8 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          View job listings
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
