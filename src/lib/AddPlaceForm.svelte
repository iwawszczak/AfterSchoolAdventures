<script lang="ts">
  import { onMount } from 'svelte';
import type { PlaceObject, Activity } from './types.js';
import { ACTIVITY_TYPES } from './types.js';
import SendEmailForm from './SendEmailForm.svelte';
import SimpleEmailForm from './SimpleEmailForm.svelte';

  let { onAddPlace }: { onAddPlace: (place: PlaceObject) => void } = $props();

  let formData = $state({
    nazwa: '',
    lokalizacja: {
      lat: 52.2297,
      lng: 21.0122,
      adres: ''
    },
    zajecia: [] as Activity[]
  });

  let newSchoolData = $state({
    nazwa: '',
    typ: '',
    wiek: [] as number[],
    strona_internetowa: ''
  });

  let mapContainer: HTMLDivElement;
  let map: any;
  let marker: any;
  let L: any;
  let suggestions = $state<string[]>([]);
  let locationInput = $state('');
  let showSuggestions = $state(false);
  let isSubmitting = $state(false);

  onMount(async () => {
    // Dynamic import of Leaflet to avoid SSR issues
    L = await import('leaflet');
    
    // Import Leaflet CSS
    await import('leaflet/dist/leaflet.css');

    // Fix for default markers in Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    // Initialize map centered on Warsaw
    map = L.map(mapContainer).setView([52.2297, 21.0122], 11);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    });

    // Add initial marker
    marker = L.marker([52.2297, 21.0122], { 
      draggable: true 
    }).addTo(map);

    // Handle marker drag to update location
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      formData.lokalizacja = {
        lat: position.lat,
        lng: position.lng,
        adres: formData.lokalizacja.adres
      };
      locationInput = formData.lokalizacja.adres;
    });

    // Handle map click to update location
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      formData.lokalizacja = {
        lat: lat,
        lng: lng,
        adres: formData.lokalizacja.adres
      };
    });
  });

  async function handleLocationInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const query = target.value;
    locationInput = query;
    
    if (query.length < 3) {
      showSuggestions = false;
      suggestions = [];
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=pl&addressdetails=1`
      );
      const data = await response.json();
      
      suggestions = data.map((result: any) => result.display_name);
      showSuggestions = suggestions.length > 0;
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      showSuggestions = false;
    }
  }

  function selectSuggestion(suggestion: string) {
    locationInput = suggestion;
    formData.lokalizacja.adres = suggestion;
    showSuggestions = false;
    suggestions = [];

    // Try to get coordinates for the selected address
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(suggestion)}&limit=1&addressdetails=1`
    )
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          const { lat, lon } = data[0];
          const position = [parseFloat(lat), parseFloat(lon)];
          marker.setLatLng(position);
          map.setView(position, 15);
          formData.lokalizacja = {
            lat: position[0],
            lng: position[1],
            adres: suggestion
          };
        }
      })
      .catch(error => console.error('Error fetching coordinates:', error));
  }

  function toggleNewActivityAge(age: number) {
    if (newSchoolData.wiek.includes(age)) {
      newSchoolData.wiek = newSchoolData.wiek.filter(a => a !== age).sort((a, b) => a - b);
    } else {
      newSchoolData.wiek = [...newSchoolData.wiek, age].sort((a, b) => a - b);
    }
  }

  function addActivity() {
    if (!newSchoolData.nazwa || !newSchoolData.typ || newSchoolData.wiek.length === 0) {
      alert('Proszę wypełnić wszystkie wymagane pola zajęcia');
      return;
    }

    const newActivity: Activity = {
      id: Date.now(), // Generate unique ID
      nazwa: newSchoolData.nazwa,
      typ: newSchoolData.typ,
      wiek: newSchoolData.wiek,
      strona_internetowa: newSchoolData.strona_internetowa || undefined
    };

    formData.zajecia = [...formData.zajecia, newActivity];
    
    // Reset activity form
    newSchoolData = {
      nazwa: '',
      typ: '',
      wiek: [],
      strona_internetowa: ''
    };
  }

  function removeActivity(index: number) {
    formData.zajecia = formData.zajecia.filter((_, i) => i !== index);
  }

  function submitForm() {
    if (!formData.nazwa || formData.zajecia.length === 0) {
      alert('Proszę wypełnić nazwę obiektu i dodać przynajmniej jedno zajęcie');
      return;
    }

    isSubmitting = true;
    
    const newPlace: PlaceObject = {
      id: 0, // Will be set by parent component
      nazwa: formData.nazwa,
      lokalizacja: formData.lokalizacja,
      zajecia: formData.zajecia
    };

    onAddPlace(newPlace);
    
    // Reset form
    setTimeout(() => {
      formData = {
        nazwa: '',
        lokalizacja: {
          lat: 52.2297,
          lng: 21.0122,
          adres: ''
        },
        zajecia: []
      };
      locationInput = '';
      
      // Reset map
      marker.setLatLng([52.2297, 21.0122]);
      map.setView([52.2297, 21.0122], 11);
      
      isSubmitting = false;
      console.log('Form reset');
    }, 1000);
  }

  // Auto-populate location input when address is set
  $effect(() => {
    locationInput = formData.lokalizacja.adres;
  });

  // Reactive JSON formatting
  let formattedJson = $state('');
  
  $effect(() => {
    const placeToSend = {
      nazwa: formData.nazwa,
      lokalizacja: {
        lat: formData.lokalizacja.lat,
        lng: formData.lokalizacja.lng,
        adres: formData.lokalizacja.adres
      },
      zajecia: formData.zajecia.map(zajecie => ({
        nazwa: zajecie.nazwa,
        typ: zajecie.typ,
        wiek: zajecie.wiek,
        strona_internetowa: zajecie.strona_internetowa || undefined
      }))
    };
    
    const jsonString = JSON.stringify(placeToSend, null, 2);
    // Syntax highlighting for better readability
    formattedJson = jsonString
      .replace(/"([^"]+)":/g, '<span class="text-blue-600 font-semibold">"$1":</span>')
      .replace(/: ("[^"]*")/g, ': <span class="text-green-600">$1</span>')
      .replace(/: (\[[^\]]*\])/g, ': <span class="text-purple-600">$1</span>')
      .replace(/: (\d+(?:\.\d+)?)/g, ': <span class="text-orange-600">($1)</span>')
      .replace(/: (null|undefined)/g, ': <span class="text-gray-500">$1</span>');
  });

  function copyToClipboard() {
    const jsonElement = document.getElementById('json-preview');
    if (!jsonElement) return;
    
    // Get plain text content without HTML formatting
    const plainText = jsonElement.textContent || jsonElement.innerText || '';
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(plainText).then(() => {
        // Visual feedback
        const button = event?.target as HTMLButtonElement;
        if (button) {
          const originalText = button.textContent;
          button.textContent = '✓ Skopiowano!';
          button.classList.add('bg-green-600');
          button.classList.remove('bg-blue-600');
          setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('bg-green-600');
            button.classList.add('bg-blue-600');
          }, 2000);
        }
      }).catch(err => {
        console.error('Błąd kopiowania: ', err);
        fallbackCopyToClipboard(plainText);
      });
    } else {
      fallbackCopyToClipboard(plainText);
    }
  }

  function fallbackCopyToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback: Błąd kopiowania', err);
    }
    
    document.body.removeChild(textArea);
  }
