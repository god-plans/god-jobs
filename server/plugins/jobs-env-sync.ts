/**
 * Job connectors in `server/utils/jobs/*` read `process.env` for UA, proxy, and Remote OK flags.
 * Copy non-empty values from Nitro `runtimeConfig` (after env merge) so literals in `nuxt.config` and
 * runtime `NUXT_*` vars both apply without duplicating logic in every util.
 */
export default defineNitroPlugin(() => {
  const c = useRuntimeConfig()

  const assign = (envKey: string, val: string | undefined) => {
    if (process.env[envKey]?.trim()) return
    const t = val?.trim() ?? ''
    if (t !== '') process.env[envKey] = t
  }

  assign('NUXT_JOBS_FETCH_USER_AGENT', String(c.jobsFetchUserAgent ?? ''))

  assign('NUXT_JOBS_HTTPS_PROXY', String(c.jobsHttpsProxy ?? ''))

  assign('NUXT_JOBS_GREENHOUSE_BOARDS', String(c.jobsGreenhouseBoards ?? ''))
  assign('JOBS_GREENHOUSE_BOARDS', String(c.jobsGreenhouseBoards ?? ''))
  assign('NUXT_JOBS_GREENHOUSE_BOARD_LIST_URL', String(c.jobsGreenhouseBoardListUrl ?? ''))
  assign('JOBS_GREENHOUSE_BOARD_LIST_URL', String(c.jobsGreenhouseBoardListUrl ?? ''))

  if (c.jobsRemoteokDisableCodetabsFallback) {
    if (!process.env.NUXT_JOBS_REMOTEOK_DISABLE_CODETABS_FALLBACK?.trim()
      && !process.env.JOBS_REMOTEOK_DISABLE_CODETABS_FALLBACK?.trim()) {
      process.env.NUXT_JOBS_REMOTEOK_DISABLE_CODETABS_FALLBACK = '1'
    }
  }
})
