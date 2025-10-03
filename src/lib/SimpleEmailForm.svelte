<script lang="ts">
  import type { Activity } from './types.js';

  let { emailData }: { emailData: Activity } = $props();

  let email = $state('');
  let name = $state('');
  let isLoading = $state(false);
  let result = $state({ success: false, message: '' });

  async function submitToFormspree(formData: FormData) {
    // Replace this with your actual Formspree endpoint
    // Sign up at https://formspree.io/ to get your endpoint
    const RESULT = $state({ success: false, message: '' });
    
    try {
      const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        RESULT.success = true;
        RESULT.message = 'Dane zostały wysłane pomyślnie! 🎉';
      } else {
        RESULT.success = false;
        RESULT.message = `Błąd: ${data.error || 'Nieznany błąd'}`;
      }
    } catch (error) {
      RESULT.success = false;
      RESULT.message = 'Błąd połączenia. Sprawdź internet.';
    }
    
    return RESULT;
  }

  async function handleSubmit($event: SubmitEvent) {
    $event.preventDefault();
    if (!email || !name) return;
    
    isValidating = true;
    
    const formContent = new FormData();
    formContent.append('form-name', 'activity-submission');
    formContent.append('email', email);
    formContent.append('name', name);
    formContent.append('activity-name', emailData.nazwa);
    formContent.append('activity-type', emailData.typ);
    formContent.append('activity-age', emailData.wiek.join(', '));
    formContent.append('activity-address', emailData.lokalizacja.adres);
    formContent.append('activity-coords', `${emailData.lokalizacja.lat}, ${emailData.lokalizacja.lng}`);
    if (emailData.strona_internetowa) {
      formContent.append('activity-website', emailData.strona_internetowa);
    }
    formContent.append('activity-json', JSON.stringify(emailData, null, 2));
    formContent.append('message', `Nowe miejsce dodane przez ${name}:

Nazwa: ${emailData.nazwa}
Typ: ${emailData.typ}
Wiek: ${emailData.wiek.join(', ')} lat
Adres: ${emailData.lokalizacja.adres}
Współrzędne: ${emailData.lokalizacja.lat}, ${emailData.lokalizacja.lng}
${emailData.strona_internetowa ? `Strona: ${emailData.strona_internetowa}` : ''}

JSON:
${JSON.stringify(emailData, null, 2)}`);

    try {
      result = await submitToFormspree(formContent);
      
      if (result.success) {
        // Reset form on success
        email = '';
        name = '';
      }
    } finally {
      isLoading = false;
    }
  }

  let isValidating = $state(false);
</script>

<div class="bg-white border border-gray-200 rounded-lg p-6 mx-4 mt-6">
  <h3 class="text-xl font-semibold text-gray-900 mb-4">📨 Wyślij dane (Formspree)</h3>
  
  {#if result.message}
    <div class="mb-4 p-4 rounded-md" 
         class:bg-green-50={result.success} 
         class:border-green-200={result.success}
         class:bg-red-50={!result.success}
         class:border-red-200={!result.success}>
      <p class="text-sm" 
         class:text-green-800={result.success} 
         class:text-red-800={!result.success}>
        {result.message}
      </p>
    </div>
  {/if}

  <form onsubmit={handleSubmit}>
    <div class="space-y-4">
      <div>
        <label for="email-formspree" class="block text-sm font-medium text-gray-700 mb-1">
          Twój email *
        </label>
        <input
          type="email"
          id="email-formspree"
          bind:value={email}
          required
          disabled={isLoading}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          placeholder="twoj@email.com"
        />
      </div>

      <div>
        <label for="name-formspree" class="block text-sm font-medium text-gray-700 mb-1">
          Twoje imię *
        </label>
        <input
          type="text"
          id="name-formspree"
          bind:value={name}
          required
          disabled={isLoading}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          placeholder="Jan Kowalski"
        />
      </div>

      <div class="bg-gray-50 rounded-md p-3">
        <h4 class="text-sm font-medium text-gray-700 mb-2">📋 Co zostanie wysłane:</h4>
        <div class="text-sm text-gray-600 space-y-1">
          <p><strong>Miejsce:</strong> {emailData.nazwa}</p>
          <p><strong>Typ:</strong> {emailData.typ}</p>
          <p><strong>Wiek:</strong> {emailData.wiek.join(', ')} lat</p>
          <p><strong>Adres:</strong> {emailData.lokalizacja.adres}</p>
          {#if emailData.strona_internetowa}
            <p><strong>Strona:</strong> {emailData.strona_internetowa}</p>
          {/if}
          <p><strong>Współrzędne:</strong> {emailData.lokalizacja.lat}, {emailData.lokalizacja.lng}</p>
          <p><strong>Pełny JSON</strong> z wszystkimi danymi</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !email || !name}
        class="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {#if isLoading}
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Wysyłanie...
        {:else}
          📨 Wyślij przez Formspree
        {/if}
      </button>
    </div>
  </form>

  <!-- Setup Instructions -->
  <div class="bg-purple-50 border border-purple-200 rounded-md p-4 mt-4">
    <h4 class="text-sm font-medium text-purple-800 mb-2">⚙️ Setup Formspree (łatwiejsze niż EmailJS):</h4>
    <div class="text-sm text-purple-700 space-y-1">
      <p>1. Idź na <a href="https://formspree.io" target="_blank" class="underline">formspree.io</a></p>
      <p>2. Kliknij "Get started" → Wybierz plan bezpłatny</p>
      <p>3. Skopiuuj URL nowego formularza (np. https://formspree.io/f/xpvgxxx)</p>
      <p>4. Zamień "YOUR_FORM_ID" w kodzie na ID z URL</p>
      <p>5. Gotowe! Formularz natychmiast działa ✨</p>
      <p class="mt-2 text-xs text-purple-600">💡 Tip: Formspree jest szybsze w konfiguracji niż EmailJS</p>
    </div>
  </div>
</div>
