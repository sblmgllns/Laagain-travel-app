<template>
  <div class="container">

    <!-- Main Create Pin Section -->
    <div class="create-pin">
            
      <!-- Form Section -->
      <div class="form-section">        
        

        <form @submit.prevent="saveTrip" class="form-fields">

          <!-- Image Section -->
          <div class="image-section">
            <div>
              <img :src="coverImage" id="displayedCover" alt="Cover" class="image-preview" />
              <input type="file" id="coverImage" @change="handleImageUpload" class="field-input" />
              <transition name="fade">
                <p v-if="imageError" class="image-error">{{ imageError }}</p>
              </transition>
            </div>
          </div>

          <!-- Trip Name -->
          <div class="field">
            <label>Trip Name</label>
            <input type="text" v-model="tripName" placeholder="Enter trip name" required />
          </div>

          <!-- Place -->
          <div class="field">
            <label>Place</label>
            <input type="text" v-model="place" placeholder="Enter place" required />
          </div>

          <div class="field date-range">
            <!-- Start Date -->
            <div class="date-input">
              <label>Start Date</label>
              <input type="date" v-model="startDate" :min="today" required />
            </div>

            <!-- End Date -->
            <div class="date-input">
              <label>End Date</label>
              <input type="date" v-model="endDate" :min="startDate || today" required />
            </div>
          </div>

          
          <!-- Trip Members -->
          <div class="field">
            <label>Trip Members</label>
            <input
              type="text"
              v-model="tripMembers"
              placeholder="Add trip members (comma-separated)"
            />
          </div>

          <!-- Buttons -->
          <div class="field d-flex justify-content-between">
            <button
              @click="cancel"
              class="cancel-button"
            >
              Cancel
            </button>
            <button type="submit" class="publish-button">
              Create
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { supabase } from "../supabase";
import { useRouter } from 'vue-router'

const emit = defineEmits(['close'])

const router = useRouter()

// ✅ Reactive state
const user = ref(null)
const tripName = ref("")
const place = ref("")
const startDate = ref("")
const endDate = ref("")
const tripMembersInput = ref("")
const tripMembers = ref([])
const privacy = ref("")
const coverImage = ref(null)
const errorMessage = ref("")
const today = new Date().toISOString().split('T')[0]
const uploadingImage = ref(false)
const imageError = ref("")
let errorTimeout = null



onMounted(async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error("Error fetching session:", sessionError.message);
    return;
  }

  const currentUser = sessionData?.session?.user;
  if (!currentUser) {
    console.error("User not found in session.");
    return;
  }

  //console.log(currentUser)
  user.value = currentUser;
})
function cancel() {
  emit('close')
}

async function handleImageUpload(event) {
  uploadingImage.value = true

  const file = event.target.files[0]
  if (!file) return

  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"]
  if (!allowedTypes.includes(file.type)) {
    console.error("Invalid file type. Please upload a JPG or PNG.")
    imageError.value = "Invalid file type. Only JPG and PNG images are allowed."
    if (errorTimeout) clearTimeout(errorTimeout)
    // Set timeout to clear the error after 3 seconds
    errorTimeout = setTimeout(() => {
      imageError.value = ""
    }, 3000)

    return
  }
  else{
    imageError.value = ""
  }


  const fileExt = file.name.split(".").pop()
  const filePath = `itinerary-assets/${user.value.id}-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from("itinerary-assets")
    .upload(filePath, file, { upsert: true, contentType: file.type })

  uploadingImage.value = false

  if (uploadError) {
    console.error("Error uploading image:", uploadError.message)
    return
  }

  const { data } = supabase.storage.from("itinerary-assets").getPublicUrl(filePath)
  coverImage.value = data?.publicUrl ?? null

  if (!coverImage.value) {
    console.error("Failed to retrieve public URL.")
    return
  }

  //console.log("Cover Image uploaded successfully!")
}

async function saveTrip() {

  if (uploadingImage.value) {
    alert("Please wait until the image is uploaded.")
    return
  }

  if (new Date(startDate.value) > new Date(endDate.value)) {
    alert("Invalid Dates!")
    return
  }

  const { data, error } = await supabase.from("itineraries").insert([{
    name: tripName.value,
    owner_id: user.value.id,
    place: place.value,
    start_date: startDate.value,
    end_date: endDate.value,
    cover_pic_url: coverImage.value,
    privacy: privacy.value,
  }]).select("*")

  if (error) {
    errorMessage.value = error.message
    console.error("Error saving trip:", error.message)
    return
  }

  const tripId = data && data.length > 0 ? data[0].id : null
  if (!tripId) {
    console.error("Failed to retrieve trip ID.")
    return
  }

  const membersArray = tripMembersInput.value.split(",").map((email) => email.trim()).filter(Boolean)
  let allInvitesSent = true
  const validInvites = []

  for (const email of membersArray) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      alert(`"${email}" is not a valid email address.`)
      allInvitesSent = false
      continue
    }

    if (email === user.value.email) {
      alert("You cannot invite yourself.")
      allInvitesSent = false
      continue
    }

    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)
      .single()

    if (userError || !userData) {
      alert(`The email ${email} is not registered.`)
      allInvitesSent = false
      continue
    }

    const { error: inviteError } = await supabase.from("trip_invites").insert([{
      trip_id: tripId,
      invited_email: email,
      inviter_id: user.value.id,
      status: "pending",
      time_stamp: new Date().toISOString(),
    }])

    if (inviteError) {
      console.error(`Error inviting ${email}:`, inviteError.message)
      allInvitesSent = false
    } else {
      validInvites.push({ trip_id: tripId, invited_email: email })
    }
  }

  if (allInvitesSent && validInvites.length > 0) {
    const { data: senderProfile, error: senderError } = await supabase
      .from("profiles")
      .select("username, profile_pic_url")
      .eq("id", user.value.id)
      .single()

    if (!senderProfile || senderError) {
      console.error("Could not fetch sender profile")
    } else {
      const notificationsPayload = []

      for (const invite of validInvites) {
        const { data: invitedUser, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", invite.invited_email)
          .single()

        if (invitedUser && !profileError) {
          notificationsPayload.push({
            user_id: invitedUser.id,
            type: "invite",
            message: `${senderProfile.username} invited you to join the itinerary "${tripName.value}"`,
            itinerary_id: invite.trip_id,
            sender_id: user.value.id,
            image_url: senderProfile.profile_pic_url,
            itinerary_name: tripName.value,
            created_at: new Date().toISOString(),
            is_read: false,
          })
        }
      }

      if (notificationsPayload.length > 0) {
        const { error: notificationError } = await supabase
          .from("notifications")
          .insert(notificationsPayload)

        if (notificationError) {
          console.error("Error inserting notifications:", notificationError.message)
        } else {
          //console.log("Notifications sent successfully.")
        }
      }
    }
  }

  router.push({ path: "/edit-itinerary", query: { id: tripId } })
}

</script>


<style scoped>
@import "../assets/styles/newItinerary.css"; 

</style>
