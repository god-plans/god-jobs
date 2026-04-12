<script setup lang="ts">
import {
  masterPrompt,
  deepAnalysisPrompt,
  rewriteEmailPrompt,
  seniorEngineerPrompt,
  defaultPlaceholders,
  fillTemplate,
} from '~/utils/prompts'
import { isComingSoon } from '~~/shared/comingSoon'

useSiteSeo({
  title: 'Prompt pack',
  description: 'Internal prompt templates for research and outreach workflows.',
  path: '/prompts',
  indexable: false,
})

const prefs = ref('')
const startupName = ref('')
const startupUrl = ref('')
const emailBody = ref('')

const filledMaster = computed(() =>
  fillTemplate(masterPrompt, {
    ...defaultPlaceholders,
    prefs: prefs.value ? `\nAdditional preferences:\n${prefs.value}\n` : '',
  }),
)

const filledDeep = computed(() =>
  fillTemplate(deepAnalysisPrompt, {
    startupName: startupName.value || '{startupName}',
    startupUrl: startupUrl.value || '{startupUrl}',
  }),
)

const filledRewrite = computed(() =>
  fillTemplate(rewriteEmailPrompt, {
    email: emailBody.value || '{paste your email}',
  }),
)

const filledSenior = computed(() =>
  fillTemplate(seniorEngineerPrompt, {
    startupName: startupName.value || '{startupName}',
    startupUrl: startupUrl.value || '{startupUrl}',
  }),
)

const copied = ref<string | null>(null)
async function copy(text: string, key: string) {
  if (isComingSoon)
    return
  try {
    await navigator.clipboard.writeText(text)
    copied.value = key
    setTimeout(() => {
      copied.value = null
    }, 2000)
  }
  catch {
    copied.value = 'err'
  }
}
</script>

<template>
  <div class="space-y-10">
    <div>
      <div class="flex flex-wrap items-center gap-3">
        <AppLogo :as-link="false" size="sm" :show-wordmark="false" />
        <h1 class="text-2xl font-semibold text-white">Prompt pack</h1>
      </div>
      <p class="mt-1 text-sm text-slate-400">
        Copy prompts into ChatGPT or your agent. Optional fields below fill placeholders in follow-up prompts.
      </p>
    </div>

    <section class="space-y-2 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <h2 class="text-sm font-medium text-slate-200">Context for follow-up prompts</h2>
      <label class="block text-xs text-slate-500">Extra preferences (appended to master prompt)</label>
      <textarea
        v-model="prefs"
        rows="2"
        class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
        placeholder="e.g. Prefer B2B SaaS, avoid crypto…"
      />
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="block text-xs text-slate-500">
          Startup name
          <input v-model="startupName" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white">
        </label>
        <label class="block text-xs text-slate-500">
          Startup URL
          <input v-model="startupUrl" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white">
        </label>
      </div>
      <label class="block text-xs text-slate-500">
        Email to rewrite (for “rewrite email” prompt)
        <textarea
          v-model="emailBody"
          rows="4"
          class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
        />
      </label>
    </section>

    <section
      v-for="block in [
        { key: 'master', title: 'Master — research + outreach', text: filledMaster },
        { key: 'deep', title: 'Follow-up — deep analysis', text: filledDeep },
        { key: 'rewrite', title: 'Follow-up — rewrite email', text: filledRewrite },
        { key: 'senior', title: 'Advanced — product engineer wins', text: filledSenior },
      ]"
      :key="block.key"
      class="space-y-2"
    >
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-sm font-medium text-slate-200">{{ block.title }}</h2>
        <button
          type="button"
          class="rounded-md px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60"
          :class="isComingSoon ? 'bg-slate-800/80 text-slate-500' : 'bg-slate-800 text-slate-100 hover:bg-slate-700'"
          :disabled="isComingSoon"
          @click="copy(block.text, block.key)"
        >
          {{ isComingSoon ? 'Coming soon' : copied === block.key ? 'Copied' : 'Copy' }}
        </button>
      </div>
      <pre class="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-300">{{ block.text }}</pre>
    </section>
  </div>
</template>
