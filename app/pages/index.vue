<script setup lang="ts">
useSiteSeo({
  title: 'Home',
  description: 'God Jobs surfaces standout roles from curated feeds—search remote and on-site listings in one place.',
  path: '/',
  indexable: true,
})
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-8">
    <div class="space-y-3">
      <h1 class="text-3xl font-semibold tracking-tight text-white">
        The best jobs in one place
      </h1>
      <p class="text-lg text-slate-400">
        Browse aggregated listings, filter by role and workplace, and jump straight to the source. Built for people who care where they work next.
      </p>
    </div>
    <div class="flex flex-wrap gap-3">
      <NuxtLink
        to="/jobs"
        class="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"
      >
        View job listings
      </NuxtLink>
      <NuxtLink
        to="/startups"
        class="inline-flex items-center rounded-lg border border-slate-600 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
      >
        Startup outreach (private)
      </NuxtLink>
    </div>
  </div>
</template>
