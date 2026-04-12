<script setup lang="ts">
import { isComingSoon } from '~~/shared/comingSoon'

const route = useRoute()
const id = computed(() => Number(route.params.id))

const seoPath = computed(() => `/startups/${String(route.params.id)}`)
watchEffect(() => {
  useSiteSeo({
    title: 'Edit startup',
    description: 'Private startup record and outreach details.',
    path: seoPath.value,
    indexable: false,
  })
})

const { get, update, remove, sendOutreach } = useStartups()

const { data: startup, error, pending, refresh } = await useAsyncData(
  `startup-${route.params.id}`,
  () => {
    if (!Number.isFinite(id.value) || id.value < 1) {
      throw createError({ statusCode: 404, statusMessage: 'Invalid id' })
    }
    return get(id.value)
  },
  { watch: [id] },
)

const saving = ref(false)
const deleting = ref(false)
const sending = ref(false)
const err = ref('')

const form = reactive({
  name: '',
  website: '',
  description: '',
  fundingStage: '',
  fundingInfo: '',
  employeeRange: '',
  growthSignals: '',
  ceoName: '',
  ceoLinkedin: '',
  ctoName: '',
  ctoLinkedin: '',
  improvementIdea: '',
  coldEmail: '',
  notes: '',
  techStack: '',
  fitReason: '',
  contactEmail: '',
  emailSubject: '',
  priorityRank: null as number | null,
  status: 'researched',
})

watch(
  startup,
  (s) => {
    if (!s) return
    form.name = s.name ?? ''
    form.website = s.website ?? ''
    form.description = s.description ?? ''
    form.fundingStage = s.fundingStage ?? ''
    form.fundingInfo = s.fundingInfo ?? ''
    form.employeeRange = s.employeeRange ?? ''
    form.growthSignals = s.growthSignals ?? ''
    form.ceoName = s.ceoName ?? ''
    form.ceoLinkedin = s.ceoLinkedin ?? ''
    form.ctoName = s.ctoName ?? ''
    form.ctoLinkedin = s.ctoLinkedin ?? ''
    form.improvementIdea = s.improvementIdea ?? ''
    form.coldEmail = s.coldEmail ?? ''
    form.notes = s.notes ?? ''
    form.techStack = s.techStack ?? ''
    form.fitReason = s.fitReason ?? ''
    form.contactEmail = s.contactEmail ?? ''
    form.emailSubject = s.emailSubject ?? ''
    form.priorityRank = s.priorityRank
    form.status = s.status ?? 'researched'
  },
  { immediate: true },
)

async function save() {
  if (isComingSoon)
    return
  err.value = ''
  if (!form.name.trim()) {
    err.value = 'Name is required.'
    return
  }
  saving.value = true
  try {
    await update(id.value, { ...form } as Record<string, unknown>)
    await refresh()
  }
  catch (e: unknown) {
    err.value = e instanceof Error ? e.message : 'Failed to save'
  }
  finally {
    saving.value = false
  }
}

async function sendMail() {
  if (isComingSoon)
    return
  err.value = ''
  sending.value = true
  try {
    const res = await sendOutreach([id.value])
    const r = res.results[0]
    if (!r?.ok) err.value = r?.error || 'Send failed'
    await refresh()
  }
  catch (e: unknown) {
    err.value = e instanceof Error ? e.message : 'Send failed'
  }
  finally {
    sending.value = false
  }
}

