// https://nuxt.com/docs/api/configuration/nuxt-config

function useNetlifyNitroPreset() {
  return Boolean(
    process.env.NETLIFY
    || process.env.SERVER_PRESET === 'netlify',
  )
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],

  css: [
    'god-kit/tokens.css',
    'god-kit/vue.css',
    '~/assets/css/god-jobs-gk.css',
  ],

  /**
   * Netlify sets `NETLIFY` during build. Some sites set `SERVER_PRESET=netlify` in the UI instead.
   * CJS deps like papaparse can break Nitro's file tracer unless SSR bundles them.
   */
  nitro: {
    preset: useNetlifyNitroPreset() ? 'netlify' : undefined,
  },

  vite: {
    resolve: {
      /** One physical `god-kit` + `vue` (avoids duplicate `injection` symbols and broken `GK_FORM_CONTROLS`). */
      dedupe: ['god-kit', 'vue'],
    },
    /** Bundle god-kit in the SSR graph (single dep graph, fewer duplicate Vue/plugin instances). */
    ssr: {
      noExternal: ['god-kit', 'papaparse'],
    },
    /** Prebundle these entry points for more predictable dev client resolution. */
    optimizeDeps: {
      include: ['god-kit/vue', 'god-kit/vue/config'],
    },
  },

  devServer: {
    port: 3039, // to avoid conflicts with other projects

  },

  runtimeConfig: {
    /** Newline- or comma-separated RSS/Atom URLs (e.g. RSSHub `…/telegram/channel/:username`). Override with env `NUXT_JOBS_RSS_FEEDS`. */
    jobsRssFeeds: '',
    /** Comma-separated Greenhouse board tokens, or keyword `curated` for a built-in pack. Env: `NUXT_JOBS_GREENHOUSE_BOARDS`. */
    jobsGreenhouseBoards: '',
    /** Optional URL to a plain-text list of board tokens (one per line; `#` comments ok). Env: `NUXT_JOBS_GREENHOUSE_BOARD_LIST_URL`. */
    jobsGreenhouseBoardListUrl: '',
    /** Override User-Agent for job connector HTTP requests if a provider returns 403 on your host (e.g. Remote OK on some VPS IPs). Env: `NUXT_JOBS_FETCH_USER_AGENT`. */
    jobsFetchUserAgent: '',
    /** HTTP(S) proxy URL for job sync outbound requests (Undici). Env: `NUXT_JOBS_HTTPS_PROXY`. Use if Remote OK returns 403 from your host’s IP. */
    jobsHttpsProxy: '',
    public: {
      /** Public site origin (no trailing slash). Used for canonical URLs, Open Graph, and sitemap. Set via `NUXT_PUBLIC_SITE_URL`. */
      siteUrl: '',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s · God Jobs',
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'apple-touch-icon', href: '/logo.png' },
      ],
      meta: [
        { property: 'og:locale', content: 'en_US' },
      ],
    },
  },
})
