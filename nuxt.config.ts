// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],

  devServer: {
    port: 3039, // to avoid conflicts with other projects

  },

  runtimeConfig: {
    /** Newline- or comma-separated RSS/Atom URLs (e.g. RSSHub `…/telegram/channel/:username`). Override with env `NUXT_JOBS_RSS_FEEDS`. */
    jobsRssFeeds: '',
    public: {
      /** Public site origin (no trailing slash). Used for canonical URLs, Open Graph, and sitemap. Set via `NUXT_PUBLIC_SITE_URL`. */
      siteUrl: '',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s · God Jobs',
      meta: [
        { name: 'theme-color', content: '#020617' },
      ],
    },
  },
})
