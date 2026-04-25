<script setup lang="ts">
import { GkButton, GkField, GkGrid, GkInput, GkTextarea } from 'god-kit/vue'
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

const promptBlocks = computed(() => [
  { key: 'master', title: 'Master — research + outreach', text: filledMaster.value },
  { key: 'deep', title: 'Follow-up — deep analysis', text: filledDeep.value },
  { key: 'rewrite', title: 'Follow-up — rewrite email', text: filledRewrite.value },
  { key: 'senior', title: 'Advanced — product engineer wins', text: filledSenior.value },
])

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
  <div class="space-y-10 lg:p-8 p-4">
    <div>
      <div class="flex flex-wrap items-center gap-3">
        <AppLogo :as-link="false" size="sm" :show-wordmark="false" />
        <h1 class="text-2xl font-semibold" style="color: var(--gk-color-on-surface)">Prompt pack</h1>
      </div>
      <p class="mt-1 text-sm" style="color: var(--gk-color-on-surface-variant)">
        Copy prompts into ChatGPT or your agent. Optional fields below fill placeholders in follow-up prompts.
      </p>
    </div>

    <section class="gj-surface space-y-3 rounded-[var(--gk-radius-lg)] p-4">
      <h2 class="text-sm font-medium" style="color: var(--gk-color-on-surface)">Context for follow-up prompts</h2>
      <GkField label="Extra preferences (appended to master prompt)">
        <GkTextarea
          v-model="prefs"
          :rows="2"
          placeholder="e.g. Prefer B2B SaaS, avoid crypto…"
        />
      </GkField>
      <GkGrid :columns="2" :columns-mobile="1" :gap="3">
        <GkField label="Startup name">
          <GkInput v-model="startupName" type="text" />
        </GkField>
        <GkField label="Startup URL">
          <GkInput v-model="startupUrl" type="url" />
        </GkField>
      </GkGrid>
      <GkField label="Email to rewrite (for &quot;rewrite email&quot; prompt)">
        <GkTextarea v-model="emailBody" :rows="4" />
      </GkField>
    </section>

    <section
      v-for="block in promptBlocks"
      :key="block.key"
      class="space-y-2"
    >
      <div class="flex items-center justify-between gap-2">
        <h2 class="text-sm font-medium" style="color: var(--gk-color-on-surface)">{{ block.title }}</h2>
        <GkButton
          type="button"
          size="sm"
          variant="secondary"
          :disabled="isComingSoon"
          @click="copy(block.text, block.key)"
        >
          {{ isComingSoon ? 'Coming soon' : copied === block.key ? 'Copied' : 'Copy' }}
        </GkButton>
      </div>
      <pre
        class="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border p-4 text-xs leading-relaxed"
        style="border-color: var(--gk-color-border); background: var(--gk-color-surface); color: var(--gk-color-on-surface)"
      >{{ block.text }}</pre>
    </section>
  </div>
</template>
