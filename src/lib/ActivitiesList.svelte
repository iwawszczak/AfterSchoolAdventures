<script lang="ts">
  import type { Activity } from './types.js';
  import { ACTIVITY_TYPES } from './types.js';

  let { activities = [], selectedActivity = null, onActivitySelect = () => {} }: {
    activities?: Activity[];
    selectedActivity?: Activity | null;
    onActivitySelect?: (activity: Activity) => void;
  } = $props();

  function getActivityTypeInfo(activity: Activity) {
    return ACTIVITY_TYPES.find(type => type.key === activity.typ);
  }

  function formatAgeRange(ages: number[]): string {
    if (ages.length === 0) return '';
    if (ages.length === 1) return `${ages[0]} lat`;
    
    const min = Math.min(...ages);
    const max = Math.max(...ages);
    
    if (min === max) return `${min} lat`;
    return `${min}-${max} lat`;
  }
</script>

<div class="bg-white rounded-lg shadow-md">
  <div class="p-4 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-800">
      Lista zajęć ({activities.length})
    </h2>
  </div>
  
  <div class="max-h-96 overflow-y-auto">
    {#if activities.length === 0}
      <div class="p-4 text-center text-gray-500">
        Brak zajęć spełniających kryteria wyszukiwania
      </div>
    {:else}
      {#each activities as activity (activity.id)}
        {@const typeInfo = getActivityTypeInfo(activity)}
        <div
          class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors
                 {selectedActivity?.id === activity.id ? 'bg-blue-50 border-blue-200' : ''}"
          on:click={() => onActivitySelect(activity)}
          on:keydown={(e) => e.key === 'Enter' && onActivitySelect(activity)}
          role="button"
          tabindex="0"
        >
          <div class="flex items-start space-x-3">
            <!-- Color indicator -->
            <div
              class="w-4 h-4 rounded-full mt-1 flex-shrink-0"
              style="background-color: {typeInfo?.color || '#3b82f6'}"
            ></div>
            
            <!-- Activity info -->
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-gray-900 truncate">
                {activity.nazwa}
              </h3>
              
              <div class="mt-1 space-y-1">
                <p class="text-sm text-gray-600">
                  <span class="font-medium">Typ:</span> {typeInfo?.label || activity.typ}
                </p>
                
                <p class="text-sm text-gray-600">
                  <span class="font-medium">Wiek:</span> {formatAgeRange(activity.wiek)}
                </p>
                
                <p class="text-sm text-gray-500 truncate">
                  <span class="font-medium">Adres:</span> {activity.lokalizacja.adres}
                </p>
              </div>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
