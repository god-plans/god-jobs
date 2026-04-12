<script setup lang="ts">
import { isComingSoon } from '~~/shared/comingSoon'

useSiteSeo({
  title: 'New startup',
  description: 'Add a startup to your private outreach list.',
  path: '/startups/new',
  indexable: false,
})

const { create } = useStartups()
const saving = ref(false)
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

async function submit() {
  if (isComingSoon)
    return
  err.value = ''
  if (!form.name.trim()) {
    err.value = 'Name is required.'
    return
  }
  saving.value = true
  try {
    const body = {
      ...form,
      priorityRank: form.priorityRank,
    }
    const row = await create(body as Record<string, unknown>)
    await navigateTo(`/startups/${row.id}`)
  }
  catch (e: unknown) {
    err.value = e instanceof Error ? e.message : 'Failed to save'
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <div>
      <NuxtLink to="/startups" class="text-sm text-emerald-400 hover:text-emerald-300">← Back to list</NuxtLink>
      <h1 class="mt-2 text-2xl font-semibold text-white">New startup</h1>
    </div>

    <form class="space-y-4" @submit.prevent="submit">
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
          <input v-model="form.emailSubject" class="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" placeholder="Uses OUTREACH_SUBJECT env if empty">
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

      <p v-if="err" class="text-sm text-red-400">{{ err }}</p>
      <div class="flex gap-2">
        <button
          type="submit"
          :disabled="saving || isComingSoon"
          class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ isComingSoon ? 'Coming soon' : saving ? 'Saving…' : 'Create' }}
        </button>
        <NuxtLink to="/startups" class="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">
          Cancel
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
