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

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden; /* if you want no scroll at all */
  font-family: 'Sarabun', sans-serif;
  background: linear-gradient(180deg, #C8F1FF 0%, #FBFDFE 100%);
}
</style>