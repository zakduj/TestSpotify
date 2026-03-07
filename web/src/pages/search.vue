<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const query = ref('');
const results = ref([]);

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/login';
  } catch (e) {
    console.error(e);
  }
}

async function search() {
  if (!query.value.trim()) return;
  // TODO: appel API
}
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">

    <header class="w-full border-b border-zinc-800 bg-zinc-900/70 px-6 py-4 flex items-center justify-between">
      <h1 class="text-lg font-semibold tracking-wide">TestSpotify</h1>
      <button
        class="rounded-xl bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-600"
        @click="logout"
      >
        Logout
      </button>
    </header>

    <main class="flex-1 px-6 py-10">
      <div class="mx-auto max-w-2xl">
        <div class="flex gap-2 mb-8">
          <input
            v-model="query"
            type="text"
            placeholder="Search an artist..."
            class="flex-1 rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-green-500 transition"
            @keyup.enter="search"
          />
          <button
            class="rounded-xl bg-green-500 px-5 py-3 text-sm font-medium text-black transition hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!query.trim()"
            @click="search"
          >
            Search
          </button>
        </div>

        <section v-if="results.length > 0">
          <!-- TODO: afficher les résultats -->
        </section>
        <p v-else class="text-center text-zinc-500 text-sm">No result</p>

      </div>
    </main>

  </div>
</template>

<style scoped>

</style>