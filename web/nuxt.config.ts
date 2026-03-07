import { defineNuxtConfig } from 'nuxt/config';

const API_PROXY_URL = process.env.NUXT_API_PROXY_URL;

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
    '/api/**': { proxy: `${API_PROXY_URL}/**` }
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_API_PROXY_URL
    }
  }
});