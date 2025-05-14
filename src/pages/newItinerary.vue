<template>
<div class="container-fluid d-flex justify-content-center align-items-center min-vh-100 h-100" id="maincontainer">
  
  <form @submit.prevent="saveTrip" class="trip-form">
    <div class="form-title">NEW TRIP</div>
    <!-- Cover Image -->
    <div class="text-center" id="coverPhotoContainer">
      <div class="cover-image-display"> <img :src="coverImage" id="displayedCover" alt="" class="image"> </div>
      <input type="file" id="coverImage" @change="handleImageUpload">
    </div>

    <!-- Trip Name -->
    <div class="mb-3 inputG">
      <label class="form-label inputLabels">Trip Name</label>
      <div class="input-group w-100">
        <span class="input-group-text"><i class="bi bi-pencil"></i></span>
        <input type="text" v-model="tripName" class="formcontrol h-100" placeholder="Enter trip name" required>
      </div>
    </div>

    <!-- Place -->
    <div class="mb-3 inputG">
      <label class="form-label inputLabels">Place</label>
      <div class="input-group w-100">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input type="text" v-model="place" class="formcontrol h-100" placeholder="Enter place" required>
      </div>
    </div>

    <!-- Start Date -->
    <div class="mb-3 inputG">
      <label class="form-label inputLabels">Start Date</label>
      <div class="input-group w-100">
        <span class="input-group-text"><i class="bi bi-calendar"></i></span>
        <input type="date" v-model="startDate" class="formcontrol h-100" required>
      </div>
    </div>

    <!-- End Date -->
    <div class="mb-3 inputG">
      <label class="form-label inputLabels">End Date</label>
      <div class="input-group w-100">
        <span class="input-group-text"><i class="bi bi-calendar"></i></span>
        <input type="date" v-model="endDate" class="formcontrol h-100" required>
      </div>
    </div>

    <!-- Trip Members -->
    <div class="mb-3 inputG">
      <label class="form-label inputLabels">Trip Members</label>
      <div class="input-group w-100">
        <span class="input-group-text" @click="addMember">
          <i class="bi bi-person-plus"></i>
        </span>
        <input
          type="text"
          v-model="tripMembers"
          class="formcontrol h-100"
          placeholder="Add trip members"
        >
      </div>
    </div>


    <!-- Privacy -->
    <div class="privacy">
      <!-- <label class="form-label inputLabels" id="privacyLabel">Privacy</label> -->
      <div class="form-check">
        <input type="radio" id="private" v-model="privacy" value="private" class="form-check-input" checked>
        <label for="private" class="form-check-label">Private</label>
      </div>
      <div class="form-check">
        <input type="radio" id="public" v-model="privacy" value="public" class="form-check-input">
        <label for="public" class="form-check-label">Public</label>
      </div>
    </div>

    <!-- Buttons -->
    <div class="button-group">
      <button type="button" class="btn" id="cancelButton" @click="cancel">Cancel</button>
      <button type="submit" class="btn" id="saveChangesButton">Save Changes</button>
    </div>
  </form>
</div>
</template>

<script>
import { supabase } from "../supabase";

