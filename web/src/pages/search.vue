<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/login';
  } catch (e) {
    console.error(e);
  }
}

</script>

<template>
  <main class="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 flex items-center justify-center">
    <section class="mx-auto max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/70 p-10 shadow-2xl text-center">
      <h1 class="text-2xl font-semibold mb-2">Search</h1>
      <p class="text-sm text-zinc-400">This page is under construction.</p>
    </section>
      <button class="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-medium text-black transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
      @click="logout">
        Disconect
      </button>
    <section>

    </section>
  </main>
</template>

<style scoped>

</style>