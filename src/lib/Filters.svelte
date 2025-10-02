<script lang="ts">
  import { ACTIVITY_TYPES, AGE_GROUPS } from './types.js';

  let { selectedTypes = [], selectedAgeGroups = [], onTypeChange = () => {}, onAgeGroupChange = () => {} }: {
    selectedTypes?: string[];
    selectedAgeGroups?: string[];
    onTypeChange?: (types: string[]) => void;
    onAgeGroupChange?: (ageGroups: string[]) => void;
  } = $props();

  function toggleType(type: string) {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    onTypeChange(newTypes);
  }

  function toggleAgeGroup(ageGroup: string) {
    const newAgeGroups = selectedAgeGroups.includes(ageGroup)
      ? selectedAgeGroups.filter(ag => ag !== ageGroup)
      : [...selectedAgeGroups, ageGroup];
    onAgeGroupChange(newAgeGroups);
  }

  function clearAllFilters() {
    onTypeChange([]);
    onAgeGroupChange([]);
  }
</script>

<div class="bg-white p-4 rounded-lg shadow-md">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-lg font-semibold text-gray-800">Filtry</h2>
    <button
      on:click={clearAllFilters}
      class="text-sm text-blue-600 hover:text-blue-800 underline"
    >
      Wyczyść wszystkie
    </button>
  </div>

  <!-- Activity Types Filter -->
  <div class="mb-6">
    <h3 class="text-md font-medium text-gray-700 mb-3">Typ aktywności</h3>
    <div class="space-y-2">
      {#each ACTIVITY_TYPES as type}
        <label class="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedTypes.includes(type.key)}
            on:change={() => toggleType(type.key)}
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div class="flex items-center space-x-2">
            <div
              class="w-3 h-3 rounded-full"
              style="background-color: {type.color}"
            ></div>
            <span class="text-sm text-gray-700">{type.label}</span>
          </div>
        </label>
      {/each}
    </div>
  </div>

  <!-- Age Groups Filter -->
  <div>
    <h3 class="text-md font-medium text-gray-700 mb-3">Grupa wiekowa</h3>
    <div class="space-y-2">
      {#each AGE_GROUPS as ageGroup}
        <label class="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedAgeGroups.includes(ageGroup.label)}
            on:change={() => toggleAgeGroup(ageGroup.label)}
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="text-sm text-gray-700">{ageGroup.label}</span>
        </label>
      {/each}
    </div>
  </div>
</div>
