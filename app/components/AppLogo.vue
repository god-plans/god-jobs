<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** When false, renders a div (e.g. hero) instead of a home link */
    asLink?: boolean
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    showWordmark?: boolean
    wordmarkClass?: string
  }>(),
  {
    asLink: true,
    size: 'md',
    showWordmark: true,
    wordmarkClass: 'text-xl font-semibold tracking-tight sm:text-2xl text-[var(--gk-color-on-surface)]',
  },
)

const imgClass = computed(() => {
  const map = {
    xs: 'h-9 w-9',
    sm: 'h-12 w-12',
    md: 'h-14 w-14 sm:h-16 sm:w-16',
    lg: 'h-24 w-24 sm:h-28 sm:w-28',
    xl: 'h-32 w-32 sm:h-40 sm:w-40',
  }
  return map[props.size]
})

const imgAlt = computed(() => (props.showWordmark ? '' : 'God Jobs'))
</script>

<template>
  <NuxtLink
    v-if="asLink"
    to="/"
    class="inline-flex items-center gap-3 rounded-md outline-none ring-emerald-500/0 transition hover:opacity-90 focus-visible:ring-2"
  >
    <img
      src="/logo.png"
      :alt="imgAlt"
      width="160"
      height="160"
      class="shrink-0 object-contain"
      :class="imgClass"
    >
    <span v-if="showWordmark" :class="wordmarkClass">God Jobs</span>
  </NuxtLink>
  <div v-else class="inline-flex items-center gap-3">
    <img
      src="/logo.png"
      :alt="imgAlt"
      width="160"
      height="160"
      class="shrink-0 object-contain"
      :class="imgClass"
    >
    <span v-if="showWordmark" :class="wordmarkClass">God Jobs</span>
  </div>
</template>
