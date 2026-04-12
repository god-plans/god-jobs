import type { H3Event } from 'h3'
import { getRequestURL } from 'h3'

/**
 * Canonical public origin for sitemaps and absolute links.
 * Prefer `NUXT_PUBLIC_SITE_URL`; fall back to the incoming request origin in dev.
 */
export function getPublicSiteUrl(event: H3Event): string {
  const config = useRuntimeConfig(event)
  const fromEnv = String(config.public.siteUrl ?? '').trim().replace(/\/$/, '')
  if (fromEnv)
    return fromEnv
  try {
    return getRequestURL(event).origin
  }
  catch {
    return ''
  }
}
