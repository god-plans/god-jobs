<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <NuxtLink to="/startups" class="text-lg font-semibold tracking-tight text-white">
          Startup outreach
        </NuxtLink>
        <nav class="flex gap-4 text-sm">
          <NuxtLink
            to="/startups"
            class="rounded-md px-2 py-1 text-slate-300 hover:bg-slate-800 hover:text-white"
            active-class="bg-slate-800 text-white"
          >
            Startups
          </NuxtLink>
          <NuxtLink
            to="/jobs"
            class="rounded-md px-2 py-1 text-slate-300 hover:bg-slate-800 hover:text-white"
            active-class="bg-slate-800 text-white"
          >
            Jobs
          </NuxtLink>
          <NuxtLink
            to="/prompts"
            class="rounded-md px-2 py-1 text-slate-300 hover:bg-slate-800 hover:text-white"
            active-class="bg-slate-800 text-white"
          >
            Prompts
          </NuxtLink>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>
