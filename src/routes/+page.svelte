<script lang="ts">
  import { onMount } from 'svelte';
  import Map from '$lib/Map.svelte';
  import Filters from '$lib/Filters.svelte';
  import ActivitiesList from '$lib/ActivitiesList.svelte';
  import type { Activity } from '$lib/types.js';
  import { ACTIVITY_TYPES, AGE_GROUPS } from '$lib/types.js';

  let activities = $state<Activity[]>([]);
  let filteredActivities = $state<Activity[]>([]);
  let selectedActivity = $state<Activity | null>(null);
  let selectedTypes = $state<string[]>([]);
  let selectedAgeGroups = $state<string[]>([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      const response = await fetch('/data.json');
      activities = await response.json();
      filteredActivities = activities;
      loading = false;
    } catch (error) {
      console.error('Error loading activities:', error);
      loading = false;
    }
  });

  function filterActivities() {
    filteredActivities = activities.filter(activity => {
      // Filter by type
      if (selectedTypes.length > 0 && !selectedTypes.includes(activity.typ)) {
        return false;
      }

      // Filter by age group
      if (selectedAgeGroups.length > 0) {
        const activityFitsAgeGroup = selectedAgeGroups.some(ageGroupLabel => {
          const ageGroup = AGE_GROUPS.find(ag => ag.label === ageGroupLabel);
          if (!ageGroup) return false;
          
          return activity.wiek.some(age => age >= ageGroup.min && age <= ageGroup.max);
        });
        
        if (!activityFitsAgeGroup) {
          return false;
        }
      }

      return true;
    });
  }

  function handleTypeChange(types: string[]) {
    selectedTypes = types;
    filterActivities();
  }

  function handleAgeGroupChange(ageGroups: string[]) {
    selectedAgeGroups = ageGroups;
    filterActivities();
  }

  function handleActivitySelect(activity: Activity) {
    selectedActivity = activity;
  }

  // React to filter changes
  $effect(() => {
    if (activities.length > 0) {
      filterActivities();
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
      <!-- Desktop Layout -->
      <div class="hidden lg:grid lg:grid-cols-12 lg:gap-6 h-[calc(100vh-200px)]">
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
              activities={filteredActivities}
              {selectedActivity}
              onActivitySelect={handleActivitySelect}
            />
          </div>
        </div>

        <!-- Activities List -->
        <div class="lg:col-span-3">
          <div class="h-full">
            <ActivitiesList
              activities={filteredActivities}
              {selectedActivity}
              onActivitySelect={handleActivitySelect}
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
            activities={filteredActivities}
            {selectedActivity}
            onActivitySelect={handleActivitySelect}
          />
        </div>

        <!-- Activities List -->
        <div>
          <ActivitiesList
            activities={filteredActivities}
            {selectedActivity}
            onActivitySelect={handleActivitySelect}
          />
        </div>
      </div>
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
