<template>
  <router-view></router-view> <!-- This will load landing.vue by default -->
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: "App",
  setup() {
    const router = useRouter();

    onMounted(() => {
      router.afterEach(() => {
        // Remove Bootstrap modal leftovers that disable scrolling
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
      });
    });
  }
}
</script>
