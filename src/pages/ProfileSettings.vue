<template>
  <div>

    <!-- Mobile Header -->
    <div class="mobile-header d-md-none d-flex justify-content-between align-items-center p-3">
      <button @click="goBack" class="back-btn">
            <i class="bi bi-chevron-left" style="color: black;"></i>
          </button>
      <h2 class="nav-title m-0">Settings</h2>
      <button @click="showMobileMenu = !showMobileMenu" class="menu-toggle-btn">
        <i class="bi bi-list fs-3"></i>
      </button>
    </div>

    <div class="container">
      <!-- Left Navigation -->
      <div class="left-nav" :class="{ 'mobile-visible': showMobileMenu }">
        <!-- Header -->
        <div class="nav-header">
          <button @click="goBack" class="back-btn back-btn-responsive">
            <i class="bi bi-chevron-left" style="color: black;"></i>
          </button>
          <h2 class="nav-title">Settings</h2>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button @click="selectTab('personal')"
                  :class="{ active: currentTab === 'personal' }">Personal Details</button>
          <button @click="selectTab('security')"
                  :class="{ active: currentTab === 'security' }">Password and Security</button>
          <button @click="selectTab('account')"
                  :class="{ active: currentTab === 'account' }">Manage Account</button>
          <button @click="logout">Logout</button>
        </div>
      </div>

      <!-- Right Content -->
      <div class="right-content">
        <div v-if="currentTab === 'personal'">
          <div class="navbar navbar-light d-flex align-items-center">
            <span><h5 class="mx-auto"><strong>Personal Details</strong></h5></span>
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
        </div>

        <div v-if="currentTab === 'security'">
          <div class="mt-4">
            <h5 class="text-start"><strong>Password and Security</strong></h5>
            <router-link to="/reset-password" class="d-flex justify-content-between align-items-center mt-3 btn btn-light"> 
              <span>Change Password</span>
              <i class="bi bi-chevron-right"></i>
            </router-link>
          </div>
        </div>

        <div v-if="currentTab === 'account'">
          <div class="mt-4">
            <h5 class="text-start"><strong>Manage Account</strong></h5>
            <router-link to="/deactivate-account" class="d-flex justify-content-between align-items-center mt-3 btn btn-light">
              <span>Deactivate Account</span>
              <i class="bi bi-chevron-right"></i>
            </router-link>

            <div @click="DeleteAccount" class="d-flex justify-content-between align-items-center mt-3 btn btn-danger w-100">
              <span>Delete Account</span>
              <i class="bi bi-chevron-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showMobileMenu" class="overlay" @click="showMobileMenu = false"></div>

  </div>
</template>

<script>
import { supabase } from "../supabase";

export default {
  data() {
    return {
      currentTab: 'personal',
      user: null,
      profilePic: "default_profile_pic.jpg",
      username: "",
      fullname: "",
      editMode: false,
      showMobileMenu: false,
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
      }
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    selectTab(tab) {
      this.currentTab = tab;
      this.showMobileMenu = false; // Close mobile menu when tab is selected
    },
    async saveChanges() {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: this.fullname, username: this.username })
        .eq("id", this.user.id);
      if (!error) this.editMode = false;
    },
    triggerFileUpload() {
      this.$refs.fileInput.click();
    },
    async uploadImage(event) {
      const file = event.target.files[0];
      if (!file) return;

      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        console.error("Invalid file type.");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `profile-pictures/${this.user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        console.error("Upload failed:", uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("profile-pictures").getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ profile_pic_url: publicUrl })
        .eq("id", this.user.id);

      if (!updateError) {
        setTimeout(async () => {
          await this.fetchUserProfile();
          this.$forceUpdate();
        }, 100);
      }
    },
    async fetchUserProfile() {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, username, profile_pic_url")
        .eq("id", this.user.id)
        .maybeSingle();

      if (profile) {
        this.fullname = profile.full_name;
        this.username = profile.username;
        this.profilePic = profile.profile_pic_url || "default_profile_pic.jpg";
      }
    },
    async logout() {
      await supabase.auth.signOut();
      this.$router.replace("/login");
    },
    async DeleteAccount() {
      const { data: user } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ deleted: true })
        .eq("id", user.user.id);

      if (!error) {
        this.$router.push("/login");
      }
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  background-color: white;
  height: 100vh;
}

/* Mobile header */
.mobile-header {
  display: none;
  background-color: white;
  border-bottom: 1px solid #ccc;
}

.menu-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: black;
}

/* Left Nav */
.left-nav {
  width: 250px;
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease-in-out;

}

.left-nav.mobile-visible {
  display: flex;
  transform: translateX(0);

}



/* Sticky Header */
.nav-header {
  position: sticky;
  top: 0;
  background-color: white;
  padding: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ccc;
  z-index: 1;
}

.back-btn {
  margin-right: auto;
  font-size: 18px;
  background: none;
  border: none;
  cursor: pointer;
}

.nav-title {
  flex: 1;
  text-align: center;
  margin: 0;
  font-weight: bold;
}

/* Tab Buttons */
.tabs {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 8px;
}

.tabs button {
  padding: 8px 16px;
  font-weight: 600;
  color: gray;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
  text-align: left;
}

.tabs button:hover {
  background-color: #f0f0f0;
}

.tabs .active {
  background-color: #e0e0e0;
  font-weight: bold;
}

.tabs button.active:nth-child(1) {
  color: #2563eb;
}

.tabs button.active:nth-child(2) {
  color: #16a34a;
}

.tabs button.active:nth-child(3) {
  color: #7e22ce;
}

.tabs button:nth-child(4) {
  color: #dc2626;
}

.tabs button:nth-child(4):hover {
  color: #b91c1c;
}

/* Right Content */
.right-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.profile-pic {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
}

@media (max-width: 600px) {
   
  .container {
    flex-direction: column;
    height: auto;
  }

  .mobile-header {
    display: flex;
        display: flex;
    z-index: 1002;
  }

  .left-nav {
    display: flex;
    position: fixed;
    top: 88px; /* below the mobile h  eader */
    right: 0;
    left: auto;
    width: 250px;
    height: calc(100% - 60px);
    background-color: white;
    z-index: 1001;
    transform: translateX(100%); /* Hidden by default: off-screen to the right */
    transition: transform 0.3s ease-in-out;
    overflow-y: auto;
    border-left: 1px solid #ccc;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);

  }

  .left-nav.mobile-visible {
    transform: translateX(0); /* Slide in */
  }


  .right-content {
    padding: 16px;
  }
   
  .overlay {
    position: fixed;
    top: 60px;
    left: 0;
    width: calc(100% - 250px);
    height: calc(100% - 60px);
    background-color: rgba(0, 0, 0, 0);
    z-index: 1000;
      transition: transform 0.3s ease-in-out;

  }

  .nav-header{
    display: none !important;
  }

}
</style>
