import { setResponseHeader } from 'h3'
import { getPublicSiteUrl } from '../utils/siteUrl'

export default defineEventHandler((event) => {
  const base = getPublicSiteUrl(event).replace(/\/$/, '')
  const lines = ['User-Agent: *', 'Disallow:']
  if (base)
    lines.push('', `Sitemap: ${base}/sitemap.xml`)
  const body = `${lines.join('\n')}\n`
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return body
})
