import { ProxyAgent } from 'undici'

function readProxyUrl(): string {
  return (
    String(process.env.NUXT_JOBS_HTTPS_PROXY ?? '').trim()
    || String(process.env.JOBS_HTTPS_PROXY ?? '').trim()
    || String(process.env.HTTPS_PROXY ?? '').trim()
  )
}

let cachedProxyUrl: string | null = null
let dispatcher: ProxyAgent | undefined

function getDispatcher(): ProxyAgent | undefined {
  const url = readProxyUrl()
  if (!url) {
    cachedProxyUrl = ''
    dispatcher = undefined
    return undefined
  }
  if (cachedProxyUrl === url && dispatcher)
    return dispatcher
  cachedProxyUrl = url
  try {
    dispatcher = new ProxyAgent(url)
  }
  catch {
    dispatcher = undefined
  }
  return dispatcher
}

/**
 * Outbound fetch for job connectors. When `NUXT_JOBS_HTTPS_PROXY`, `JOBS_HTTPS_PROXY`, or `HTTPS_PROXY`
 * is set, traffic uses that HTTP(S) proxy (Undici {@link ProxyAgent}). Helps when providers (e.g. Remote OK
 * behind Cloudflare) return HTTP 403 for datacenter IPs.
 */
export function jobsFetch(input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response> {
  const d = getDispatcher()
  if (d)
    return fetch(input, { ...init, dispatcher: d })
  return fetch(input, init)
}
