<template>
  <div
    v-if="isOpen"
    class="modal-overlay"
    @click.self="close"
  >
    <div class="modal-content custom-modal p-0 rounded">
      <!-- Sticky header -->
      <div class="modal-header sticky-top bg-white p-4 border-bottom" style="z-index: 1;">
        <h5>Notification</h5>
      </div>

      <!-- Scrollable content body -->
      <div class="modal-body p-4">
        <Notifications @close="emit('close')" :isChild="true" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Notifications from './Notifications.vue'

const props = defineProps({
  isOpen: Boolean
})

// Define the events that can be emitted
const emit = defineEmits(['close'])

function close() {
      console.log('Modal close triggered')

  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: absolute; /* position relative to .modal-wrapper */
  top: 0;
  left: 0;
  width: auto; /* shrink to fit */
  max-width: 480px;
  height: 100%; /* fill height of modal-wrapper */
  background: white; /* or your modal background */
  border-radius: 24px;
  pointer-events: auto; /* allow clicks */
  transition: opacity 0.3s ease, transform 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

}


.custom-modal {
  width: auto;
  max-width: 480px;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  background: white;
  border-radius: 24px;
  padding: 1.5rem;
  /* box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15); */
}


.modal-header {
  position: sticky;
  top: 0;
}

@media (max-width: 600px) {
  .modal-overlay {
    position: fixed;
    bottom: 0;
    top: auto;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    max-height: 90vh;
    border-radius: 24px 24px 0 0;
    transform: translateY(100%);
    animation: slideUp 0.3s ease-out forwards;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0%);
  }
}



</style>
