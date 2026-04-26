/**
 * Baked-in defaults so production does not depend on host env UI (e.g. Netlify).
 * Override locally with `.env` / shell when developing; `NUXT_*` still wins at runtime.
 */
export const staticAppEnv = {
  jobsRssFeeds: '',
  jobsGreenhouseBoards: '',
  jobsGreenhouseBoardListUrl: '',
  jobsFetchUserAgent: 'god-jobs/1.0 (+https://github.com/god-plans/god-jobs)',
  jobsHttpsProxy: '',
  /** Skip CodeTabs fallback when Remote OK returns 403 (typical without proxy). */
  jobsRemoteokDisableCodetabsFallback: true,
  /** Canonical origin, no trailing slash (OG, sitemap). Leave empty to derive from the request in dev. */
  siteUrl: '',

  godJobsDataDir: '',
  godJobsSqlitePath: '',

  smtpHost: '',
  smtpPort: '587',
  smtpSecure: false,
  smtpUser: '',
  smtpPass: '',
  mailFrom: '',
  outreachSubject: 'Introduction',
  githubToken: '',
} as const
