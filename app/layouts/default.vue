<script setup lang="ts">
import { GkButton, GkContainer, GkSnackbarHost } from 'god-kit/vue'
import { useGkTheme } from 'god-kit/vue/config'

const mobileNavOpen = ref(false)

function closeMobileNav() {
  mobileNavOpen.value = false
}

const route = useRoute()
watch(() => route.fullPath, () => {
  closeMobileNav()
})

const theme = useGkTheme()
const themeColor = computed(() =>
  theme.isDark.value ? '#020617' : '#f8fafc',
)

useHead({
  meta: [
    { name: 'theme-color', content: themeColor },
  ],
})
</script>

<template>
  <div class="gj-app-root">
    <header class="gj-header">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div class="min-w-0 shrink ">
          <AppLogo />
        </div>
        <nav class="hidden min-w-0 flex-1 items-center justify-end gap-1 text-sm md:flex md:gap-2 lg:gap-4" aria-label="Main">
          <NuxtLink to="/jobs" class="gj-nav-link" active-class="router-link-active">
            Jobs
          </NuxtLink>
          <NuxtLink to="/startups" class="gj-nav-link" active-class="router-link-active">
            Startups
          </NuxtLink>
          <NuxtLink to="/prompts" class="gj-nav-link" active-class="router-link-active">
            Prompts
          </NuxtLink>
          <a
            href="https://github.com/god-plans"
            target="_blank"
            rel="noopener noreferrer"
            class="gj-nav-link inline-flex items-center gap-1.5"
            aria-label="God Plans on GitHub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 opacity-90" aria-hidden="true">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
            GitHub
          </a>
        </nav>
        <div class="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div
            class="hidden items-center gap-0.5 rounded-lg p-0.5 sm:flex"
            style="background: color-mix(in srgb, var(--gk-color-on-surface) 6%, transparent)"
            title="Color theme"
            role="group"
            aria-label="Color theme"
          >
            <GkButton
              type="button"
              variant="ghost"
              size="sm"
              class="gj-theme-icon-btn"
              :class="{ 'gj-theme-icon-btn--active': theme.name.value === 'light' }"
              :aria-pressed="theme.name.value === 'light'"
              aria-label="Light theme"
              @click="theme.change('light')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            </GkButton>
            <GkButton
              type="button"
              variant="ghost"
              size="sm"
              class="gj-theme-icon-btn"
              :class="{ 'gj-theme-icon-btn--active': theme.name.value === 'dark' }"
              :aria-pressed="theme.name.value === 'dark'"
              aria-label="Dark theme"
              @click="theme.change('dark')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            </GkButton>
            <GkButton
              type="button"
              variant="ghost"
              size="sm"
              class="gj-theme-icon-btn"
              :class="{ 'gj-theme-icon-btn--active': theme.name.value === 'system' }"
              :aria-pressed="theme.name.value === 'system'"
              aria-label="System theme"
              @click="theme.change('system')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5" aria-hidden="true">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 17.25v1.007a3 3 0 0 0 .879 2.122L11.5 22h1l1.621-1.626A3 3 0 0 0 15 18.257V17.25m0 0H9m6 0h1.5a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6v9a2.25 2.25 0 0 0 2.25 2.25H9"
                />
              </svg>
            </GkButton>
          </div>
          <div class="md:hidden">
            <GkButton
              type="button"
              variant="secondary"
              class="shrink-0"
              :aria-expanded="mobileNavOpen"
              aria-controls="site-mobile-nav"
              aria-label="Open menu"
              @click="mobileNavOpen = !mobileNavOpen"
            >
              <svg
                v-if="!mobileNavOpen"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-6 w-6"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </GkButton>
          </div>
        </div>
      </div>
      <div
        v-show="mobileNavOpen"
        id="site-mobile-nav"
        class="border-t px-4 py-3 md:hidden"
        style="border-color: color-mix(in srgb, var(--gk-color-on-surface) 12%, transparent); background: var(--gk-color-surface-elevated)"
      >
        <div
          class="mb-2 flex items-center justify-center gap-0.5 rounded-lg p-0.5 sm:hidden"
          style="background: color-mix(in srgb, var(--gk-color-on-surface) 6%, transparent)"
          role="group"
          aria-label="Color theme (mobile)"
        >
          <GkButton
            type="button"
            variant="ghost"
            size="sm"
            class="gj-theme-icon-btn"
            :class="{ 'gj-theme-icon-btn--active': theme.name.value === 'light' }"
            :aria-pressed="theme.name.value === 'light'"
            aria-label="Light theme"
            @click="theme.change('light')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          </GkButton>
          <GkButton
            type="button"
            variant="ghost"
            size="sm"
            class="gj-theme-icon-btn"
            :class="{ 'gj-theme-icon-btn--active': theme.name.value === 'dark' }"
            :aria-pressed="theme.name.value === 'dark'"
            aria-label="Dark theme"
            @click="theme.change('dark')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
          </GkButton>
          <GkButton
            type="button"
            variant="ghost"
            size="sm"
            class="gj-theme-icon-btn"
            :class="{ 'gj-theme-icon-btn--active': theme.name.value === 'system' }"
            :aria-pressed="theme.name.value === 'system'"
            aria-label="System theme"
            @click="theme.change('system')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5" aria-hidden="true">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 17.25v1.007a3 3 0 0 0 .879 2.122L11.5 22h1l1.621-1.626A3 3 0 0 0 15 18.257V17.25m0 0H9m6 0h1.5a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6v9a2.25 2.25 0 0 0 2.25 2.25H9"
              />
            </svg>
          </GkButton>
        </div>
        <nav class="flex flex-col gap-1 text-sm" aria-label="Mobile main">
          <NuxtLink
            to="/jobs"
            class="gj-nav-link !block rounded-lg px-3 py-2.5"
            active-class="router-link-active"
            @click="closeMobileNav"
          >
            Jobs
          </NuxtLink>
          <NuxtLink
            to="/startups"
            class="gj-nav-link !block rounded-lg px-3 py-2.5"
            active-class="router-link-active"
            @click="closeMobileNav"
          >
            Startups
          </NuxtLink>
          <NuxtLink
            to="/prompts"
            class="gj-nav-link !block rounded-lg px-3 py-2.5"
            active-class="router-link-active"
            @click="closeMobileNav"
          >
            Prompts
          </NuxtLink>
          <a
            href="https://github.com/god-plans"
            target="_blank"
            rel="noopener noreferrer"
            class="gj-nav-link !inline-flex items-center gap-2 rounded-lg px-3 py-2.5"
            aria-label="God Plans on GitHub"
            @click="closeMobileNav"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 opacity-90" aria-hidden="true">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
            GitHub
          </a>
        </nav>
      </div>
    </header>
    <main >
      <GkContainer max-width="full" :padded="true" class="mx-auto max-w-6xl !px-0">
        <slot />
      </GkContainer>
    </main>
    <GkSnackbarHost />
  </div>
</template>
