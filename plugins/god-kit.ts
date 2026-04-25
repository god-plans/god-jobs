import { createGkKit } from 'god-kit/vue/config'
import { gkKitConfig } from '~/gk.config'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(createGkKit(gkKitConfig))
})
