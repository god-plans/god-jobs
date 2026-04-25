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
    /**
     * Keep `god-kit` in the SSR/canvas Vite graph so the same ESM (and the same
     * `Symbol` injection keys for `GK_FORM_CONTROLS` / `createGkKit`) is used
     * as the client. Without this, a separate prebundle of `god-kit/vue/config`
     * vs `god-kit/vue` can yield duplicate symbols and `inject` misses `provide`.
     */
    ssr: {
      noExternal: ['papaparse', 'god-kit'],
    },
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
