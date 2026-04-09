<script setup lang="ts">
const { importCsv, fetchDiscovery } = useStartups()

const file = ref<File | null>(null)
const importing = ref(false)
const importResult = ref<string>('')

const ghQ = ref('typescript')
const ghLimit = ref(15)
const hnQ = ref('startup saas')
const hnLimit = ref(15)
const fetching = ref(false)
const fetchMsg = ref('')

async function doImport() {
  importResult.value = ''
  if (!file.value) {
    importResult.value = 'Choose a CSV file first.'
    return
  }
  importing.value = true
  try {
    const res = await importCsv(file.value)
    importResult.value = `Imported ${res.imported} row(s). Errors: ${res.errors.length}`
    if (res.errors.length) console.warn(res.errors)
  }
  catch (e: unknown) {
    importResult.value = e instanceof Error ? e.message : 'Import failed'
  }
  finally {
    importing.value = false
  }
}

async function fetchGh() {
  fetchMsg.value = ''
  fetching.value = true
  try {
    const res = await fetchDiscovery({ type: 'github', q: ghQ.value, limit: ghLimit.value })
    fetchMsg.value = `GitHub: created ${res.count} startup(s).`
  }
  catch (e: unknown) {
    fetchMsg.value = e instanceof Error ? e.message : 'Fetch failed'
  }
  finally {
    fetching.value = false
  }
}

async function fetchHn() {
  fetchMsg.value = ''
  fetching.value = true
  try {
    const res = await fetchDiscovery({ type: 'hn', q: hnQ.value, limit: hnLimit.value })
    fetchMsg.value = `HN: created ${res.count} startup(s).`
  }
  catch (e: unknown) {
    fetchMsg.value = e instanceof Error ? e.message : 'Fetch failed'
  }
  finally {
    fetching.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-10">
    <div>
      <NuxtLink to="/startups" class="text-sm text-emerald-400 hover:text-emerald-300">← Back to list</NuxtLink>
      <h1 class="mt-2 text-2xl font-semibold text-white">Import &amp; discovery</h1>
      <p class="mt-1 text-sm text-slate-400">
        CSV columns use the same names as export (snake_case). For outreach you still need verified <code class="text-slate-300">contact_email</code> on each row.
      </p>
    </div>

    <section class="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <h2 class="text-sm font-medium text-slate-200">Import CSV</h2>
      <input
        type="file"
        accept=".csv,text/csv"
        class="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-700 file:px-3 file:py-2 file:text-white"
        @change="file = ($event.target as HTMLInputElement).files?.[0] ?? null"
      >
      <button
        type="button"
        class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        :disabled="importing"
        @click="doImport"
      >
        {{ importing ? 'Importing…' : 'Upload & import' }}
      </button>
      <p v-if="importResult" class="text-sm text-slate-300">{{ importResult }}</p>
    </section>

    <section class="space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <h2 class="text-sm font-medium text-slate-200">Fetch draft startups (free APIs)</h2>
      <p class="text-xs text-slate-500">
        These create <strong class="text-slate-400">researched</strong> rows without email. Add contact details before sending mail.
      </p>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2 rounded-lg border border-slate-800 p-3">
          <h3 class="text-xs font-medium text-slate-400">GitHub org search</h3>
          <input v-model="ghQ" class="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-white">
          <label class="flex items-center gap-2 text-xs text-slate-500">
            Limit
            <input v-model.number="ghLimit" type="number" min="1" max="50" class="w-20 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-white">
          </label>
          <button
            type="button"
            class="rounded bg-slate-700 px-3 py-1.5 text-sm text-white hover:bg-slate-600 disabled:opacity-50"
            :disabled="fetching"
            @click="fetchGh"
          >
            Fetch orgs
          </button>
        </div>
        <div class="space-y-2 rounded-lg border border-slate-800 p-3">
          <h3 class="text-xs font-medium text-slate-400">HN Algolia (stories)</h3>
          <input v-model="hnQ" class="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-white">
          <label class="flex items-center gap-2 text-xs text-slate-500">
            Limit
            <input v-model.number="hnLimit" type="number" min="1" max="50" class="w-20 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-white">
          </label>
          <button
            type="button"
            class="rounded bg-slate-700 px-3 py-1.5 text-sm text-white hover:bg-slate-600 disabled:opacity-50"
            :disabled="fetching"
            @click="fetchHn"
          >
            Fetch stories
          </button>
        </div>
      </div>
      <p v-if="fetchMsg" class="text-sm text-emerald-300/90">{{ fetchMsg }}</p>
    </section>
  </div>
</template>
