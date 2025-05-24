<template>
  <div class="container mt-4 sarabun-font">
    <!-- Back + Clear Button -->

    <div v-if="!isChild" class="notif-header">
      <!-- functions kineme -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="back-button" @click="$router.back()">
          <i class="bi bi-chevron-right back-icon"></i>
        </div>
        <button class="btn btn-outline-danger btn-sm" @click="showModal = true">Clear All</button>
      </div>
      <!-- Title -->
      <h2 class="notification-title">Notifications</h2>
    </div>

    <!-- Notification List -->
    <ul class="list-group mt-3">
      <li 
        v-for="(notification, index) in notifications" 
        :key="index" 
        class="list-group-item d-flex align-items-center"
      >
        <div 
          class="circle-indicator me-2" 
          v-if="!notification.isRead"
          title="Unread"
        ></div>

        <img :src="notification.image" alt="avatar" class="profile-image me-3" />
        <div class="me-auto notification-text text-truncate" v-html="notification.formattedMessage"></div>

        <span class="time-badge">{{ notification.time }}</span>
      </li>


      <li v-if="notifications.length === 0" class="list-group-item text-center text-muted">
        No notifications.
      </li>
    </ul>

    <!-- Modal -->
    <div class="modal fade" id="clearModal" tabindex="-1" ref="modalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Clear All Notifications</h5>
            <button type="button" class="btn-close" @click="hideModal"></button>
          </div>
          <div class="modal-body">
            Are you sure you want to delete all your notifications? This cannot be undone.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="hideModal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="clearAll">Yes, Clear All</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onUnmounted } from 'vue'
import { ref, onMounted, watch } from 'vue'
import { supabase } from "../supabase";
import { formatDistanceToNow } from 'date-fns'

// REFS
const notifications = ref([])
const showModal = ref(false)
const modalRef = ref()
const user = ref(null)
const userUsername = ref('')
const userFullname = ref('')
const userProfilePic = ref('')
const userId = ref('')
const userEmail = ref('')
let modalInstance = null
defineProps({
  isChild: {
    type: Boolean,
    default: false
  }
})

// Fetch profile
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
      userProfilePic.value =
        profile.profile_pic_url ||
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
    console.error('Error fetching notifications:', error)
    return
  }
  console.log(data);

  notifications.value = data.map(item => {
    const senderUsername = item.profiles?.username || 'COUNTDOWN:';
    const itineraryName = item.itinerary_name || 'Unnamed Trip';
    const rawMessage = item.message || '';

    const cleanedMessage = rawMessage
      .replace(new RegExp(item.profiles?.username, 'i'), '')
      .replace(new RegExp(`"${itineraryName}"`, 'i'), '')
      .trim()
      .replace(/\s+/g, ' ');

    const formattedMessage = `<strong>${senderUsername}</strong> ${cleanedMessage} <strong>"${itineraryName}"</strong>`;

    return {
      sender: senderUsername,
      message: rawMessage,
      itinerary: itineraryName,
      image: item.image_url || "https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/profile-pictures//default_profpic.jpg",
      time: formatDistanceToNow(new Date(item.created_at), { addSuffix: true }),
      formattedMessage,
      isRead: item.is_read // <--- Add this
    };
  });

}

const markAllAsRead = async () => {
  if (!user.value) return

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.value.id)
    .eq('is_read', false) // Only mark unread ones

  if (error) {
    console.error('Failed to mark all as read:', error)
    return
  }

  // Also update the local state to reflect change
  notifications.value = notifications.value.map(n => ({
    ...n,
    isRead: true
  }))
}

const insertUpcomingTripReminders = async () => {
console.log("user", user.value)
  if (!user.value) return
  
  const today = new Date()
  const tomorrow = new Date(today)
  const fiveDaysLater = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  fiveDaysLater.setDate(today.getDate() + 5)

  const reminders = []

  // 1. Trips where user is invited (via itinerary_members)
  const { data: invitedTrips, error: invitedError } = await supabase
    .from('itinerary_members')
    .select(`itineraries(id, name, start_date)`)
    .eq('user_id', userId.value)

  if (invitedError) {
    console.error("Error fetching invited trips:", invitedError)
    return
  }

  console.log("here")
  if (invitedTrips) {
    for (const entry of invitedTrips) {
      if (entry.itineraries) reminders.push(entry.itineraries)
    }
  }

  // 2. Trips the user owns
  const { data: ownedTrips, error: ownedError } = await supabase
    .from('itineraries')
    .select('id, name, start_date')
    .eq('owner_id', userId.value)

  if (ownedError) {
    console.error("Error fetching owned trips:", ownedError)
    return
  }

  if (ownedTrips) {
    for (const trip of ownedTrips) {
      reminders.push(trip)
    }
  }
  console.log("ownedtrips", ownedTrips)

  // 3. Insert reminder notifications
  for (const trip of reminders) {
    if (!trip.start_date) continue

    const startDate = new Date(trip.start_date) // assumes trip.start_date is an ISO string
    const today = new Date()

    // Set both to midnight
    startDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    const diffDays = Math.floor((startDate - today) / (1000 * 60 * 60 * 24))
    console.log("diffDays", diffDays)
    let message = null
    if (diffDays === 5) {
      message = `Just 5 days left until your trip to "${trip.name}"! 🎒 Time to get excited!`
    } else if (diffDays === 1) {
      message = `Your adventure to "${trip.name}" starts tomorrow! ✈️ Ready to go?`
      console.log("Tomorrow's trip:", trip.name)
    } else if (diffDays === 0) {
      message = `Today’s the day! 🌟 Your trip to "${trip.name}" begins now — safe travels!`
      console.log("Today's trip:", trip.name)
    }


    if (!message) continue

    // Avoid duplicates
    const { data: existing, error: existsError } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user.value.id)
      .eq('message', message)
      .eq('itinerary_name', trip.name)

    if (existsError) {
      console.error("Error checking existing reminders:", existsError)
      continue
    }

    if (existing && existing.length > 0) continue // Already reminded

    const { error: insertError } = await supabase
      .from('notifications')
      .insert([{
        user_id: user.value.id,
        sender_id: null,
        message,
        image_url: 'https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/notifications/reminder.jpg', // optional default image
        itinerary_name: trip.name,
        type: 'reminder',
        is_read: false
      }])

    if (insertError) {
      console.error("Failed to insert reminder:", insertError)
    } else {
      console.log("Reminder added:", message)
    }
  }
}

onMounted(async () => {
  const modalEl = modalRef.value
  if (modalEl && window.bootstrap?.Modal) {
    modalInstance = new window.bootstrap.Modal(modalEl)
  }

  await fetchUserProfile() 
  await insertUpcomingTripReminders()
  await fetchNotifications()
})

onUnmounted(() => {
  markAllAsRead()
})

watch(showModal, (val) => {
  if (val) modalInstance?.show()
})

const hideModal = () => {
  modalInstance?.hide()
  showModal.value = false
}

const clearAll = async () => {
  if (!user.value) return

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.value.id)

  if (error) {
    console.error('Error deleting notifications:', error)
    return
  }

  notifications.value = []
  hideModal()
}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sarabun&display=swap');

.sarabun-font {
  font-family: 'Sarabun', sans-serif;
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
  align-self: center;
}

.profile-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
}

.notification-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
}

.time-badge {
  font-size: 0.75rem;
  color: #6c757d;
  background-color: #f1f1f1;
  border-radius: 12px;
  padding: 2px 8px;
  font-weight: 500;
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
</style>
