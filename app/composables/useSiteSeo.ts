/**
 * Sets title, description, Open Graph/Twitter tags, robots, and canonical URL
 * when `NUXT_PUBLIC_SITE_URL` is set (recommended in production).
 */
export function useSiteSeo(opts: {
  title: string
  description: string
  /** Path starting with / (e.g. `/jobs`) */
  path: string
  /** Default true. Use false for CRM / internal tools. */
  indexable?: boolean
}) {
  const config = useRuntimeConfig()
  const raw = String(config.public.siteUrl ?? '').trim()
  const base = raw.replace(/\/$/, '')
  const p = opts.path.startsWith('/') ? opts.path : `/${opts.path}`
  const absolute = base ? `${base}${p}` : ''

  const indexable = opts.indexable !== false
  const robotsContent = indexable ? 'index, follow' : 'noindex, nofollow'

  useSeoMeta({
    title: opts.title,
    description: opts.description,
    robots: robotsContent,
    ogTitle: opts.title,
    ogDescription: opts.description,
    ogType: 'website',
    ...(absolute ? { ogUrl: absolute } : {}),
    twitterCard: 'summary_large_image',
    twitterTitle: opts.title,
    twitterDescription: opts.description,
  })

  if (absolute) {
    useHead({
      link: [{ rel: 'canonical', href: absolute }],
    })
  }
}
