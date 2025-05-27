<template>
  <div class="container-fluid w-100">
    <!-- Navigation bar sa taas -->
    <nav class="navbar navbar-light bg-light d-flex align-items-center">
      <i class="bi bi-chevron-left fs-3" @click="$router.go(-1)" style="cursor: pointer;"></i>
      <a class="navbar-brand mx-auto">Profile Settings</a>
    </nav>

    <div class="card w-100 rounded-1 text-center mt-3">
      <!-- Div for Profile settings and the edit pencil -->
      <div class="navbar navbar-light d-flex align-items-center">
        <span>
          <h5 class="mx-auto"><strong>Personal Details</strong></h5>
        </span>
        <span>
          <i class="bi bi-pencil fs-3" @click="editMode = !editMode" style="cursor: pointer;"></i>
        </span>
      </div>

      <!-- Profile picture upload -->
      <input type="file" ref="fileInput" @change="uploadImage" style="display: none" />
      <img :src="profilePic" alt="Profile Picture" class="profile-pic mx-auto" @click="triggerFileUpload" style="cursor: pointer;" />
      <p class="text-primary mt-2" style="cursor: pointer;" @click="triggerFileUpload">Change Photo</p>
  
      <!-- Name and username -->
      <div class="form-group">
          <div class="d-flex justify-content-between">
              <span class="fw-bold">Name</span>
              <span v-if="editMode">
                  <input v-model="fullname" class="form-control" />
              </span>
              <span v-else>{{ fullname }}</span>
          </div>

          <div class="d-flex justify-content-between mt-2">
              <span class="fw-bold">Username</span>
              <span v-if="editMode">
                  <input v-model="username" class="form-control" />
              </span>
              <span v-else>{{ username }}</span>
          </div>
      </div>

      <button v-if="editMode" @click="saveChanges" class="btn btn-primary mt-3">Save Changes</button>

      <hr style="border: 1px solid #ddd; margin: 10px 0;">

      <!-- Password and security section -->
      <div class="mt-4">
        <h5 class="text-start"><strong>Password and Security</strong></h5>
          <router-link to="/reset-password" class="d-flex justify-content-between align-items-center mt-3 btn btn-light"> 
                    <span>Change Password</span>
                    <i class="bi bi-chevron-right"></i>
          </router-link> 
      </div>

      <hr style="border: 1px solid #ddd; margin: 10px 0;">
      
      <!-- Manage account section -->
      <div class="mt-4">
        <h5 class="text-start"><strong>Manage Account</strong></h5>
        <router-link to="/deactivate-account" class="d-flex justify-content-between align-items-center mt-3 btn btn-light">
          <span>Deactivate Account</span>
          <i class="bi bi-chevron-right"></i>
        </router-link>

        <div @click="DeleteAccount" class="d-flex justify-content-between align-items-center mt-3 btn btn-light">
            <span>Delete Account</span>
            <i class="bi bi-chevron-right"></i>
        </div>

      </div>

      <hr style="border: 1px solid #ddd; margin: 10px 0;">
      <div class="mt-4" v-if="!editMode">
        <button @click="logout" class="btn btn-danger w-100">Logout</button>
      </div>
    </div>
  </div>
</template>
  
//should add profile pic delete option
<script>
import DeactivateAccount from "./DeactivateAccount.vue";
import { supabase } from "../supabase";

export default {
  data() {
    return {
      user: null,
      profilePic: "default_profile_pic.jpg", // Default image
      username: "",
      fullname: "",
      editMode: false,
    };
  },
  async mounted() {
    const { data: sessionData } = await supabase.auth.getSession();
    this.user = sessionData?.session?.user;

    if (this.user) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, username, profile_pic_url")
        .eq("id", this.user.id)
        .single();

      if (!error && profile) {
        this.fullname = profile.full_name;
        this.username = profile.username;
        this.profilePic = profile.profile_pic_url || "default_profile_pic.jpg";
      } else {
        console.error("Error fetching profile:", error);
      }
    }
  },
  methods: {
    timeAgo(date) {
      const diff = (Date.now() - new Date(date)) / 1000;
      if (diff < 60) return "just now";
      if (diff < 3600) return Math.floor(diff / 60) + " minutes ago";
      if (diff < 86400) return Math.floor(diff / 3600) + " hours ago";
      return Math.floor(diff / 86400) + " days ago";
    },
    async saveChanges() {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: this.fullname, username: this.username })
        .eq("id", this.user.id);
      if (error) {
        console.error("Error updating profile:", error);
      } else {
        this.editMode = false;
      }
    },

    triggerFileUpload() {
      this.$refs.fileInput.click();
    },

    async uploadImage(event) {
      const file = event.target.files[0];
      if (!file) return;

      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        console.error("Invalid file type. Please upload a JPG or PNG.");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `profile-pictures/${this.user.id}-${Date.now()}.${fileExt}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        console.error("Error uploading image:", uploadError.message);
        return;
      }

      // Get Public URL
      const { data } = supabase.storage.from("profile-pictures").getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;

      if (!publicUrl) {
        console.error("Failed to retrieve public URL.");
        return;
      }

      // Update profile in the database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_pic_url: publicUrl })
        .eq("id", this.user.id);

      if (updateError) {
        console.error("Error updating profile picture URL:", updateError.message);
        return;
      }

      console.log("Profile picture updated successfully!");

      // Wait before fetching updated profile (to avoid stale cache)
      setTimeout(async () => {
        await this.fetchUserProfile();
        this.$forceUpdate(); // Ensure Vue re-renders
      }, 100); // Delay of 500ms
    },

    
  async fetchUserProfile() {
    if (!this.user || !this.user.id) {
      console.warn("User ID is missing.");
      return;
    }

    console.log("Fetching profile for user:", this.user.id); // Debugging log

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("full_name, username, profile_pic_url")
      .eq("id", this.user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    if (profile) {
      // User has a profile, update the UI
      this.fullname = profile.full_name;
      this.username = profile.username;
      this.profilePic = profile.profile_pic_url || "https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/profile-pictures//default_profpic.jpg";
    } else {
      console.warn("No profile found for this user. Creating one...");

      // Auto-create a profile if it doesn’t exist
      const { error: insertError } = await supabase.from("profiles").insert([
        {
          id: this.user.id,
          full_name: this.user.user_metadata?.full_name || "New User",
          username: this.user.user_metadata?.username || "user" + Date.now(),
          profile_pic_url: "https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/profile-pictures//default_profpic.jpg",
        },
      ]);

      if (insertError) {
        console.error("Error creating profile:", insertError);
        return;
      }

      console.log("Profile created successfully!");
      this.fetchUserProfile(); // 🔄 Fetch the new profile after creating it
    }
  },
    async logout() {
      await supabase.auth.signOut();
      this.$router.push("/login");
    },

    async DeleteAccount() {
      const { data: user, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error fetching user:", userError?.message);
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ deleted: true })
        .eq("id", user.user.id);

      if (error) {
        console.error("Error deleting account:", error.message);
        return;
      }

      console.log("Account marked as deleted.");
      this.$router.push("/login");
    },
  },
};

</script>

<style scoped>
.profile-pic {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
}
</style>