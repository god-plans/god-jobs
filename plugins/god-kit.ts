import { createGkKit } from 'god-kit/vue/config'
import { gkKitConfig } from '~/gk.config'

export default defineNuxtPlugin({
  name: 'god-kit',
  /** Register theme / defaults on the app before other plugins that mount UI. */
  enforce: 'pre',
  setup(nuxtApp) {
    nuxtApp.vueApp.use(createGkKit(gkKitConfig))
  },
})
