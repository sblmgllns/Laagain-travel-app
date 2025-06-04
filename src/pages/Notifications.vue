<template>
  <div class="container mt-4 sarabun-font">
    <!-- Back + Clear Button -->

    <div v-if="!isChild" class="notif-header">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="notification-title mb-0">Notifications</h2>
      </div>
    </div>

    <div class="d-flex justify-content-between align-items-right mb-3">
      <button
        class="btn btn-outline-custom btn-sm"
        @click="ClearModal = true"
      >
        Clear All
      </button>
    </div>
        
    <!-- Notification List -->
     <div v-if="!loading"> 
        <div class="notification-scroll-container">
            <ul class="list-group mt-3">
              <li 
                v-for="(notification, index) in notifications" 
                :key="index" 
                class="list-group-item notification-item"
              >
                <div class="notification-media">
                  <div class="circle-indicator" v-if="!notification.isRead" title="Unread"></div>
                  <img :src="notification.image" alt="avatar" class="profile-image" />
                </div>

                <div class="notification-content">
                  <div class="notification-text" v-html="notification.formattedMessage"></div>
                  <span class="time-badge">{{ notification.time }}</span>
                </div>
              </li>

              <li v-if="notifications.length === 0" class="list-group-item text-center text-muted notification-item">
                No notifications.
              </li>
            </ul>
        </div>
     </div>
     <div v-if="loading" class="loading-item">
        loading ...
     </div>
    
    <div v-if="ClearModal" class="modal fade show d-block" tabindex="-1" aria-labelledby="inviteModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          
          <div class="modal-header">
            <h5 class="modal-title" style="font-family: 'Sarabun', sans-serif; font-weight: 800; color: #03AED2; line-height: 1.04; letter-spacing: 0.04em;">
              Clear all notification?
            </h5>
          </div>

          <div class="modal-body" style="overflow-y: auto;">

            <p> Are you sure you want to delete all your notifications? This cannot be undone.</p>
            <button type="button" class="btn btn-secondary" @click="hideModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="clearAll">Yes, Clear All</button>            
          </div>
          <!-- Sticky Footer with Yellow Button -->
          
        </div>
      </div>
    </div>

        <!-- Modal Backdrop -->
    <div v-if="ClearModal" class="modal-backdrop fade show" @click="hideModal"></div>
    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from "../supabase";
import { formatDistanceToNow } from 'date-fns'

// REFS
const notifications = ref([])
const user = ref(null)
const userUsername = ref('')
const userFullname = ref('')
const userProfilePic = ref('')
const userId = ref('')
const userEmail = ref('')
const ClearModal = ref(false)
const isChild = ref(true)
const loading = ref(true)


const fetchUserProfile = async () => {
  const { data: sessionData } = await supabase.auth.getSession()
  user.value = sessionData?.session?.user

  if (user.value) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name, username, profile_pic_url, email')
      .eq('id', user.value.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error.message)
    } else {
      userId.value = user.value.id
      userEmail.value = profile.email
      userFullname.value = profile.full_name
      userUsername.value = profile.username
      userProfilePic.value = profile.profile_pic_url ||
        'https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/profile-pictures/default_profpic.jpg'
    }
  } else {
    console.error('User not found in session.')
  }
}

const fetchNotifications = async () => {
  const {
    data: { user: currentUser }
  } = await supabase.auth.getUser()

  if (!currentUser) {
    console.error("User not found")
    return
  }

  user.value = currentUser

  const { data, error } = await supabase
    .from('notifications')
    .select(`
        message,
        image_url,
        itinerary_name,
        created_at,
        sender_id,
        is_read,
        profiles:profiles!notifications_sender_id_fkey(username)
      `)
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false })

  if (error) {
    loading.value = false
    console.error('Error fetching notifications:', error)
    return
  }

  notifications.value = data.map(item => {
    const senderUsername = item.profiles?.username || 'COUNTDOWN:'
    const itineraryName = item.itinerary_name || 'Unnamed Trip'
    const rawMessage = item.message || ''

    const cleanedMessage = rawMessage
      .replace(new RegExp(item.profiles?.username, 'i'), '')
      .replace(new RegExp(`"${itineraryName}"`, 'i'), '')
      .trim()
      .replace(/\s+/g, ' ')

    const formattedMessage = `<strong>${senderUsername}</strong> ${cleanedMessage} <strong>"${itineraryName}"</strong>`

    return {
      sender: senderUsername,
      message: rawMessage,
      itinerary: itineraryName,
      image: item.image_url || "https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/profile-pictures/default_profpic.jpg",
      time: formatDistanceToNow(new Date(item.created_at), { addSuffix: true }),
      formattedMessage,
      isRead: item.is_read
    }
  })
  loading.value = false
}

const clearAll = async () => {
  if (!user.value) return

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.value.id)

  if (error) {
    console.error('Failed to clear notifications:', error)
    return
  }

  notifications.value = []
  ClearModal.value = false
}

const markAllAsRead = async () => {
  if (!user.value) return

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.value.id)
    .eq('is_read', false)

  if (error) {
    console.error('Failed to mark all as read:', error)
    return
  }

  notifications.value = notifications.value.map(n => ({
    ...n,
    isRead: true
  }))
}

const hideModal = () => {
  ClearModal.value = false
}

onMounted(async () => {
  await fetchUserProfile()
  await fetchNotifications()
  await markAllAsRead()
})
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sarabun&display=swap');

.sarabun-font {
  font-family: 'Sarabun', sans-serif;
}

.btn-outline-custom {
  color: #089dcf;
  border-color: #089dcf;
}
.btn-outline-custom:hover {
  background-color: #089dcf;
  color: white;
}

.notification-title {
  color: #089dcf;
  font-weight: bold;
}

.circle-indicator {
  width: 10px;
  height: 10px;
  background-color: #ffc107;
  border-radius: 50%;
  flex-shrink: 0;
  margin-right: 8px;
  margin-top: 4px;
}

.profile-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
  flex-shrink: 0;
}

.notification-item {
  display: flex;
  min-width: auto;
  align-items: center;
  gap: 12px;
}

.notification-media {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.notification-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.notification-text {
  white-space: normal;
  word-wrap: break-word;
  text-align: justify;
  font-size: 0.95rem;
}

.time-badge {
  font-size: 0.75rem;
  color: #6c757d;
  background-color: #f1f1f1;
  border-radius: 12px;
  padding: 2px 8px;
  font-weight: 500;
  margin-top: 4px;
  width: fit-content;
}

.back-button {
  width: 40px;
  height: 40px;
  border: 2px solid #089dcf;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #e6f6fb;
}

.back-icon {
  font-size: 20px;
  color: #089dcf;
  transform: rotate(180deg);
}

/* Responsive styles */
@media (max-width: 600px) {
  .profile-image {
    width: 36px;
    height: 36px;
  }

  .notification-text {
    font-size: 0.9rem;
  }

  .time-badge {
    font-size: 0.7rem;
    padding: 2px 6px;
  }
  .notification-scroll-container, .loading-item {
      max-height: 750px !important; 
      min-width: 200px !important;
  }   


}

.notification-scroll-container {
  max-height: 600px; /* adjust as needed */
  min-width: 400px;
  border-radius: 0.375rem;
}

/* Optional: smoother scroll */
.notification-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.notification-scroll-container::-webkit-scrollbar-thumb {
  background-color: #c0c0c0;
  border-radius: 10px;
}
.loading-item{
 max-height: 600px; /* adjust as needed */
 min-height: 600px;
 min-width: 400px; 
 align-items: center ;
}

</style>

