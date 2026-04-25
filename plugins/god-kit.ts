import { createGkKit, useGkTheme } from 'god-kit/vue/config'
import { gkKitConfig } from '~/gk.config'
import {
  GOD_JOBS_THEME_KEY,
  GOD_JOBS_THEME_MAX_AGE_SEC,
  isGodJobsThemeName,
  readGodJobsThemeFromDocumentCookie,
  type GodJobsStoredTheme,
} from '~~/shared/themePreference'

const cookieOpts = {
  default: () => null as GodJobsStoredTheme | null,
  maxAge: GOD_JOBS_THEME_MAX_AGE_SEC,
  sameSite: 'lax' as const,
  path: '/',
}

/**
 * Client: prefer localStorage (always written on theme change), then raw cookie string
 * (Nuxt cookie ref can lag on hard refresh), then useCookie. Server: request cookie only.
 */
function resolveInitialTheme(cookieValue: GodJobsStoredTheme | null): GodJobsStoredTheme {
  if (import.meta.client) {
    try {
      const fromLs = localStorage.getItem(GOD_JOBS_THEME_KEY)
      if (isGodJobsThemeName(fromLs))
        return fromLs
    }
    catch {
      /* ignore */
    }
    const fromDoc = readGodJobsThemeFromDocumentCookie()
    if (fromDoc)
      return fromDoc
  }
  if (isGodJobsThemeName(cookieValue))
    return cookieValue
  return 'dark'
}

export default defineNuxtPlugin((nuxtApp) => {
  const themeCookie = useCookie<GodJobsStoredTheme | null>(GOD_JOBS_THEME_KEY, cookieOpts)

  const initial = resolveInitialTheme(themeCookie.value ?? null)
  if (themeCookie.value !== initial)
    themeCookie.value = initial

  nuxtApp.vueApp.use(
    createGkKit({
      ...gkKitConfig,
      theme: {
        ...gkKitConfig.theme,
        defaultTheme: initial,
      },
    }),
  )
})
