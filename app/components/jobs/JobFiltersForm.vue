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

const model = defineModel<JobFiltersModel>({ required: true })
/** GkExpansionPanels v-model: keys of open panels (e.g. `more` for the extra filter grid). */
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
  { value: 'updatedAt', label: 'Updated' },
  { value: 'postedAt', label: 'Posted' },
] as const

const sortOrderOptions = [
  { value: 'desc', label: 'Desc' },
  { value: 'asc', label: 'Asc' },
] as const

function workplaceModel(): string {
  return model.value.workplace
}
function setWorkplace(v: string | number | undefined) {
  if (v === 'any' || v === 'remote' || v === 'onsite')
    model.value.workplace = v
}

function sortFieldModel(): string {
  return model.value.sortField
}
function setSortField(v: string | number | undefined) {
  if (v === 'updatedAt' || v === 'postedAt')
    model.value.sortField = v
}

function sortOrderModel(): string {
  return model.value.sortOrder
}
function setSortOrder(v: string | number | undefined) {
  if (v === 'asc' || v === 'desc')
    model.value.sortOrder = v
}

function sourceModel(): string {
  return model.value.source
}
function setSource(v: string | number | undefined) {
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
  <div class="space-y-3">
    <div class="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
      <div class="min-w-0 w-full lg:flex-1">
        <GkField label="Search" >
          <GkInput
            id="jobs-search"
            v-model="model.q"
            type="search"
            enterkeyhint="search"
            placeholder="Search title, company, snippet…"
            autocomplete="off"
            
          />
        </GkField>
      </div>
      <div class="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3 lg:min-w-0 lg:flex-1 lg:justify-end">
        <div class="w-full min-w-0 sm:w-[calc(50%-0.375rem)] sm:max-w-[11rem] md:w-auto md:max-w-[11rem]">
          <GkField label="Source">
            <GkSelect
              :model-value="sourceModel()"
              :options="[...sourceOptions]"
              @update:model-value="setSource"
            />
          </GkField>
        </div>
        <div class="w-full min-w-0 sm:w-[calc(50%-0.375rem)] sm:max-w-[11rem] md:w-auto md:max-w-[11rem]">
          <GkField label="Workplace">
            <GkSelect
              :model-value="workplaceModel()"
              :options="[...workplaceOptions]"
              @update:model-value="setWorkplace"
            />
          </GkField>
        </div>
        <div class="w-full min-w-0 sm:w-full sm:max-w-none md:max-w-[14rem] lg:w-auto lg:min-w-[9rem]">
          <div class="flex w-full min-w-0 flex-col gap-1">
            <span class="text-xs font-medium uppercase tracking-wide" style="color: var(--gk-color-on-surface-variant)">Sort</span>
            <div class="flex w-full gap-2">
              <GkSelect
                class="min-w-0 flex-1"
                :model-value="sortFieldModel()"
                :options="[...sortFieldOptions]"
                @update:model-value="setSortField"
              />
              <GkSelect
              class="min-w-0 flex-1"
           
                :model-value="sortOrderModel()"
                :options="[...sortOrderOptions]"
                @update:model-value="setSortOrder"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full min-w-0 shrink-0">
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
        Category filter uses keyword matching on title, company, and snippet. Clear the chip or type a new search to switch.
      </p>
    </div>

    <GkExpansionPanels v-model="moreExpanded" multiple>
      <GkExpansionPanel value="more">
        <GkExpansionPanelTitle>
          More filters (company, location, posted dates)
        </GkExpansionPanelTitle>
        <GkExpansionPanelText>
          <GkGrid :columns="2" :columns-mobile="1" :gap="3">
            <div class="min-w-0">
              <GkField label="Company contains">
                <GkInput
                  v-model="model.company"
                  type="text"
                  autocomplete="organization"
                  placeholder="e.g. godplans"
                />
              </GkField>
            </div>
            <div>
              <GkField label="Location contains">
                <GkInput
                  v-model="model.location"
                  type="text"
                  placeholder="e.g. Germany"
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
