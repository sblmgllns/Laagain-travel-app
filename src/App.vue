<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from './pages/MainLayout.vue'

const route = useRoute()

// Check if current route has a "layout" or defaults to MainLayout
const layout = computed(() => {
  return route.meta.layout === 'none' ? 'div' : MainLayout
})
</script>

<style>
/* For WebKit (Chrome, Edge, Opera) */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  border: 2px solid transparent;
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.25);
}

/* For Firefox */
html {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

body {
  margin: 0;
  font-family: 'Sarabun', sans-serif;
  background: linear-gradient(180deg, #C8F1FF 0%, #FBFDFE 100%);
  overflow-y: scroll; /* Ensure scroll is allowed */
}

</style>