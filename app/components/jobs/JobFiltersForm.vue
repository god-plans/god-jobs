<script setup lang="ts">
import {
  GkButton,
  GkExpansionPanel,
  GkExpansionPanels,
  GkExpansionPanelText,
  GkExpansionPanelTitle,
  GkField,
  GkGrid,
  GkInput,
  GkSelect,
} from 'god-kit/vue'
import type { JobFiltersModel } from '~~/shared/jobFilters'
import { JOB_CATEGORY_PRESETS } from '~~/shared/jobCategoryPresets'

withDefaults(
  defineProps<{
    /** Search input id (for focus / labels). */
    searchId?: string
    /** Category chips: mobile sheet always; tablet when sidebar hidden. */
    showCategoryChips?: boolean
  }>(),
  {
    searchId: 'jobs-search',
    showCategoryChips: false,
  },
)

const model = defineModel<JobFiltersModel>({ required: true })
const moreExpanded = ref<string[]>([])

const sourceOptions = [
  { value: '', label: 'All sources' },
  { value: 'remotive', label: 'Remotive' },
  { value: 'arbeitnow', label: 'Arbeitnow' },
  { value: 'hn', label: 'Hacker News' },
  { value: 'remoteok', label: 'Remote OK' },
  { value: 'rss', label: 'RSS' },
  { value: 'jobicy', label: 'Jobicy' },
  { value: 'greenhouse', label: 'Greenhouse' },
] as const

const workplaceOptions = [
  { value: 'any', label: 'Any' },
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
] as const

const sortFieldOptions = [
  { value: 'updatedAt', label: 'Sort: Updated' },
  { value: 'postedAt', label: 'Sort: Posted' },
] as const

const sortOrderOptions = [
  { value: 'desc', label: 'Desc' },
  { value: 'asc', label: 'Asc' },
] as const

function workplaceModel(): string {
  return model.value.workplace
}
function setWorkplace(v: string | number | (string | number)[] | undefined) {
  if (Array.isArray(v)) return
  if (v === 'any' || v === 'remote' || v === 'onsite')
    model.value.workplace = v
}

function sortFieldModel(): string {
  return model.value.sortField
}
function setSortField(v: string | number | (string | number)[] | undefined) {
  if (Array.isArray(v)) return
  if (v === 'updatedAt' || v === 'postedAt')
    model.value.sortField = v
}

function sortOrderModel(): string {
  return model.value.sortOrder
}
function setSortOrder(v: string | number | (string | number)[] | undefined) {
  if (Array.isArray(v)) return
  if (v === 'asc' || v === 'desc')
    model.value.sortOrder = v
}

function sourceModel(): string {
  return model.value.source
}
function setSource(v: string | number | (string | number)[] | undefined) {
  if (Array.isArray(v)) return
  model.value.source = typeof v === 'string' ? v : String(v ?? '')
}

function toggleCategory(id: string) {
  if (model.value.category === id) {
    model.value.category = ''
  }
  else {
    model.value.category = id
    model.value.q = ''
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="relative">
      <GkField label="Search" class="gj-jobs-search-field">
        <div class="relative">

          <GkInput
            :id="searchId"
            v-model="model.q"
            class="gj-jobs-search-input"
            type="search"
            enterkeyhint="search"
            placeholder="Search title, company, snippet…"
            autocomplete="off"
          />
        </div>
      </GkField>
    </div>

    <div
      v-if="showCategoryChips"
      class="w-full min-w-0"
    >
      <p class="mb-2 text-xs font-medium uppercase tracking-wide" style="color: var(--gk-color-on-surface-variant)">
        Category
      </p>
      <div class="flex flex-wrap gap-2" role="group" aria-label="Job category filters">
        <GkButton
          v-for="preset in JOB_CATEGORY_PRESETS"
          :key="preset.id"
          type="button"
          size="sm"
          :variant="model.category === preset.id ? 'primary' : 'secondary'"
          @click="toggleCategory(preset.id)"
        >
          {{ preset.label }}
        </GkButton>
      </div>
      <p v-if="model.category" class="mt-2 text-xs" style="color: var(--gk-color-on-surface-variant)">
        Category uses keyword matching on title, company, and snippet. Clear the chip or type a new search to switch.
      </p>
    </div>

    <div class="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-end">
      <div class="min-w-0 w-full flex-1 xl:max-w-[11rem]">
        <GkField label="Source">
          <GkSelect
            :model-value="sourceModel()"
            :options="[...sourceOptions]"
            @update:model-value="setSource"
          />
        </GkField>
      </div>
      <div class="min-w-0 w-full flex-1 xl:max-w-[11rem]">
        <GkField label="Workplace">
          <GkSelect
            :model-value="workplaceModel()"
            :options="[...workplaceOptions]"
            @update:model-value="setWorkplace"
          />
        </GkField>
      </div>
      <div class="min-w-0 w-full flex-1 xl:min-w-[12rem] xl:max-w-[16rem]">
        <GkField label="Location">
          <GkInput
            v-model="model.location"
            type="text"
            placeholder="e.g. Germany, USA"
            autocomplete="off"
          />
        </GkField>
      </div>
      <div class="flex min-w-0 w-full flex-1 gap-2 xl:max-w-[20rem]">
        <GkField label="Sort by" label-sr-only class="min-w-0 flex-1 !mb-0">
          <GkSelect
            :model-value="sortFieldModel()"
            :options="[...sortFieldOptions]"
            @update:model-value="setSortField"
          />
        </GkField>
        <GkField label="Order" label-sr-only class="min-w-0 flex-1 !mb-0">
          <GkSelect
            :model-value="sortOrderModel()"
            :options="[...sortOrderOptions]"
            @update:model-value="setSortOrder"
          />
        </GkField>
      </div>
    </div>

    <GkExpansionPanels v-model="moreExpanded" multiple>
      <GkExpansionPanel value="more">
        <GkExpansionPanelTitle>
          Advanced (company, posted dates)
        </GkExpansionPanelTitle>
        <GkExpansionPanelText>
          <GkGrid :columns="2" :columns-mobile="1" :gap="3">
            <div class="min-w-0">
              <GkField label="Company contains">
                <GkInput
                  v-model="model.company"
                  type="text"
                  autocomplete="organization"
                  placeholder="e.g. acme"
                />
              </GkField>
            </div>
            <div>
              <GkField label="Posted on or after">
                <GkInput
                  v-model="model.postedAfter"
                  type="date"
                />
              </GkField>
            </div>
            <div>
              <GkField label="Posted on or before">
                <GkInput
                  v-model="model.postedBefore"
                  type="date"
                />
              </GkField>
            </div>
          </GkGrid>
        </GkExpansionPanelText>
      </GkExpansionPanel>
    </GkExpansionPanels>
  </div>
</template>
