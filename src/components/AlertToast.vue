<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="alert-toast"
      :class="typeClass"
      role="alert"
    >
      <div class="alert-content">
        <strong class="alert-title">{{ title }}</strong>
        <span class="alert-message">{{ message }}</span>
      </div>
      <button class="alert-close" @click="close">×</button>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  message: String,
  type: {
    type: String,
    default: "info", // 'success', 'error', 'info'
  },
  duration: {
    type: Number,
    default: 3000,
  },
});

const visible = ref(true);
const emit = defineEmits(["close"]);

const title = computed(() => {
  switch (props.type) {
    case "success":
      return "Success";
    case "error":
      return "Error";
    case "info":
    default:
      return "Notice";
  }
});

const typeClass = computed(() => {
  return {
    "alert-success": props.type === "success",
    "alert-error": props.type === "error",
    "alert-info": props.type === "info",
  };
});

const close = () => {
  visible.value = false;
  emit("close");
};

onMounted(() => {
  setTimeout(close, props.duration);
});
</script>

<style scoped>
.alert-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border-left: 5px solid;
  padding: 12px 16px;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 280px;
  gap: 12px;
}

.alert-content {
  display: flex;
  flex-direction: column;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 2px;
}

.alert-message {
  font-size: 0.95rem;
  color: #444;
}

.alert-success {
  border-color: #28a745;
}

.alert-error {
  border-color: #dc3545;
}

.alert-info {
  border-color: #007bff;
}

.alert-close {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #555;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>