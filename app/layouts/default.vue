<script setup lang="ts">
const mobileNavOpen = ref(false)

function closeMobileNav() {
  mobileNavOpen.value = false
}

const route = useRoute()
watch(() => route.fullPath, () => {
  closeMobileNav()
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <header class="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div class="min-w-0 shrink">
          <AppLogo />
        </div>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg border border-slate-700 p-2 text-slate-200 hover:bg-slate-800 md:hidden"
          :aria-expanded="mobileNavOpen"
          aria-controls="site-mobile-nav"
          aria-label="Open menu"
          @click="mobileNavOpen = !mobileNavOpen"
        >
          <svg v-if="!mobileNavOpen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
        <nav class="hidden items-center justify-end gap-1 text-sm md:flex md:gap-2 lg:gap-4" aria-label="Main">
          <NuxtLink
            to="/jobs"
            class="rounded-md px-2 py-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
            active-class="bg-slate-800 text-white"
          >
            Jobs
          </NuxtLink>
          <NuxtLink
            to="/startups"
            class="rounded-md px-2 py-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
            active-class="bg-slate-800 text-white"
          >
            Startups
          </NuxtLink>
          <NuxtLink
            to="/prompts"
            class="rounded-md px-2 py-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
            active-class="bg-slate-800 text-white"
          >
            Prompts
          </NuxtLink>
          <a
            href="https://github.com/god-plans"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
            aria-label="God Plans on GitHub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 opacity-90" aria-hidden="true">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
        </nav>
      </div>
      <div
        v-show="mobileNavOpen"
        id="site-mobile-nav"
        class="border-t border-slate-800 bg-slate-900/95 px-4 py-3 md:hidden"
      >
        <nav class="flex flex-col gap-1 text-sm" aria-label="Mobile main">
          <NuxtLink
            to="/jobs"
            class="rounded-lg px-3 py-2.5 text-slate-200 hover:bg-slate-800"
            active-class="bg-slate-800 text-white"
            @click="closeMobileNav"
          >
            Jobs
          </NuxtLink>
          <NuxtLink
            to="/startups"
            class="rounded-lg px-3 py-2.5 text-slate-200 hover:bg-slate-800"
            active-class="bg-slate-800 text-white"
            @click="closeMobileNav"
          >
            Startups
          </NuxtLink>
          <NuxtLink
            to="/prompts"
            class="rounded-lg px-3 py-2.5 text-slate-200 hover:bg-slate-800"
            active-class="bg-slate-800 text-white"
            @click="closeMobileNav"
          >
            Prompts
          </NuxtLink>
          <a
            href="https://github.com/god-plans"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-slate-200 hover:bg-slate-800"
            aria-label="God Plans on GitHub"
            @click="closeMobileNav"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 opacity-90" aria-hidden="true">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>
