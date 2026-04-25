import { GkButton } from 'god-kit'
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
  /** Default `size` (xs…xl) for GkInput, GkSelect, GkTextarea, GkCheckbox, GkRadio via `GK_FORM_CONTROLS`. */
  form: { defaultControlSize: 'sm' },
  /**
   * Per-component default props, e.g. `{ GkButton: { variant: 'secondary' } }`.
   * GkButton already defaults to `variant: 'primary'`, so `{ variant: 'primary' }` here
   * is redundant. For control `size`, prefer `form.defaultControlSize` above, or set
   * `defaults.GkInput.size` to override a single component.
   */
  defaults: {
    GkButton: { size: 'sm' },
  },
}
