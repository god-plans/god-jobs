/** Cookie + localStorage key for God Kit theme (`light` | `dark` | `system`). */
export const GOD_JOBS_THEME_KEY = 'god-jobs-theme'

export const GOD_JOBS_THEME_MAX_AGE_SEC = 60 * 60 * 24 * 365

export type GodJobsStoredTheme = 'light' | 'dark' | 'system'

export function isGodJobsThemeName(v: string | null | undefined): v is GodJobsStoredTheme {
  return v === 'light' || v === 'dark' || v === 'system'
}

/** Parse `god-jobs-theme` from `document.cookie` (client only). */
export function readGodJobsThemeFromDocumentCookie(): GodJobsStoredTheme | null {
  if (typeof document === 'undefined')
    return null
  try {
    const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${GOD_JOBS_THEME_KEY}=([^;]*)`))
    if (!m?.[1])
      return null
    const v = decodeURIComponent(m[1]!.trim()).replace(/^"+|"+$/g, '')
    return isGodJobsThemeName(v) ? v : null
  }
  catch {
    return null
  }
}
