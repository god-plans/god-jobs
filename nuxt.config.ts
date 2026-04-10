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
  },
})
