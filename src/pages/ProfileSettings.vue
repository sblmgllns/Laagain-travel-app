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
          <div class="d-flex justify-content-between align-items-center mt-3 btn btn-light">
            <span>Two-Factor Authentication</span>
            <i class="bi bi-chevron-right"></i>
          </div>
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
  
<script>
  import { supabase } from "../supabase";
import DeactivateAccount from "./DeactivateAccount.vue";

  export default {
    data() {
      return {
        user: null,
        profilePic: "",
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

        if (!error) {
          this.fullname = profile.full_name;
          this.username = profile.username;
          this.profilePic = profile.profile_pic_url || "default_profile_pic.jpg";
        }
      }
    },
    methods: {
      async saveChanges() {
        await supabase.from("profiles").update({ full_name: this.fullname, username: this.username }).eq("id", this.user.id);
        this.editMode = false;
      },
      triggerFileUpload() {
        this.$refs.fileInput.click();
      },
      async uploadImage(event) {
        const file = event.target.files[0];
        if (!file) return;

        const filePath = `profile-pictures/${this.user.id}-${file.name}`;
        await supabase.storage.from("profile-pictures").upload(filePath, file, { upsert: true });
        this.profilePic = `${supabase.storage.from("profile-pictures").getPublicUrl(filePath).data.publicUrl}`;
        await supabase.from("profiles").update({ profile_pic_url: this.profilePic }).eq("id", this.user.id);
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
