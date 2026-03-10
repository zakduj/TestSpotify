<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const artistState = useState('selectedArtist', () => ({ id: '', name: '', image: '' }));
const artistId = artistState.value.id;
const artistName = artistState.value.name;
const artisteImages = artistState.value.image;
const albums = ref('');

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    await navigateTo({ path:'/login'});
  } catch (e) {
    console.error(e);
  }
}

async function home() {
  try {
    await navigateTo({ path:'/search'});
  } catch (e) {
    console.error(e);
  }
}

async function fetchAlbums() {
  try {
    const res = await fetch(`/api/artist/${artistId}`, { credentials: 'include' });
    if (res.status === 401) { await navigateTo('/login'); return; }
    albums.value  = await res.json();
  } catch (e: any) {
    console.error(e);
  }
}

onMounted(() => {
  if (artistId) fetchAlbums();
});

</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
    <header class="w-full border-b border-zinc-800 bg-zinc-900/70 px-6 py-4 flex items-center justify-between">
      <h1 class="text-lg font-semibold tracking-wide cursor-pointer" @click="home">TestSpotify</h1>
      <button
          class="rounded-xl bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-600"
          @click="logout"
      >
        Logout
      </button>
    </header>

    <main class="flex-1 px-6 py-10">
      <div class="mx-auto max-w-sm">
        <img v-if="artisteImages"
          :src="artisteImages"
          :alt="artistName"
          class="w-full aspect-square object-cover rounded-lg"/>
        <div v-else class="w-full aspect-square bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-500 text-xs">No image</div>
        <p class="text-lg font-big text-center truncate w-full">{{ artistName }}</p>
      </div>

      <div class="mx-auto max-w-2xl">
        <section v-if="albums?.items?.length > 0" class="flex flex-col gap-3">
          <div v-for="result in albums?.items" :key="result.id" class="flex items-center gap-4 bg-zinc-800 rounded-xl p-3 hover:bg-zinc-700 transition">
            <img v-if="result.images && result.images.length > 0"
                :src="result.images[0].url"
                :alt="result.name"
                class="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
            <div v-else class="w-16 h-16 bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-500 text-xs flex-shrink-0">No image</div>
            <div class="flex flex-col gap-1 min-w-0">
              <p class="text-sm font-semibold truncate">{{ result.name }}</p>
              <p class="text-xs text-zinc-400 truncate">
                {{ result.artists.map((a: any) => a.name).join(', ') }}
              </p>
              <div class="flex items-center gap-2 text-xs text-zinc-500">
                <span class="capitalize">{{ result.album_type }}</span>
                <span>·</span>
                <span>{{ new Date(result.release_date).getFullYear() }}</span>
                <span>·</span>
                <span>{{ result.total_tracks }} {{ result.total_tracks > 1 ? 'tracks' : 'track' }}</span>
              </div>
            </div>
          </div>
        </section>
        <p v-else class="text-center text-zinc-500 text-sm">No result</p>
      </div>
    </main>

  </div>

</template>

<style scoped>

</style>