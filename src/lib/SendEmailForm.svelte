<script lang="ts">
  import emailjs from '@emailjs/browser';
  import type { Activity } from './types.js';

  let { emailData }: { emailData: Activity } = $props();

  let recipientEmail = $state('');
  let senderName = $state('');
  let isSending = $state(false);
  let sendStatus = $state<'idle' | 'sending' | 'success' | 'error'>('idle');
  let errorMessage = $state('');

  // EmailJS configuration constants
  // These would typically come from environment variables in production
  const EMAILJS_SERVICE_ID = 'default_service'; // Replace with your service ID
  const EMAILJS_TEMPLATE_ID = 'template_123'; // Replace with your template ID  
  const EMAILJS_PUBLIC_KEY = 'your_public_key'; // Replace with your public key

  async function sendEmail() {
    if (!recipientEmail || !senderName) {
      errorMessage = 'Proszę wypełnić wszystkie pola';
      sendStatus = 'error';
      return;
    }

    if (!recipientEmail.includes('@')) {
      errorMessage = 'Proszę podać prawidłowy adres email';
      sendStatus = 'error';
      return;
    }

    isSending = true;
    sendStatus = 'sending';

    try {
      const templateParams = {
        to_email: recipientEmail,
        from_name: senderName,
        activity_data: JSON.stringify(emailData, null, 2),
        subject: `Nowe miejsce: ${emailData.nazwa}`,
        message: `Formularz dodany przez: ${senderName}

Dane miejsca:
Nazwa: ${emailData.nazwa}
Typ: ${emailData.typ}
Wiek: ${emailData.wiek.join(', ')} lat
Lokalizacja: ${emailData.lokalizacja.adres}
Współrzędne: ${emailData.lokalizacja.lat}, ${emailData.lokalizacja.lng}
${emailData.strona_internetowa ? `Strona: ${emailData.strona_internetowa}` : ''}

Pełny JSON:
${JSON.stringify(emailData, null, 2)}`
      };

      // Initialize EmailJS (only needed once)
      emailjs.init(EMAILJS_PUBLIC_KEY);

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('Email sent successfully:', response);
      sendStatus = 'success';
      
      // Reset form after success
      setTimeout(() => {
        recipientEmail = '';
        senderName = '';
        sendStatus = 'idle';
      }, 3000);

    } catch (error) {
      console.error('Error sending email:', error);
      sendStatus = 'error';
      errorMessage = 'Nie udało się wysłać emaila. Sprawdź konfigurację EmailJS.';
    } finally {
      isSending = false;
    }
  }

  function resetForm() {
    sendStatus = 'idle';
    errorMessage = '';
    recipientEmail = '';
    senderName = '';
  }
</script>

<div class="bg-white border border-gray-200 rounded-lg p-6 mx-4 mt-6">
  <h3 class="text-xl font-semibold text-gray-900 mb-4">📧 Wyślij dane na email</h3>
  
  {#if sendStatus === 'success'}
    <div class="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8'8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-800">
            Email został wysłany pomyślnie! 🎉
          </p>
        </div>
      </div>
    </div>
  {:else if sendStatus === 'error'}
    <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-800">{errorMessage}</p>
        </div>
      </div>
    </div>
  {/if}

  <div class="space-y-4">
    <div>
      <label for="recipient-email" class="block text-sm font-medium text-gray-700 mb-1">
        Adres email odbiorcy *
      </label>
      <input
        type="email"
        id="recipient-email"
        bind:value={recipientEmail}
        disabled={isSending}
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder="np. rodzic@example.com"
      />
    </div>

    <div>
      <label for="sender-name" class="block text-sm font-medium text-gray-700 mb-1">
        Twoje imię *
      </label>
      <input
        type="text"
        id="sender-name"
        bind:value={senderName}
        disabled={isSending}
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder="np. Jan Kowalski"
      />
    </div>

    <div class="bg-gray-50 rounded-md p-3">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Co zostanie wysłane:</h4>
      <ul class="text-sm text-gray-600 space-y-1">
        <li>• Nazwa miejsca: <span class="font-medium">{emailData.nazwa}</span></li>
        <li>• Typ zajęcia: <span class="font-medium">{emailData.typ}</span></li>
        <li>• Grupa wiekowa: <span class="font-medium">{emailData.wiek.join(', ')} lat</span></li>
        <li>• Adres: <span class="font-medium">{emailData.lokalizacja.adres}</span></li>
        {#if emailData.strona_internetowa}
          <li>• Strona internetowa: <span class="font-medium">{emailData.strona_internetowa}</span></li>
        {/if}
        <li>• Pełny JSON z danymi miejsca</li>
      </ul>
    </div>

    <div class="flex space-x-3">
      <button
        onclick={sendEmail}
        disabled={isSending || sendStatus === 'success'}
        class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if isSending}
          <span class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Wysyłanie...
          </span>
        {:else}
          📧 Wyślij na email
        {/if}
      </button>

      {#if sendStatus === 'error'}
        <button
          onclick={resetForm}
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Spróbuj ponownie
        </button>
      {/if}
    </div>

    <!-- Setup Instructions -->
    <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
      <h4 class="text-sm font-medium text-blue-800 mb-2">⚙️ Konfiguracja EmailJS:</h4>
      <div class="text-sm text-blue-700 space-y-1">
        <p>1. Zarejestruj się na <a href="https://emailjs.com" target="_blank" class="underline">emailjs.com</a></p>
        <p>2. Utwórz serwis email (Gmail, Outlook)</p>
        <p>3. Utwórz szablon email z polami:</p>
        <ul class="ml-4 space-y-1">
          <li>• {{to_email}} - email odbiorcy</li>
          <li>• {{from_name}} - imię nadawcy</li>
          <li>• {{message}} - treść wiadomości</li>
        </ul>
        <p>4. Skopiuuj Service ID, Template ID i Public Key do zmiennych w kodzie</p>
      </div>
    </div>
  </div>
</div>
