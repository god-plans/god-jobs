import {
  GOD_JOBS_THEME_KEY,
  GOD_JOBS_THEME_MAX_AGE_SEC,
  type GodJobsStoredTheme,
} from '~~/shared/themePreference'

const systemPrefersDark = ref(false)
let systemMqlAttached = false

function attachSystemPreferenceListener() {
  if (!import.meta.client || systemMqlAttached)
    return
  systemMqlAttached = true
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    systemPrefersDark.value = mq.matches
    mq.addEventListener('change', () => {
      systemPrefersDark.value = mq.matches
    })
  }
  catch {
    /* ignore */
  }
}

/**
 * Resolved dark/light for styling without calling `useGkTheme()` in leaf components.
 * God Kit's `useGkTheme()` falls back to a new `z("light")` context when inject fails,
 * whose watchEffect overwrites `document.documentElement` (e.g. after job cards remount).
 */
export function useGodJobsThemeIsDark() {
  const themeCookie = useCookie<GodJobsStoredTheme | null>(GOD_JOBS_THEME_KEY, {
    default: () => null,
    maxAge: GOD_JOBS_THEME_MAX_AGE_SEC,
    sameSite: 'lax',
    path: '/',
  })

  attachSystemPreferenceListener()

  const isDark = computed(() => {
    const c = themeCookie.value
    if (c === 'dark')
      return true
    if (c === 'light')
      return false
    if (c === 'system')
      return systemPrefersDark.value
    return true
  })

  return { isDark }
}
