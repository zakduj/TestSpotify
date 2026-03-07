export default defineNuxtRouteMiddleware(async () => {
  const headers = useRequestHeaders(['cookie']);

  try {
    await $fetch('/api/auth/check', { headers });
  } catch {
    return navigateTo('/login');
  }
});