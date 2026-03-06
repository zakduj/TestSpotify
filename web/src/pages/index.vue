<script setup lang="ts">
import {navigateTo} from "nuxt/app";

await navigateTo('/login', { replace: true });
</script>

<template>
  <div class="p-4 text-sm text-zinc-400">Redirection...</div>
</template>

