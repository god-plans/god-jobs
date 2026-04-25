/**
 * Default outbound UA: includes a normal browser token — some providers (notably Remote OK / CDNs)
 * return HTTP 403 for uncommon or “library” user-agents when the request comes from datacenter IPs.
 */
const DEFAULT_JOBS_FETCH_UA =
  'Mozilla/5.0 (compatible; GodJobs/1.0; +https://github.com/god-plans/god-jobs) AppleWebKit/537.36 (KHTML, like Gecko)'

/**
 * User-Agent for job-feed HTTP requests.
 * Override with `NUXT_JOBS_FETCH_USER_AGENT` or `JOBS_FETCH_USER_AGENT` if a host still blocks your IP.
 */
export function getJobsFetchUserAgent(): string {
  const fromEnv =
    String(process.env.NUXT_JOBS_FETCH_USER_AGENT ?? '').trim()
    || String(process.env.JOBS_FETCH_USER_AGENT ?? '').trim()
  return fromEnv || DEFAULT_JOBS_FETCH_UA
}
