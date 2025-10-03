<script lang="ts">
  import type { PlaceObject, Activity } from './types.js';
  import { ACTIVITY_TYPES } from './types.js';

  let { places = [], selectedPlace = null, onPlaceSelect = () => {} }: {
    places?: PlaceObject[];
    selectedPlace?: PlaceObject | null;
    onPlaceSelect?: (place: PlaceObject) => void;
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

  function getUniqueActivityTypes(place: PlaceObject) {
    const uniqueTypes = [...new Set(place.zajecia.map(zajecie => zajecie.typ))];
    return uniqueTypes.map(type => ACTIVITY_TYPES.find(t => t.key === type));
  }
</script>

<div class="bg-white rounded-lg shadow-md">
  <div class="p-4 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-800">
      Lista obiektów ({places.length})
    </h2>
  </div>
  
  <div class="max-h-96 overflow-y-auto">
    {#if places.length === 0}
      <div class="p-4 text-center text-gray-500">
        Brak obiektów spełniających kryteria wyszukiwania
      </div>
    {:else}
      {#each places as place (place.id)}
        {@const typeInfos = getUniqueActivityTypes(place)}
        <div
          class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors
                 {selectedPlace?.id === place.id ? 'bg-blue-50 border-blue-200' : ''}"
          onclick={() => onPlaceSelect(place)}
          onkeydown={(e) => e.key === 'Enter' && onPlaceSelect(place)}
          role="button"
          tabindex="0"
        >
          <div class="flex items-start space-x-3">
            <!-- Multi-color indicator -->
            <div class="w-4 h-4 rounded-full mt-1 flex-shrink-0 flex items-center justify-center">
              {#if typeInfos.length === 1}
                <div
                  class="w-4 h-4 rounded-full"
                  style="background-color: {typeInfos[0]?.color || '#3b82f6'}"
                ></div>
              {:else}
                <div
                  class="w-4 h-4 rounded-full"
                  style="background: conic-gradient(from 0deg, {typeInfos.slice(0, 3).map(t => t?.color || '#3b82f6').join(', ')})"
                ></div>
              {/if}
            </div>
            
            <!-- Place info -->
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-gray-900 truncate">
                {place.nazwa}
              </h3>
              
              <div class="mt-1 space-y-1">
                <p class="text-sm text-gray-600">
                  <span class="font-medium">Zajęcia:</span> {typeInfos.map(t => t?.label).join(', ')}
                </p>
                
                <p class="text-sm text-gray-500 truncate">
                  <span class="font-medium">Adres:</span> {place.lokalizacja.adres}
                </p>
                
                <div class="mt-1">
                  <p class="text-sm text-gray-600">
                    <span class="font-medium">Dostępne zajęcia ({place.zajecia.length}):</span>
                  </p>
                  <div class="ml-0 mt-1">
                    {#each place.zajecia.slice(0, 3) as zajecie}
                      {@const typeInfo = getActivityTypeInfo(zajecie)}
                      <div class="text-xs text-gray-500 mb-1 truncate">
                        • {zajecie.nazwa} ({formatAgeRange(zajecie.wiek)})
                      </div>
                    {/each}
                    {#if place.zajecia.length > 3}
                      <div class="text-xs text-gray-400">
                        ... i {place.zajecia.length - 3} więcej
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
