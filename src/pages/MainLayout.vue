<template>
  <div class="d-flex" style="height: 100vh; overflow: hidden;">
    <!-- sidenav -->
    <sidenav />

    <!-- Main Content Area with Gradient -->
    <div
    class="flex-grow-1 p-4"
    style="background: linear-gradient(180deg, #C8F1FF 0%, #FBFDFE 100%);
            display: flex;
            flex-direction: column;
            height: 100vh;
            overflow: hidden;">
      <div class="routed-container">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import sidenav from './sidenav.vue'
</script>

<style scoped>
.routed-container {
  background-color: white;
  border-radius: 24px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  padding: 0;

  width: 100%;
  max-width: 1600px;
  margin: 0 auto;

  flex: 1 1 0;
  overflow-y: auto;
  min-height: 0; /* 👈 KEY: allow it to shrink properly for scroll */
}


</style>
