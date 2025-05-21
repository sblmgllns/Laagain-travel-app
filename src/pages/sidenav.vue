<template>
  <!-- nav bar -->
  <div
    class="d-flex flex-column justify-content-between align-items-center vh-100 py-4"
    style="width: 80px; background: linear-gradient(180deg, #C8F1FF 0%, #FBFDFE 100%);"
  >
    <!-- Top Nav -->
    <div class="d-flex flex-column align-items-center gap-4 w-100">
      <button class="nav-btn">
        <i class="bi bi-plus-lg"></i>
      </button>

      <router-link to="/dashboard" class="text-dark text-center" title="Home">
        <i class="bi bi-house fs-4"></i>
      </router-link>

      <router-link to="/explore" class="text-dark text-center" title="Explore">
        <i class="bi bi-compass fs-4"></i>
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const defaultAvatar = '/assets/default-avatar.png'
const userAvatar = ref(defaultAvatar)

onMounted(async () => {
  // Get session and user
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) {
    console.error('No logged in user')
    return
  }

  // Fetch profile data from 'profiles' table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('profile_pic_url')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error.message)
    return
  }

  // Set avatar or fallback
  userAvatar.value = profile.profile_pic_url || defaultAvatar
})
</script>

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
</style>
