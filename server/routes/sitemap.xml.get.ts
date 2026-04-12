import { setResponseHeader } from 'h3'
import { getPublicSiteUrl } from '../utils/siteUrl'

function escapeXmlUrl(loc: string) {
  return loc.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

export default defineEventHandler((event) => {
  const base = getPublicSiteUrl(event).replace(/\/$/, '')
  const locs = [`${base}/`, `${base}/jobs`]
  const urls = locs.map(loc =>
    `  <url><loc>${escapeXmlUrl(loc)}</loc><changefreq>weekly</changefreq></url>`,
  )

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return xml
})
