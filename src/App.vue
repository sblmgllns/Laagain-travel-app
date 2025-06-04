<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from './pages/MainLayout.vue'

const route = useRoute()
const router = useRouter()

// Determine layout: if route.meta.layout is 'none', use 'div'; otherwise, use MainLayout
const layout = computed(() => {
  return route.meta.layout === 'none' ? 'div' : MainLayout
})

// Remove Bootstrap modal artifacts after route changes
onMounted(() => {
  router.afterEach(() => {
    document.body.classList.remove('modal-open')
    document.body.style.overflow = ''
    const backdrops = document.querySelectorAll('.modal-backdrop')
    backdrops.forEach(backdrop => backdrop.remove())
  })
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

@import url('https://fonts.googleapis.com/css2?family=Sarabun&display=swap');

* {
  font-family: 'Sarabun', sans-serif;
}
</style>