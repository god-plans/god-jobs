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
  /**
   * When false (default): if Remote OK blocks the host (HTTP 403), retry via CodeTabs public JSON proxy.
   * Set true only if you use NUXT_JOBS_HTTPS_PROXY / HTTPS_PROXY and want a direct trust path only.
   */
  jobsRemoteokDisableCodetabsFallback: false,
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
