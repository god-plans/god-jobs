/** Strip HTML for readable snippets (job APIs often return description HTML). */
export function stripHtml(html: string): string {
  if (!html) return ''
  let s = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
  s = s.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
  s = s.replace(/<br\s*\/?>/gi, '\n')
  s = s.replace(/<\/p>/gi, '\n')
  s = s.replace(/<[^>]+>/g, ' ')
  s = s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => {
      const code = Number(n)
      return Number.isFinite(code) && code > 0 ? String.fromCharCode(code) : ''
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(Number.parseInt(h, 16)))
  return s.replace(/\s+/g, ' ').trim()
}

export function truncate(s: string, n = 400) {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length <= n ? t : `${t.slice(0, n)}…`
}
