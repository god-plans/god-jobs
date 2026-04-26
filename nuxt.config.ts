// https://nuxt.com/docs/api/configuration/nuxt-config

import { staticAppEnv } from './config/static-public-env'

function useNetlifyNitroPreset() {
  return Boolean(
    process.env.NETLIFY
    || process.env.SERVER_PRESET === 'netlify',
  )
}

/** First non-empty trimmed string for `runtimeConfig` defaults. Nitro still overrides with `NUXT_*` at server start. */
function jobEnv(...candidates: Array<string | undefined | null>): string {
  for (const c of candidates) {
    if (c == null) continue
    const t = String(c).trim()
    if (t !== '') return t
  }
  return ''
}

/** True if any candidate is 1 / true / yes; false if 0 / false / no; else `defaultVal`. */
function jobEnvBoolDefault(defaultVal: boolean, ...candidates: Array<string | undefined | null>): boolean {
  for (const c of candidates) {
    if (c == null) continue
    const v = String(c).trim().toLowerCase()
    if (v === '1' || v === 'true' || v === 'yes') return true
    if (v === '0' || v === 'false' || v === 'no') return false
  }
  return defaultVal
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
    /**
     * `NUXT_JOBS_RSS_FEEDS` or `JOBS_RSS_FEEDS` — newline- or comma-separated RSS/Atom URLs (e.g. RSSHub).
     * Defaults: `config/static-public-env.ts` (no Netlify UI required).
     */
    jobsRssFeeds: jobEnv(
      process.env.NUXT_JOBS_RSS_FEEDS,
      process.env.JOBS_RSS_FEEDS,
      staticAppEnv.jobsRssFeeds,
    ),
    /**
     * `NUXT_JOBS_GREENHOUSE_BOARDS` or `JOBS_GREENHOUSE_BOARDS` — board tokens or keyword `curated`.
     */
    jobsGreenhouseBoards: jobEnv(
      process.env.NUXT_JOBS_GREENHOUSE_BOARDS,
      process.env.JOBS_GREENHOUSE_BOARDS,
      staticAppEnv.jobsGreenhouseBoards,
    ),
    /**
     * `NUXT_JOBS_GREENHOUSE_BOARD_LIST_URL` or `JOBS_GREENHOUSE_BOARD_LIST_URL` — URL to plain-text token list.
     */
    jobsGreenhouseBoardListUrl: jobEnv(
      process.env.NUXT_JOBS_GREENHOUSE_BOARD_LIST_URL,
      process.env.JOBS_GREENHOUSE_BOARD_LIST_URL,
      staticAppEnv.jobsGreenhouseBoardListUrl,
    ),
    /**
     * `NUXT_JOBS_FETCH_USER_AGENT` or `JOBS_FETCH_USER_AGENT` — outbound User-Agent for job HTTP clients.
     */
    jobsFetchUserAgent: jobEnv(
      process.env.NUXT_JOBS_FETCH_USER_AGENT,
      process.env.JOBS_FETCH_USER_AGENT,
      staticAppEnv.jobsFetchUserAgent,
    ),
    /**
     * `NUXT_JOBS_HTTPS_PROXY`, `JOBS_HTTPS_PROXY`, or `HTTPS_PROXY` — Undici proxy for job sync fetches.
     */
    jobsHttpsProxy: jobEnv(
      process.env.NUXT_JOBS_HTTPS_PROXY,
      process.env.JOBS_HTTPS_PROXY,
      process.env.HTTPS_PROXY,
      staticAppEnv.jobsHttpsProxy,
    ),
    /**
     * `NUXT_JOBS_REMOTEOK_DISABLE_CODETABS_FALLBACK` or `JOBS_REMOTEOK_DISABLE_CODETABS_FALLBACK` — skip CodeTabs when Remote OK returns 403.
     */
    jobsRemoteokDisableCodetabsFallback: jobEnvBoolDefault(
      staticAppEnv.jobsRemoteokDisableCodetabsFallback,
      process.env.NUXT_JOBS_REMOTEOK_DISABLE_CODETABS_FALLBACK,
      process.env.JOBS_REMOTEOK_DISABLE_CODETABS_FALLBACK,
    ),
    /** Optional SQLite directory override (serverless defaults to OS tmp without UI env). */
    godJobsDataDir: jobEnv(
      process.env.NUXT_GOD_JOBS_DATA_DIR,
      process.env.GOD_JOBS_DATA_DIR,
      staticAppEnv.godJobsDataDir,
    ),
    godJobsSqlitePath: jobEnv(
      process.env.NUXT_GOD_JOBS_SQLITE_PATH,
      process.env.GOD_JOBS_SQLITE_PATH,
      staticAppEnv.godJobsSqlitePath,
    ),
    smtpHost: jobEnv(process.env.NUXT_SMTP_HOST, process.env.SMTP_HOST, staticAppEnv.smtpHost),
    smtpPort: Number(jobEnv(
      process.env.NUXT_SMTP_PORT,
      process.env.SMTP_PORT,
      String(staticAppEnv.smtpPort),
    )) || 587,
    smtpSecure: jobEnvBoolDefault(
      staticAppEnv.smtpSecure,
      process.env.NUXT_SMTP_SECURE,
      process.env.SMTP_SECURE,
    ),
    smtpUser: jobEnv(process.env.NUXT_SMTP_USER, process.env.SMTP_USER, staticAppEnv.smtpUser),
    smtpPass: jobEnv(process.env.NUXT_SMTP_PASS, process.env.SMTP_PASS, staticAppEnv.smtpPass),
    mailFrom: jobEnv(process.env.NUXT_MAIL_FROM, process.env.MAIL_FROM, staticAppEnv.mailFrom),
    outreachSubject: jobEnv(
      process.env.NUXT_OUTREACH_SUBJECT,
      process.env.OUTREACH_SUBJECT,
      staticAppEnv.outreachSubject,
    ),
    githubToken: jobEnv(
      process.env.NUXT_GITHUB_TOKEN,
      process.env.GITHUB_TOKEN,
      staticAppEnv.githubToken,
    ),
    public: {
      /** `NUXT_PUBLIC_SITE_URL` or `SITE_URL` — public origin, no trailing slash (canonical, OG, sitemap). */
      siteUrl: jobEnv(
        process.env.NUXT_PUBLIC_SITE_URL,
        process.env.SITE_URL,
        staticAppEnv.siteUrl,
      ),
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
