<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { PlaceObject } from './types.js';
  import { ACTIVITY_TYPES } from './types.js';

  let { places = [], selectedPlace = null, onPlaceSelect = () => {} }: {
    places?: PlaceObject[];
    selectedPlace?: PlaceObject | null;
    onPlaceSelect?: (place: PlaceObject) => void;
  } = $props();

  let mapContainer: HTMLDivElement;
  let map: any;
  let markers: any[] = [];
  let L: any;

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
    }).addTo(map);

    updateMarkers();
  });

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });

  function updateMarkers() {
    if (!L || !map) return;
    
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Add new markers for each place
    places.forEach(place => {
      // Get unique activity types for this place
      const uniqueTypes = [...new Set(place.zajecia.map(zajecie => zajecie.typ))];
      const activityTypes = uniqueTypes.map(type => ACTIVITY_TYPES.find(t => t.key === type));
      
      // Create marker icon based on number of activity types
      let iconHtml;
      if (uniqueTypes.length === 1) {
        // Single color for single activity type
        const color = activityTypes[0]?.color || '#3b82f6';
        iconHtml = `<div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`;
      } else {
        // Multi-color indicator for multiple activity types
        const colors = activityTypes.map(type => type?.color || '#3b82f6').slice(0, 3); // Max 3 colors
        iconHtml = `<div style="
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          background: conic-gradient(from 0deg, ${colors.join(', ')});
        "></div>`;
      }

      // Create custom icon
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: iconHtml,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([place.lokalizacja.lat, place.lokalizacja.lng], {
        icon: customIcon
      }).addTo(map);

      // Add popup content for the place
      const zajeciaList = place.zajecia.map(zajecie => {
        const activityType = ACTIVITY_TYPES.find(type => type.key === zajecie.typ);
        const wiekRange = zajecie.wiek.length === 1 ? 
          `${zajecie.wiek[0]} lat` : 
          `${Math.min(...zajecie.wiek)}-${Math.max(...zajecie.wiek)} lat`;
        
        return `
          <div class="mb-3 p-2 border rounded">
            <strong>${zajecie.nazwa}</strong><br>
            <span class="text-sm text-gray-600">
              Typ: ${activityType?.label || zajecie.typ}<br>
              Wiek: ${wiekRange}
            </span>
          </div>
        `;
      }).join('');

      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold text-lg mb-2">${place.nazwa}</h3>
          <p class="text-sm text-gray-600 mb-2">
            <strong>Adres:</strong> ${place.lokalizacja.adres}
          </p>
          <div class="mt-2">
            <strong class="text-sm">Dostępne zajęcia:</strong>
            ${zajeciaList}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Add click handler
      marker.on('click', () => {
        onPlaceSelect(place);
      });

      markers.push(marker);
    });
  }

  // React to places changes
  $effect(() => {
    console.log('Effect triggered, L:', !!L, 'map:', !!map, 'places:', places.length);
    if (L && map && places) {
      updateMarkers();
    }
  });

  // React to selected place changes
  $effect(() => {
    if (L && map && selectedPlace) {
      map.setView([selectedPlace.lokalizacja.lat, selectedPlace.lokalizacja.lng], 15);
      
      // Open popup for selected place
      const marker = markers.find(m => {
        const latLng = m.getLatLng();
        return latLng.lat === selectedPlace.lokalizacja.lat && 
               latLng.lng === selectedPlace.lokalizacja.lng;
      });
      
      if (marker) {
        marker.openPopup();
      }
    }
  });
</script>

<div bind:this={mapContainer} class="w-full h-full min-h-[400px]"></div>

<style>
  :global(.custom-marker) {
    background: transparent !important;
    border: none !important;
  }
</style>
