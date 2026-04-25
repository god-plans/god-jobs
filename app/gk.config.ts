import type { GkKitOptions } from 'god-kit/vue/config'

/**
 * God Kit runtime config — theme, display breakpoints, and component defaults.
 * See: https://godkit.godplans.org/guide/global-configuration
 */
export const gkKitConfig: GkKitOptions = {
  theme: {
    defaultTheme: 'system',
  },
  display: {
    mobileBreakpoint: 'md',
  },
  locale: {
    locale: 'en',
    fallback: 'en',
  },
  defaults: {
    GkButton: { variant: 'primary' },
  },
}