export default {
  data() {
    return {
      user: null,
      tripName: "",
      place: "",
      startDate: "",
      endDate: "",
      tripMembersInput: '', // Stores the input field value (current email to add)
      tripMembers: [], // Array to store the added members
      privacy: "",
      coverImage: null,
      errorMessage: "",
    };
  },
  async mounted(){
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
                console.error("Error fetching session:", sessionError.message);
                return;
            }

            const user = sessionData?.session?.user;
            if (!user) {
                console.error("User not found in session.");
                return;
            }
            else{
              console.log(user);
            }
            this.user = user;
  },

  methods: {
    async saveTrip() {
      // if (!this.tripName || !this.place || !this.endDate || this.startDate) {
      //   this.errorMessage = "Please fill in all required fields.";
      //   return;
      // }

        if (new Date(this.startDate) > new Date(this.endDate)){
          alert("Invalid Dates!");
          return;
        }
        const { data, error } = await supabase.from("itineraries").insert([
          {
            name: this.tripName,
            owner_id: this.user.id,
            place: this.place,
            start_date: this.startDate,
            end_date: this.endDate,
            cover_pic_url: this.coverImage,
            privacy: this.privacy,
          },
        ]). select("*");
        if (error) {
          this.errorMessage = error.message;
          console.error("Error saving trip:", error.message);
        } else {
          console.log("Trip saved successfully:", data);
        }
        // Get the trip ID from the inserted data
        const tripId = data && data.length > 0 ? data[0].id : null;
        if (!tripId) {
          console.error("Failed to retrieve trip ID.");
          return;
        } else {
          console.log("Trip ID Retrieved:", tripId);
        }

        // Send Invitations
        if (this.tripMembers && typeof this.tripMembers === 'string' && this.tripMembers.trim() !== "") {
          const membersArray = this.tripMembers.split(",").map((email) => email.trim());
          
          let allInvitesSent = true; // Flag to track if all invites are successfully sent
          let validInvites = [];

          for (const email of membersArray) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
              alert(`"${email}" is not a valid email address.`);
              allInvitesSent = false;
              continue; // Skip invalid emails
            }
            if (email) {
              // Check if the email matches the current user's email
              if (email === this.user.email) {
                alert("You cannot invite yourself.");
                allInvitesSent = false; // Set the flag to false because we skipped inviting this email
                continue; // Skip the rest of the loop if it's the user's own email
              }

              // Check if the email is registered in the users table
              const { data: userData, error: userError } = await supabase
                .from("profiles") // Assuming the registered users are in the "profiles" table
                .select("email")
                .eq("email", email)
                .single();

              if (userError || !userData) {
                // If the email is not registered or there is an error
                alert(`The email ${email} is not registered. Please invite a registered user.`);
                allInvitesSent = false; // Set the flag to false because we cannot invite an unregistered email
                continue; // Skip inviting this email
              }

              // Send the invitation if the email is valid and registered
              const { error: inviteError } = await supabase.from("trip_invites").insert([
                {
                  trip_id: tripId,
                  invited_email: email,
                  inviter_id: this.user.id,
                  status: "pending",
                  time_stamp: new Date().toISOString(),
                },
              ]);

              if (inviteError) {
                console.error(`Error inviting ${email}:`, inviteError.message);
                allInvitesSent = false; // Set the flag to false if there was an error
              } else {
                console.log(`Invitation sent to ${email}`);
                validInvites.push({
                  trip_id: tripId,
                  invited_email: email
                });

              }
            }
          }

        // Only redirect if all invitations were sent successfully
        if (allInvitesSent) {
          // Fetch sender's profile for username and profile picture
          const { data: senderProfile, error: senderError } = await supabase
            .from("profiles")
            .select("username, profile_pic_url")
            .eq("id", this.user.id)
            .single();

          if (senderError || !senderProfile) {
            console.error("Failed to fetch sender's profile data:", senderError?.message);
            alert("Invites were sent, but notifications may not have been fully created.");
            return;
          }

          const notificationsPayload = [];

          for (const invite of validInvites) {
            // Get the user ID of the invited person
            const { data: invitedUser, error: profileError } = await supabase
              .from("profiles")
              .select("id")
              .eq("email", invite.invited_email)
              .single();

            if (profileError || !invitedUser) {
              console.warn(`Could not find user ID for ${invite.invited_email}, skipping notification.`);
              continue;
            }

            notificationsPayload.push({
              user_id: invitedUser.id, // The invited user
              type: "invite",
              message: `${senderProfile.username} invited you to join the itinerary "${this.tripName}"`,
              itinerary_id: invite.trip_id,
              sender_id: this.user.id,
              image_url: senderProfile.profile_pic_url,
              itinerary_name: this.tripName,
              created_at: new Date().toISOString(),
              is_read: false,
            });
          }

          if (notificationsPayload.length > 0) {
            const { error: notificationError } = await supabase
              .from("notifications")
              .insert(notificationsPayload);

            if (notificationError) {
              console.error("Error inserting notifications:", notificationError.message);
            } else {
              console.log("Notifications sent successfully.");
            }
          }

          alert("Invites have been sent!"); // Show popup
          this.$router.push("/dashboard");
        } else {
          console.log("Some invitations were not sent due to errors or invalid emails.");
        }
      }
      this.$router.push("/dashboard");
    },
    
    async handleImageUpload(event) {
      this.coverImage = event.target.files[0];
      console.log("Selected file:", this.coverImage);
      
      const file = event.target.files[0];
      if (!file) return;

      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        console.error("Invalid file type. Please upload a JPG or PNG.");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `itinerary-assets/${this.user.id}-${Date.now()}.${fileExt}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from("itinerary-assets")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        console.error("Error uploading image:", uploadError.message);
        return;
      }

      // Get Public URL
      const { data } = supabase.storage.from("itinerary-assets").getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;

      if (!publicUrl) {
        console.error("Failed to retrieve public URL.");
        return;
      }
      else{
        this.coverImage = publicUrl;
      }

      console.log("Cover Image uploaded successfully!");
    },

    cancel() {
      this.$router.go(-1);
    },
  },
};

</script>

<style scoped>
@import "../assets/styles/newItinerary.css"; 

</style>
