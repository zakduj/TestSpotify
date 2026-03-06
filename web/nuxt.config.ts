import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2026-03-06',
  srcDir: 'src/',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],

  devServer: {
    port: 4000
  },

  routeRules: {
    '/api/**': { proxy: 'http://127.0.0.1:3000/**' }
  }
});
