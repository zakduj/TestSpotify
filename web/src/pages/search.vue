<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const query = ref('');
const results = ref<{ items: any[]; total: number; offset: number; limit: number; next: string | null; previous: string | null } | null>(null);

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/login';
  } catch (e) {
    console.error(e);
  }
}

async function fetchPage(offset: number = 0) {
  try {

    const res = await fetch(`/api/search?q=${encodeURIComponent(query.value)}&offset=${offset}`, { credentials: 'include' });

    if (res.status === 401) { window.location.href = '/login'; return; }

    results.value = await res.json();

  } catch (e) {
    console.error(e);
  }
}

async function search() {
  if (!query.value.trim()) return;
  await fetchPage(0);
}

async function nextPage() {
  if (!results.value?.next) return;
  const offset = new URL(results.value.next).searchParams.get('offset');
  await fetchPage(Number(offset));
}

async function previousPage() {
  if (!results.value?.previous) return;
  const offset = new URL(results.value.previous).searchParams.get('offset');
  await fetchPage(Number(offset));
}

</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">

    <header class="w-full border-b border-zinc-800 bg-zinc-900/70 px-6 py-4 flex items-center justify-between">
      <h1 class="text-lg font-semibold tracking-wide cursor-pointer" @click="results = null; query = ''">TestSpotify</h1>
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

        <section v-if="results?.items?.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <div v-for="result in results?.items" :key="result.id" class="flex flex-col items-center bg-zinc-800 rounded-xl p-4 gap-3 hover:bg-zinc-700 transition">
            <img
              v-if="result.images && result.images.length > 0"
              :src="result.images[0].url"
              :alt="result.name"
              class="w-full aspect-square object-cover rounded-lg"
            />
            <div v-else class="w-full aspect-square bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-500 text-xs">No image</div>
            <p class="text-sm font-medium text-center truncate w-full">{{ result.name }}</p>
          </div>
        </section>
        <p v-else class="text-center text-zinc-500 text-sm">No result</p>
      </div>
    </main>

    <div v-if="results" class="flex items-center justify-center gap-6 py-6 border-t border-zinc-800">
      <button
        :disabled="!results?.previous"
        class="rounded-xl bg-zinc-700 px-4 py-2 text-sm font-medium transition hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed"
        @click="previousPage"
      >
        ← Previous
      </button>
      <span class="text-sm text-zinc-400">
        Page {{ Math.floor(results.offset / 20) + 1 }}
      </span>
      <button
        :disabled="!results?.next"
        class="rounded-xl bg-zinc-700 px-4 py-2 text-sm font-medium transition hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed"
        @click="nextPage"
      >
        Next →
      </button>
    </div>

  </div>
</template>

<style scoped>

</style>