</script>

<div class="max-w-4xl mx-auto">
  <div class="bg-white rounded-lg shadow-lg">
    <div class="p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Dodaj nowy obiekt</h2>
      
      <form onsubmit={(e) => { e.preventDefault(); submitForm(); }} class="space-y-6">
        <!-- Place Information -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Informacje o obiekcie</h3>
          
          <div class="grid grid-cols-1 gap-4">
            <!-- Nazwa obiektu -->
            <div>
              <label for="place-name" class="block text-sm font-medium text-gray-700 mb-2">
                Nazwa obiektu *
              </label>
              <input
                type="text"
                id="place-name"
                bind:value={formData.nazwa}
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="np. Centrum Kultury"
              />
            </div>
          </div>
        </div>

        <!-- Activity Management -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Dodaj zajęcia</h3>
          
          <!-- New Activity Form -->
          <div class="bg-white p-4 rounded border">
            <h4 class="font-medium text-gray-900 mb-3">Nowe zajęcie</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="activity-name" class="block text-sm font-medium text-gray-700 mb-1">
                  Nazwa zajęcia *
                </label>
                <input
                  type="text"
                  id="activity-name"
                  bind:value={newSchoolData.nazwa}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="np. Balet klasyczny"
                />
              </div>
              
              <div>
                <label for="activity-type" class="block text-sm font-medium text-gray-700 mb-1">
                  Typ zajęcia *
                </label>
                <select
                  id="activity-type"
                  bind:value={newSchoolData.typ}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Wybierz typ</option>
                  {#each ACTIVITY_TYPES as activityType}
                    <option value={activityType.key}>{activityType.label}</option>
                  {/each}
                </select>
              </div>

              <div class="md:col-span-2">
                <fieldset>
                  <legend class="block text-sm font-medium text-gray-700 mb-1">
                    Grupa wiekowa *
                  </legend>
                <div class="flex flex-wrap gap-2">
                  {#each Array.from({length: 10}, (_, i) => i + 3) as age}
                    <button
                      type="button"
                      class="px-3 py-1 text-sm rounded-full border transition-colors"
                      class:bg-blue-500={newSchoolData.wiek.includes(age)}
                      class:text-white={newSchoolData.wiek.includes(age)}
                      class:border-blue-500={newSchoolData.wiek.includes(age)}
                      class:bg-white={!newSchoolData.wiek.includes(age)}
                      class:text-gray-700={!newSchoolData.wiek.includes(age)}
                      class:border-gray-300={!newSchoolData.wiek.includes(age)}
                      onclick={() => toggleNewActivityAge(age)}
                    >
                      {age} lat
                    </button>
                  {/each}
                </div>
                </fieldset>
              </div>
              
              <div class="md:col-span-2">
                <label for="activity-website" class="block text-sm font-medium text-gray-700 mb-1">
                  Strona internetowa
                </label>
                <input
                  type="url"
                  id="activity-website"
                  bind:value={newSchoolData.strona_internetowa}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            
            <!-- Add Activity Button -->
            <div class="flex justify-end mt-3">
              <button
                type="button"
                onclick={addActivity}
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Dodaj zajęcie
              </button>
            </div>
          </div>
          
          <!-- List of Added Activities -->
          {#if formData.zajecia.length > 0}
            <div class="mt-4">
              <h4 class="font-medium text-gray-900 mb-3">Dodane zajęcia:</h4>
              <div class="space-y-2">
                {#each formData.zajecia as zajecie, index}
                  {@const typeInfo = ACTIVITY_TYPES.find(type => type.key === zajecie.typ)}
                  <div class="bg-gray-100 p-3 rounded flex justify-between items-center">
                    <div class="flex items-center space-x-3">
                      <div
                        class="w-3 h-3 rounded-full"
                        style="background-color: {typeInfo?.color || '#3b82f6'}"
                      ></div>
                      <div>
                        <div class="font-medium">{zajecie.nazwa}</div>
                        <div class="text-sm text-gray-600">
                          {typeInfo?.label} • {zajecie.wiek.join(', ')} lat
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onclick={() => removeActivity(index)}
                      class="text-red-600 hover:text-red-800"
                    >
                      Usuń
                    </button>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
        
        <!-- Location Information -->
      <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Lokalizacja</h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left Column - Location Form -->
            <div class="space-y-4">
              <div>
                <label for="lokalizacja" class="block text-sm font-medium text-gray-700 mb-2">
                  Adres *
                </label>
                <div class="relative">
                  <input
                    type="text"
                    id="lokalizacja"
                    bind:value={locationInput}
                    oninput={handleLocationInput}
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Podaj adres..."
                  />
                  {#if showSuggestions && suggestions.length > 0}
                    <div class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {#each suggestions as suggestion}
                        <button
                          type="button"
                          class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          onclick={() => selectSuggestion(suggestion)}
                        >
                          {suggestion}
                        </button>
                      {/each}
                    </div>
                  {/if}
                </div>
              </div>
            </div>
            
            <!-- Right Column - Map -->
            <div>
              <label for="map-container" class="block text-sm font-medium text-gray-700 mb-2">
                Map lokalizacji
              </label>
              <div 
                id="map-container"
                bind:this={mapContainer} 
                class="w-full h-64 rounded-md border border-gray-300"
              ></div>
              <p class="text-sm text-gray-500 mt-1">
                Kliknij na mapę, aby ustawić dokładną lokalizację
              </p>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <button
            type="submit"
            disabled={isSubmitting}
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {isSubmitting ? 'Dodawanie...' : 'Dodaj obiekt'}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- JSON Preview Section -->
  <div class="max-w-4xl mx-auto mt-6">
    <div class="bg-white rounded-lg shadow-lg">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Podgląd JSON</h3>
        
        {#if formData.nazwa || formData.zajecia.length > 0}
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="text-sm font-medium text-gray-700">Struktura danych do wysłania:</h4>
              <button
                type="button"
                onclick={() => copyToClipboard()}
                class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Kopiuj JSON
              </button>
            </div>
            
            <pre class="text-xs text-gray-800 bg-white p-3 rounded border overflow-x-auto" id="json-preview">{@html formattedJson}</pre>
          </div>
          
          <div class="mt-3 text-sm text-gray-600">
            <p><strong>Status danych:</strong></p>
            <ul class="list-disc list-inside mt-1 space-y-1">
              <li class="text-red-600">
                Nazwa obiektu: {formData.nazwa || '❌ Brak nazwy'}
              </li>
              <li class="text-red-600">  
                Liczba zajęć: {formData.zajecia.length} {formData.zajecia.length === 0 ? '❌ Musisz dodać przynajmniej jedno zajęcie' : '✅ OK'}
              </li>
              <li class="text-red-600">
                Adres: {formData.lokalizacja.adres || '❌ Podaj adres'}
              </li>
              <li class="text-orange-600">
                Nowe zajęcie: {newSchoolData.nazwa || newSchoolData.typ ? '⚠️ Uzupełnij i dodaj do listy' : '✅ Brak niedokończonych danych'}
              </li>
            </ul>
          </div>
        {:else}
          <div class="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
            <p>Wypełnij formularz, aby zobaczyć podgląd JSON</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  :global(.custom-marker) {
    background: transparent !important;
    border: none !important;
  }
</style>