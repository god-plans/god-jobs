import { setResponseHeader } from 'h3'
import { getPublicSiteUrl } from '../utils/siteUrl'

function escapeXmlUrl(loc: string) {
  return loc.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

export default defineEventHandler((event) => {
  const base = getPublicSiteUrl(event).replace(/\/$/, '')
  const lastmod = new Date().toISOString().slice(0, 10)
  const entries: { loc: string; changefreq: string; priority: string }[] = [
    { loc: `${base}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${base}/jobs`, changefreq: 'daily', priority: '0.9' },
  ]
  const urls = entries.map(
    e =>
      `  <url><loc>${escapeXmlUrl(e.loc)}</loc><lastmod>${lastmod}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`,
  )

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return xml
})
