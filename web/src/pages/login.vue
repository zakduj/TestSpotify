<script setup lang="ts">
import { ref } from 'vue';

const isLoading = ref(false);
const error = ref('');

async function connect() {
  isLoading.value = true;
  error.value = '';
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (!response.ok) {
      error.value = 'Impossible to connect to spotify.';
      return;
    }

    window.location.href = '/search';
  } catch (e) {
    error.value = 'Erreur reseau: ' + (e instanceof Error ? e.message : String(e));
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <main class="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 flex items-center justify-center">
    <section class="mx-auto max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/70 p-10 shadow-2xl text-center">
      <p class="mb-2 text-sm uppercase tracking-wide text-brand-500">TestSpotify</p>
      <h1 class="text-2xl font-semibold mb-2">Welcome</h1>

      <button
        :disabled="isLoading"
        class="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-medium text-black transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
        @click="connect"
      >
        {{ isLoading ? 'Connexion en cours...' : 'Connect to spotify' }}
      </button>

      <p v-if="error" class="mt-4 text-sm text-red-400">{{ error }}</p>
    </section>
  </main>
</template>