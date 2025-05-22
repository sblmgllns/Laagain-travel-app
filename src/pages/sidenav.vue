<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRoute } from 'vue-router'

const defaultAvatar = '/assets/default-avatar.png'
const userAvatar = ref(defaultAvatar)
const route = useRoute()

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('profile_pic_url')
    .eq('id', user.id)
    .single()

  if (profile) {
    userAvatar.value = profile.profile_pic_url || defaultAvatar
  }
})
</script>

<template>
  <div>
    <!-- Desktop Sidebar -->
    <div
      class="d-flex flex-column justify-content-between align-items-center vh-100 py-4 d-none d-md-flex"
      style="width: 80px; background: linear-gradient(180deg, #C8F1FF 0%, #FBFDFE 100%); position: fixed;"
    >
      <!-- Top Nav -->
      <div class="d-flex flex-column align-items-center gap-4 w-100">
        
        <router-link to="/dashboard" class="logo-link">
          <img
            src="https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//laagain_logo.png"
            alt="Laagain Logo"
            class="app-logo"
          />
        </router-link>

        <button
          @click="$emit('open-modal')"
          class="nav-btn text-dark text-center"
          title="Create New Itinerary"
        >
          <i class="bi bi-plus-lg"></i>
        </button>

        <router-link to="/dashboard" class="text-dark text-center" title="Home">
          <i :class="['bi', route.path === '/dashboard' ? 'bi-house-fill' : 'bi-house', 'fs-4']"></i>
        </router-link>

        <router-link to="/explore" class="text-dark text-center" title="Explore">
          <i :class="['bi', route.path === '/explore' ? 'bi-compass-fill' : 'bi-compass', 'fs-4']"></i>
        </router-link>
      </div>

      <!-- Bottom Nav -->
      <div class="d-flex flex-column align-items-center gap-4 w-100">
        <router-link to="/notifications" class="text-dark text-center" title="Notifications">
          <i class="bi bi-bell fs-4"></i>
        </router-link>

        <router-link to="/profile" class="text-center" title="Profile">
          <img
            :src="userAvatar"
            alt="Profile"
            class="rounded-circle border"
            style="width: 40px; height: 40px; object-fit: cover; border-color: #68D2E8;"
          />
        </router-link>
      </div>
    </div>

    <!-- Mobile Bottom Nav -->
    <div
      class="d-flex d-md-none justify-content-around align-items-center px-2"
      style="position: fixed; bottom: 0; width: 100%; height: 64px; background: linear-gradient(180deg, #C8F1FF 0%, #FBFDFE 100%); border-top: 1px solid #ccc; z-index: 99;"
    >
      <router-link to="/dashboard" class="text-dark text-center" title="Home">
        <i :class="['bi', route.path === '/dashboard' ? 'bi-house-fill' : 'bi-house', 'fs-4']"></i>
      </router-link>

      <router-link to="/explore" class="text-dark text-center" title="Explore">
        <i :class="['bi', route.path === '/explore' ? 'bi-compass-fill' : 'bi-compass', 'fs-4']"></i>
      </router-link>

      <button
        @click="$emit('open-modal')"
        class="nav-btn text-dark text-center"
        title="Create New Itinerary"
      >
        <i class="bi bi-plus-lg"></i>
      </button>


      <router-link to="/notifications" class="text-dark text-center" title="Notifications">
        <i class="bi bi-bell fs-4"></i>
      </router-link>

      <router-link to="/profile" class="text-center" title="Profile">
        <img
          :src="userAvatar"
          alt="Profile"
          class="rounded-circle border"
          style="width: 32px; height: 32px; object-fit: cover; border-color: #68D2E8;"
        />
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.nav-btn {
  background-color: rgba(255, 255, 255, 0.6);
  color: #0e0e0d;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 1.25rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  backdrop-filter: blur(6px);
}

.nav-btn:hover {
  background-color: #fddf57;
  color: #0e0e0d;
}

.logo-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  text-decoration: none;
  border-radius: 8px;
}

.app-logo {
  max-width: 48px;  /* Adjust size as needed */
  height: auto;
  transition: transform 0.3s ease;
}

.logo-link:hover .app-logo {
  transform: scale(1.05); /* Subtle hover animation */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

}

</style>
