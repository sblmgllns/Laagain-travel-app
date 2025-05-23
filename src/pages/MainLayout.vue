<template>
  <div class="d-flex" style="height: 100vh; overflow: hidden;">
    <!-- sidenav -->
    <sidenav @open-modal="isModalOpen = true" />

    <!-- Main Content Area -->
    <div class="main-content flex-grow-1 p-4">
      <div class="routed-container">
        <!-- Modal container, absolute so not scrollable -->
        <div class="modal-wrapper">
          <CreateItineraryModal
            :isOpen="isModalOpen"
            @close="isModalOpen = false"
          />
        </div>

        <!-- Scrollable content area -->
        <div class="scrollable-content">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import sidenav from './sidenav.vue'
import CreateItineraryModal from './CreateItineraryModal.vue'
import { ref } from 'vue'

const isModalOpen = ref(false)
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  background: linear-gradient(180deg, #C8F1FF 0%, #FBFDFE 100%);
  overflow: hidden; /* if you want to prevent page scrolling */
}


.main-content {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, #C8F1FF 0%, #FBFDFE 100%);
  overflow: hidden; /* prevent main layout from scrolling */
  display: flex;
  flex-direction: column;
}


*, *::before, *::after {
  box-sizing: border-box;
}

.routed-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: white;
  border-radius: 24px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  height: 100%;
  overflow: hidden;
  border: 1px solid #ccc;
  position: relative;
}

/* Modal container positioned absolutely, won't scroll */
.modal-wrapper {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 10;
  pointer-events: none;
}

/* Modal itself allows pointer events */
.modal-wrapper > * {
  pointer-events: auto;
}



/* SCROLLABLE CONTENT */
.scrollable-content {
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
}


/* Larger screens - push for sidebar */
@media (min-width: 768px) {
  .main-content {
    margin-left: 80px;
  }
}

/* Mobile screens - full width modal container */
@media (max-width: 600px) {
  .routed-container {
    border-radius: 0;
    max-width: 100%;
    margin: 0;
  }
  .main-content {
    padding: 0 !important;
    margin: 0 !important;
  }
}

</style>
