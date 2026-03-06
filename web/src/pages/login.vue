<script setup lang="ts">
import { computed, ref } from 'vue';

const email = ref('');
const password = ref('');
const touched = ref(false);
const isSubmitting = ref(false);
const submitState = ref<'idle' | 'success' | 'error'>('idle');

const emailError = computed(() => {
  if (!touched.value) {
    return '';
  }
  if (!email.value.trim()) {
    return 'Email needed';
  }
  return '';
});

const passwordError = computed(() => {
  if (!touched.value) {
    return '';
  }
  if (!password.value.trim()) {
    return 'Password needed';
  }
  return '';
});

const hasError = computed(() => Boolean(emailError.value || passwordError.value));

async function handleSubmit() {
  touched.value = true;
  submitState.value = 'idle';

  if (hasError.value) {
    submitState.value = 'error';
    return;
  }
  // TODO: brancher le backend
}

</script>

<template>
  <main class="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100">
    <section class="mx-auto max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl">
      <p class="mb-2 text-sm uppercase tracking-wide text-brand-500">TestSpotify</p>
      <h1 class="text-2xl font-semibold">Connection</h1>

      <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="mb-1 block text-sm text-zinc-300">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="example@example.com"
            class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none transition focus:border-brand-500"
          />
          <p v-if="emailError" class="mt-1 text-xs text-red-400">{{ emailError }}</p>
        </div>

        <div>
          <label for="password" class="mb-1 block text-sm text-zinc-300">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="********"
            class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none transition focus:border-brand-500"
          />
          <p v-if="passwordError" class="mt-1 text-xs text-red-400">{{ passwordError }}</p>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {{ isSubmitting ? 'Connecting...' : 'Submit' }}
        </button>
      </form>

      <p v-if="submitState === 'success'" class="mt-4 text-sm text-emerald-400">
        Connected successfully.
      </p>
      <p v-if="submitState === 'error'" class="mt-4 text-sm text-red-400">
        Connection error.
      </p>
    </section>
  </main>
</template>