async function del() {
  if (isComingSoon)
    return
  if (!confirm('Delete this startup?')) return
  deleting.value = true
  err.value = ''
  try {
    await remove(id.value)
    await navigateTo('/startups')
  }
  catch (e: unknown) {
    err.value = e instanceof Error ? e.message : 'Failed to delete'
  }
  finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <div>
      <NuxtLink to="/startups" class="text-sm text-emerald-400 hover:text-emerald-300">← Back to list</NuxtLink>
      <h1 class="mt-2 text-2xl font-semibold text-white">Edit startup</h1>
    </div>

    <p v-if="pending" class="text-sm text-slate-400">Loading…</p>
    <p v-else-if="error || !startup" class="text-sm text-red-400">
      {{ error?.message || 'Not found' }}
    </p>

    <form v-else class="space-y-4" @submit.prevent="save">
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block sm:col-span-2">
          <span class="text-xs font-medium text-slate-400">Name *</span>
          <input v-model="form.name" required class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
        </label>
        <label class="block">
          <span class="text-xs font-medium text-slate-400">Website</span>
          <input v-model="form.website" type="text" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="https://…">
        </label>
        <label class="block">
          <span class="text-xs font-medium text-slate-400">Priority (1–3)</span>
          <select v-model.number="form.priorityRank" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
            <option :value="null">None</option>
            <option :value="1">1 — highest</option>
            <option :value="2">2</option>
            <option :value="3">3</option>
          </select>
        </label>
        <label class="block sm:col-span-2">
          <span class="text-xs font-medium text-slate-400">Description</span>
          <textarea v-model="form.description" rows="3" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
        </label>
        <label class="block">
          <span class="text-xs font-medium text-slate-400">Funding stage</span>
          <input v-model="form.fundingStage" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
        </label>
        <label class="block">
          <span class="text-xs font-medium text-slate-400">Status</span>
          <select v-model="form.status" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
            <option value="researched">researched</option>
            <option value="contacted">contacted</option>
            <option value="replied">replied</option>
            <option value="archived">archived</option>
          </select>
        </label>
        <label class="block sm:col-span-2">
          <span class="text-xs font-medium text-slate-400">Funding info</span>
          <textarea v-model="form.fundingInfo" rows="2" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
        </label>
        <label class="block">
          <span class="text-xs font-medium text-slate-400">Team size</span>
          <input v-model="form.employeeRange" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
        </label>
        <label class="block sm:col-span-2">
          <span class="text-xs font-medium text-slate-400">Growth signals</span>
          <textarea v-model="form.growthSignals" rows="2" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
        </label>
        <label class="block">
          <span class="text-xs font-medium text-slate-400">CEO</span>
          <input v-model="form.ceoName" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
        </label>
        <label class="block">
          <span class="text-xs font-medium text-slate-400">CEO LinkedIn</span>
          <input v-model="form.ceoLinkedin" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
        </label>
        <label class="block">
          <span class="text-xs font-medium text-slate-400">CTO</span>
          <input v-model="form.ctoName" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
        </label>
        <label class="block">
          <span class="text-xs font-medium text-slate-400">CTO LinkedIn</span>
          <input v-model="form.ctoLinkedin" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
        </label>
        <label class="block sm:col-span-2">
          <span class="text-xs font-medium text-slate-400">Tech stack</span>
          <input v-model="form.techStack" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
        </label>
        <label class="block sm:col-span-2">
          <span class="text-xs font-medium text-slate-400">Why it fits you</span>
          <textarea v-model="form.fitReason" rows="2" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
        </label>
        <label class="block sm:col-span-2">
          <span class="text-xs font-medium text-slate-400">Improvement idea</span>
          <textarea v-model="form.improvementIdea" rows="3" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
        </label>
        <label class="block">
          <span class="text-xs font-medium text-slate-400">Contact email (recipient)</span>
          <input v-model="form.contactEmail" type="email" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="verified@company.com">
        </label>
        <label class="block">
          <span class="text-xs font-medium text-slate-400">Email subject (optional)</span>
          <input v-model="form.emailSubject" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white">
        </label>
        <label class="block sm:col-span-2">
          <span class="text-xs font-medium text-slate-400">Cold email draft</span>
          <textarea v-model="form.coldEmail" rows="8" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-sans text-sm text-white" />
        </label>
        <label class="block sm:col-span-2">
          <span class="text-xs font-medium text-slate-400">Notes</span>
          <textarea v-model="form.notes" rows="3" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
        </label>
      </div>

      <div v-if="startup?.lastOutreachAt || startup?.lastOutreachError" class="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-400">
        <p v-if="startup?.lastOutreachAt">
          Last sent: {{ startup.lastOutreachAt }}
        </p>
        <p v-if="startup?.lastOutreachError" class="text-red-400">
          Last error: {{ startup.lastOutreachError }}
        </p>
      </div>

      <p v-if="err" class="text-sm text-red-400">{{ err }}</p>
      <div class="flex flex-wrap gap-2">
        <button
          type="submit"
          :disabled="saving || isComingSoon"
          class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ isComingSoon ? 'Coming soon' : saving ? 'Saving…' : 'Save' }}
        </button>
        <button
          type="button"
          class="rounded-lg border border-sky-700 bg-sky-950/50 px-4 py-2 text-sm text-sky-200 hover:bg-sky-950/80 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="sending || isComingSoon"
          @click="sendMail"
        >
          {{ isComingSoon ? 'Coming soon' : sending ? 'Sending…' : 'Send outreach email' }}
        </button>
        <button
          type="button"
          class="rounded-lg border border-red-900/80 bg-red-950/40 px-4 py-2 text-sm text-red-200 hover:bg-red-950/70 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="deleting || isComingSoon"
          @click="del"
        >
          {{ isComingSoon ? 'Coming soon' : deleting ? 'Deleting…' : 'Delete' }}
        </button>
        <NuxtLink to="/startups" class="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">
          Cancel
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
