<script lang="ts">
  import { onMount } from 'svelte';
  import Map from '$lib/Map.svelte';
  import Filters from '$lib/Filters.svelte';
  import ActivitiesList from '$lib/ActivitiesList.svelte';
  import AddPlaceForm from '$lib/AddPlaceForm.svelte';
  import type { PlaceObject } from '$lib/types.js';
  import { ACTIVITY_TYPES, AGE_GROUPS } from '$lib/types.js';

  let places = $state<PlaceObject[]>([]);
  let filteredPlaces = $state<PlaceObject[]>([]);
  let selectedPlace = $state<PlaceObject | null>(null);
  let selectedTypes = $state<string[]>([]);
  let selectedAgeGroups = $state<string[]>([]);
  let loading = $state(true);
  let activeTab = $state<'cards' | 'add'>('cards');

  onMount(async () => {
    try {
      const response = await fetch('/data.json');
      places = await response.json();
      filteredPlaces = places;
      loading = false;
    } catch (error) {
      console.error('Error loading places:', error);
      loading = false;
    }
  });

  function filterPlaces() {
    filteredPlaces = places.filter(place => {
      // Check if any activity in this place matches filters
      return place.zajecia.some(zajecie => {
        // Filter by type
        if (selectedTypes.length > 0 && !selectedTypes.includes(zajecie.typ)) {
          return false;
        }

        // Filter by age group
        if (selectedAgeGroups.length > 0) {
          const activityFitsAgeGroup = selectedAgeGroups.some(ageGroupLabel => {
            const ageGroup = AGE_GROUPS.find(ag => ag.label === ageGroupLabel);
            if (!ageGroup) return false;
            
            return zajecie.wiek.some(age => age >= ageGroup.min && age <= ageGroup.max);
          });
          
          if (!activityFitsAgeGroup) {
            return false;
          }
        }

        return true;
      });
    });
  }

  function handleTypeChange(types: string[]) {
    selectedTypes = types;
    filterPlaces();
  }

  function handleAgeGroupChange(ageGroups: string[]) {
    selectedAgeGroups = ageGroups;
    filterPlaces();
  }

  function handlePlaceSelect(place: PlaceObject) {
    selectedPlace = place;
  }

  function handleAddPlace(newPlace: PlaceObject) {
    // Generate new ID
    const newId = Math.max(...places.map(p => p.id)) + 1;
    const placeWithId = { ...newPlace, id: newId };
    
    // Add to places array
    places = [...places, placeWithId];
    
    // Switch back to cards tab
    activeTab = 'cards';
    selectedPlace = placeWithId;
    
    console.log('New place added:', placeWithId);
  }

  // React to filter changes
  $effect(() => {
    if (places.length > 0) {
      filterPlaces();
    }
  });
</script>

<svelte:head>
  <title>Zajęcia dodatkowe dla dzieci - Mapa</title>
  <meta name="description" content="Przeglądaj zajęcia dodatkowe dla dzieci na interaktywnej mapie" />
</svelte:head>

<div class="min-h-screen bg-gray-100">
  <!-- Header -->
  <header class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <h1 class="text-2xl font-bold text-gray-900">
        Zajęcia dodatkowe dla dzieci
      </h1>
      <p class="text-gray-600 mt-1">
        Odkryj zajęcia dodatkowe w Twojej okolicy
      </p>
      
      <!-- Tab Navigation -->
      <nav class="mt-6">
        <div class="border-b border-gray-200">
          <div class="flex space-x-8">
            <button
              class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
              class:border-blue-500={activeTab === 'cards'}
              class:text-blue-600={activeTab === 'cards'}
              class:border-transparent={activeTab !== 'cards'}
              class:text-gray-500={activeTab !== 'cards'}
              onclick={() => activeTab = 'cards'}
            >
              Karty zajęć
            </button>
            <button
              class="py-2 px-1 border-b-2 font-medium text-sm transition-colors"
              class:border-blue-500={activeTab === 'add'}
              class:text-blue-600={activeTab === 'add'}
              class:border-transparent={activeTab !== 'add'}
              class:text-gray-500={activeTab !== 'add'}
              onclick={() => activeTab = 'add'}
            >
              Dodaj nowe miejsce
            </button>
          </div>
        </div>
      </nav>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    {#if loading}
      <div class="flex items-center justify-center h-64">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Ładowanie danych...</p>
        </div>
      </div>
    {:else}
      {#if activeTab === 'cards'}
        <!-- Cards Tab -->
        <!-- Desktop Layout -->
        <div class="hidden lg:grid lg:grid-cols-12 lg:gap-6 h-[calc(100vh-300px)]">
          <!-- Filters Sidebar -->
          <div class="lg:col-span-3">
            <div class="sticky top-6">
              <Filters
                {selectedTypes}
                {selectedAgeGroups}
                onTypeChange={handleTypeChange}
                onAgeGroupChange={handleAgeGroupChange}
              />
            </div>
          </div>

          <!-- Map -->
          <div class="lg:col-span-6">
            <div class="h-full rounded-lg overflow-hidden shadow-lg">
              <Map
                places={filteredPlaces}
                {selectedPlace}
                onPlaceSelect={handlePlaceSelect}
              />
            </div>
          </div>

          <!-- Activities List -->
          <div class="lg:col-span-3">
            <div class="h-full">
              <ActivitiesList
                places={filteredPlaces}
                {selectedPlace}
                onPlaceSelect={handlePlaceSelect}
              />
            </div>
          </div>
        </div>

        <!-- Mobile Layout -->
        <div class="lg:hidden space-y-6">
          <!-- Filters -->
          <div>
            <Filters
              {selectedTypes}
              {selectedAgeGroups}
              onTypeChange={handleTypeChange}
              onAgeGroupChange={handleAgeGroupChange}
            />
          </div>

          <!-- Map -->
          <div class="h-96 rounded-lg overflow-hidden shadow-lg">
            <Map
              places={filteredPlaces}
              {selectedPlace}
              onPlaceSelect={handlePlaceSelect}
            />
          </div>

          <!-- Activities List -->
          <div>
            <ActivitiesList
              places={filteredPlaces}
              {selectedPlace}
              onPlaceSelect={handlePlaceSelect}
            />
          </div>
        </div>
      {:else}
        <!-- Add Place Tab -->
        <AddPlaceForm onAddPlace={handleAddPlace} />
      {/if}
    {/if}
  </main>

  <!-- Footer -->
  <footer class="bg-white border-t mt-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="text-center text-gray-600">
        <p>&copy; 2024 Zajęcia dodatkowe dla dzieci. Proof of Concept aplikacji.</p>
      </div>
    </div>
  </footer>
</div>
