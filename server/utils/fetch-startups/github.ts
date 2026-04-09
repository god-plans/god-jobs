const UA = 'god-jobs-outreach/1.0'

export type GithubOrgHit = {
  login: string
  html_url: string
  blog: string | null
  description: string | null
}

export async function searchGithubOrgs(
  q: string,
  limit: number,
  token?: string,
): Promise<GithubOrgHit[]> {
  const perPage = Math.min(30, Math.max(1, limit))
  const url = new URL('https://api.github.com/search/users')
  url.searchParams.set('q', `${q.trim()} type:org`)
  url.searchParams.set('per_page', String(perPage))
  const headers: Record<string, string> = {
    'User-Agent': UA,
    Accept: 'application/vnd.github+json',
  }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(url.toString(), { headers })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`GitHub ${res.status}: ${t.slice(0, 200)}`)
  }
  const data = (await res.json()) as { items?: Record<string, unknown>[] }
  const items = data.items ?? []
  const out: GithubOrgHit[] = []
  for (const it of items) {
    const login = typeof it.login === 'string' ? it.login : null
    const html_url = typeof it.html_url === 'string' ? it.html_url : null
    if (!login || !html_url) continue
    out.push({
      login,
      html_url,
      blog: typeof it.blog === 'string' && it.blog ? it.blog : null,
      description: typeof it.description === 'string' ? it.description : null,
    })
  }
  return out
}
