<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Activity } from './types.js';
  import { ACTIVITY_TYPES } from './types.js';

  let { activities = [], selectedActivity = null, onActivitySelect = () => {} }: {
    activities?: Activity[];
    selectedActivity?: Activity | null;
    onActivitySelect?: (activity: Activity) => void;
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

    // Add new markers
    activities.forEach(activity => {
      const activityType = ACTIVITY_TYPES.find(type => type.key === activity.typ);
      const color = activityType?.color || '#3b82f6';

      // Create custom icon
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([activity.lokalizacja.lat, activity.lokalizacja.lng], {
        icon: customIcon
      }).addTo(map);

      // Add popup
      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold text-lg mb-2">${activity.nazwa}</h3>
          <p class="text-sm text-gray-600 mb-1">
            <strong>Typ:</strong> ${activityType?.label || activity.typ}
          </p>
          <p class="text-sm text-gray-600 mb-1">
            <strong>Wiek:</strong> ${activity.wiek.join(', ')} lat
          </p>
          <p class="text-sm text-gray-600">
            <strong>Adres:</strong> ${activity.lokalizacja.adres}
          </p>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Add click handler
      marker.on('click', () => {
        onActivitySelect(activity);
      });

      markers.push(marker);
    });
  }

  // React to activities changes
  $effect(() => {
    if (L && map && activities) {
      updateMarkers();
    }
  });

  // React to selected activity changes
  $effect(() => {
    if (L && map && selectedActivity) {
      map.setView([selectedActivity.lokalizacja.lat, selectedActivity.lokalizacja.lng], 15);
      
      // Open popup for selected activity
      const marker = markers.find(m => {
        const latLng = m.getLatLng();
        return latLng.lat === selectedActivity.lokalizacja.lat && 
               latLng.lng === selectedActivity.lokalizacja.lng;
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
