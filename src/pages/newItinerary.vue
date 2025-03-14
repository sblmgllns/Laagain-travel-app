<template>
<div class="container-fluid d-flex justify-content-center align-items-center min-vh-100" id="maincontainer">
  <form @submit.prevent="saveTrip" class="trip-form">
    <!-- Cover Image -->
    <div class="text-center" id="coverPhotoContainer">
        <div class="cover-image-display"> <img :src="coverImage" alt="" class="image"> </div>
      <input type="file" id="coverImage" class="" @change="handleImageUpload">
    </div>

    <!-- Trip Name -->
    <div class="mb-3 inputG">
      <label class="form-label inputLabels">Trip Name</label>
      <div class="input-group w-100">
        <span class="input-group-text"><i class="bi bi-pencil"></i></span>
        <input type="text" v-model="tripName" class="form-control h-100" placeholder="Enter trip name" required>
      </div>
    </div>

    <!-- Place -->
    <div class="mb-3 inputG">
      <label class="form-label inputLabels">Place</label>
      <div class="input-group w-100">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input type="text" v-model="place" class="form-control h-100" placeholder="Enter place" required>
      </div>
    </div>

    <!-- Dates -->
    <div class="mb-3 inputG">
      <label class="form-label inputLabels">Start Date</label>
      <div class="input-group w-100">
        <span class="input-group-text"><i class="bi bi-calendar"></i></span>
        <input type="date" v-model="startDate" class="form-control h-100" required>
      </div>
    </div>

    <!-- Dates -->
    <div class="mb-3 inputG">
      <label class="form-label inputLabels">End Date</label>
      <div class="input-group w-100">
        <span class="input-group-text"><i class="bi bi-calendar"></i></span>
        <input type="date" v-model="endDate" class="form-control h-100" required>
      </div>
    </div>

    <!-- Trip Members -->
    <div class="mb-3 inputG">
      <label class="form-label inputLabels">Trip Members</label>
      <div class="input-group w-100">
        <span class="input-group-text"><i class="bi bi-person-plus"></i></span>
        <input type="email" v-model="tripMembers" class="form-control h-100" placeholder="Add trip members">
      </div>
    </div>

    <!-- Privacy -->
    <div class="privacy">
      <label class="form-label inputLabels" id="privacyLabel">Privacy</label>
      <div class="form-check">
        <input type="radio" id="private" v-model="privacy" value="private" class="form-check-input" checked>
        <label for="private" class="form-check-label">Private (including trip members)</label>
      </div>
      <div class="form-check">
        <input type="radio" id="public" v-model="privacy" value="public" class="form-check-input">
        <label for="public" class="form-check-label">Public</label>
      </div>
    </div>

    <!-- Buttons -->
    <div class="button-group">
      <button type="button" class="btn btn-warning" @click="cancel">Cancel</button>
      <button type="submit" class="btn btn-primary">Save Changes</button>
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
      tripMembers: "",
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

        if (new Date(this.startDate) >= new Date(this.endDate)){
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
        ]);
        console.log("done trying to insert");
        if (error) {
          this.errorMessage = error.message;
          console.error("Error saving trip:", error.message);
        } else {
          console.log("Trip saved successfully:", data);
          this.$router.push("/dashboard");
        }
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
