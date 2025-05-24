<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '../supabase'
import { useRoute } from 'vue-router'
const showNotifications = ref(false)
const defaultAvatar = '/assets/default-avatar.png'
const userAvatar = ref(defaultAvatar)
const route = useRoute()
const emit = defineEmits(['open-modal'])  // ✅ Add this

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

function handleNotificationClick() {
  showNotifications.value = !showNotifications.value
  emit('open-modal', showNotifications.value ? 'notifications' : null)
}

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
        
        <router-link to="/dashboard" class="logo-link" @click.prevent="$emit('open-modal', 'null')">
          <img
            src="https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//laagain_logo.png"
            alt="Laagain Logo"
            class="app-logo"
          />
        </router-link>

          <button
           @click = "showNotifications=false"
            @click.prevent="$emit('open-modal', 'create-itinerary')"
            class="nav-btn text-dark text-center"
            title="Create New Itinerary"
          >
            <i class="bi-plus-lg"></i>
          </button>
        
        

        <div class="text-center" @click.prevent="$emit('open-modal', 'null')">
          <router-link to="/dashboard" class="text-dark text-center" title="Home">
            <i :class="[
              'bi',
              route.path === '/dashboard' ? 'bi-house-fill' : 'bi-house',
              'fs-4',
              'icon-btn',
              route.path !== '/dashboard' ? 'no-bg' : ''
            ]"></i>
          </router-link>

        </div>

        <router-link to="/explore" class="text-dark text-center" title="Explore" @click.prevent="$emit('open-modal', 'null')">
          <i :class="['bi', route.path === '/explore' ? 'bi-compass-fill' : 'bi-compass',   'fs-4',
  'icon-btn', route.path !== '/explore' ? 'no-bg' : '']"></i>
        </router-link>
      </div>

      <!-- Bottom Nav -->
      <div class="d-flex flex-column align-items-center gap-4 w-100">
          
        <div
          @click="handleNotificationClick"
          class="text-dark text-center"
          :class="{ 'is-active': showNotifications }"
          title="Notifications"
        >
          <i :class="[
              'bi',
              showNotifications ? 'bi-bell-fill' : 'bi-bell',
              'fs-4',
              'icon-btn'
            ]"
            :style="showNotifications ? 'background-color: #A8D4DE;' : 'background-color: transparent; box-shadow: none;'"
          />
        </div>

        <router-link to="/profile" class="text-center" title="Profile" @click.prevent="$emit('open-modal', 'null')">
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
      <router-link to="/dashboard" class="text-dark text-center" title="Home" @click.prevent="$emit('open-modal', 'null')">
        <i :class="['bi', route.path === '/dashboard' ? 'bi-house-fill' : 'bi-house', 'fs-4', 'no-bg']"></i>
      </router-link>

      <router-link to="/explore" class="text-dark text-center" title="Explore" @click.prevent="$emit('open-modal', 'null')">
        <i :class="['bi', route.path === '/explore' ? 'bi-compass-fill' : 'bi-compass', 'fs-4','no-bg']"></i>
      </router-link>

      <button
        @click.prevent="$emit('open-modal', 'create-itinerary')"
        class="nav-btn text-dark text-center"
        title="Create New Itinerary"
      >
        <i class="bi bi-plus-lg"></i>
      </button>


      <router-link to="/notifications" class="text-dark text-center" title="Notifications" @click.prevent="$emit('open-modal', 'null')">
        <i :class="[
          'bi',
          route.path === '/notifications' ? 'bi-bell-fill' : 'bi-bell',
          'fs-4',
          'no-bg'
        ]"></i>
      </router-link>

      <router-link to="/profile" class="text-center" title="Profile" @click.prevent="$emit('open-modal', 'null')">
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
@import "../assets/styles/sidenav.css"; /* Import external CSS file */
</style>