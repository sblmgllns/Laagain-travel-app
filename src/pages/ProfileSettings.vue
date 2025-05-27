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
          <button @click="showLogoutConfirm=true">Logout</button>
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
            <div @click="showPasswordModal = true" class="d-flex justify-content-between align-items-center mt-3 btn btn-light"> 
              <span>Change Password</span>
              <i class="bi bi-chevron-right"></i>
            </div>
          </div>
        </div>

        <div v-if="currentTab === 'account'">
          <div class="mt-4">
            <h5 class="text-start"><strong>Manage Account</strong></h5>
            <router-link to="/deactivate-account" class="d-flex justify-content-between align-items-center mt-3 btn btn-light">
              <span>Deactivate Account</span>
              <i class="bi bi-chevron-right"></i>
            </router-link>

            <div @click="showDeleteConfirm=true" class="d-flex justify-content-between align-items-center mt-3 btn btn-danger w-100">
              <span>Delete Account</span>
              <i class="bi bi-chevron-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- modals sections -->
    <div v-if="showMobileMenu" class="overlay" @click="showMobileMenu = false"></div>

    <div v-if="showLogoutConfirm" class="modal-overlay" @click.self="showLogoutConfirm = false">
      <div class="modal-content">
        <h5>Are you sure you want to logout?</h5>
        <div class="d-flex justify-content-end gap-2 mt-3">
          <button class="btn btn-secondary" @click="showLogoutConfirm = false">Cancel</button>
          <button class="btn btn-danger" @click="confirmLogout">Yes, Logout</button>
        </div>
      </div>
    </div>

      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="modal-content">
          <h5>Are you sure you want to Delete Account?</h5>
          <form @submit.prevent="confirmDelete">
            <div class="mb-3">
              <label class="form-label">Input Password</label>
              <input type="password" v-model="confirmPassword" class="form-control" required />
            </div>

            <div v-if="errorMessage" class="text-danger small mb-2">{{ errorMessage }}</div>
            <div v-if="successMessage" class="text-success small mb-2">{{ successMessage }}</div>

            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" @click="showDeleteConfirm = false">Cancel</button>
              <button type="submit" class="btn btn-danger">Yes, Delete Account</button>
            </div>
          </form>
        </div>
      </div>


    <div v-if="showPasswordModal" class="modal-overlay" @click.self="showPasswordModal = false">
      <div class="modal-content">
        <h5>Reset Password</h5>
        <form @submit.prevent="submitNewPassword">
          <div class="mb-3">
            <label class="form-label">New Password</label>
            <input type="password" v-model="newPassword" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Confirm Password</label>
            <input type="password" v-model="confirmPassword" class="form-control" required />
          </div>

          <div v-if="errorMessage" class="text-danger small mb-2">{{ errorMessage }}</div>
          <div v-if="successMessage" class="text-success small mb-2">{{ successMessage }}</div>

          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary" @click="showPasswordModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Confirm</button>
          </div>
        </form>
      </div>
    </div>



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
      showLogoutConfirm: false,
      showPasswordModal: false,
      newPassword: "",
      confirmPassword: "",
      successMessage: "",
      errorMessage: "",
      showDeleteConfirm: false,
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
    confirmLogout() {
      this.showLogoutConfirm = false;
      this.logout();
    },
    async confirmDelete() {
      this.errorMessage = '';
      this.successMessage = '';

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        this.errorMessage = "Unable to get current user.";
        return;
      }

      const user = userData.user;

      // Re-authenticate with password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: this.confirmPassword,
      });

      if (authError) {
        this.errorMessage = "Incorrect password. Please try again.";
        return;
      }

      this.successMessage = "Password confirmed. Deleting account...";

      await this.DeleteAccount();

      // Optional: Clear password field
      this.confirmPassword = '';
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
      try {
        // Step 1: Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        if (userError || !userId) {
          this.errorMessage = "User not found or not logged in.";
          return;
        }

        if (!userData?.user?.email) {
          console.error("User email not found.");
          return;
        }
        const userEmail = userData.user.email;

        // Step 2: Soft delete the user in Profile (case-sensitive table/column names)
        const { error: updateError } = await supabase
          .from("profiles") // case-sensitive table
          .update({ deleted: true })
          .eq("id", userId); // case-sensitive column

        if (updateError) throw new Error("Failed to mark account as deleted.");

        // Step 3: Delete user-related data

        // Delete direct comments
        const { error: commentsError } = await supabase
          .from("comments")
          .delete()
          .eq("commenter_id", userId);
        if (commentsError) throw new Error("Failed to delete comments.");

        // Delete direct votes
        const { error: votesError } = await supabase
          .from("votes")
          .delete()
          .eq("user_id", userId);
        if (votesError) throw new Error("Failed to delete votes.");

        // Remove from itinerary membership
        const { error: membersError } = await supabase
          .from("itinerary_members")
          .delete()
          .eq("user_id", userId);
        if (membersError) throw new Error("Failed to remove itinerary memberships.");

        // Remove trip invites to user
        const { error: invitesError } = await supabase
          .from("trip_invites")
          .delete()
          .eq("invited_email", userEmail);
        if (invitesError) throw new Error("Failed to delete trip invites.");

        // Step 4: Get itineraries owned by this user
        const { data: itineraries, error: fetchError } = await supabase
          .from("itineraries")
          .select("id")
          .eq("owner_id", userId);
        if (fetchError) throw new Error("Failed to fetch itineraries.");

        const itineraryIds = itineraries?.map(i => i.id) || [];
        console.log("Number of itinerary IDs:", itineraryIds.length);
        if (itineraryIds.length) {
          for (const itineraryId of itineraryIds) {

            // Step 1: Get activities for this itinerary
            const { data: activities, error: fetchActivitiesError } = await supabase
              .from("activities")
              .select("id")
              .eq("itinerary_id", itineraryId);

            if (fetchActivitiesError) {
              console.error(`Failed to fetch activities for itinerary ${itineraryId}:`, fetchActivitiesError);
              throw new Error("Failed to fetch activities.");
            }

            const activityIds = activities?.map(a => a.id) || [];

            // Step 2: Delete comments linked to those activities
            if (activityIds.length) {
              const { error: commentsError } = await supabase
                .from("comments")
                .delete()
                .in("activity_id", activityIds);

              if (commentsError) {
                console.error(`Failed to delete comments for activities in itinerary ${itineraryId}:`, commentsError);
                throw new Error("Failed to delete comments for itinerary.");
              }
            }

            // Delete votes
            const { error: votesError } = await supabase
              .from("votes")
              .delete()
              .eq("itinerary_id", itineraryId);
            if (votesError) {
              console.error(`Failed to delete votes for itinerary ${itineraryId}:`, votesError);
              throw new Error("Failed to delete votes in itineraries.");
            }

            // Delete activities
            const { error: delActivities } = await supabase
              .from("activities")
              .delete()
              .eq("itinerary_id", itineraryId);
            if (delActivities) {
              console.error(`Failed to delete activities for itinerary ${itineraryId}:`, delActivities);
              throw new Error("Failed to delete activities.");
            }

            // Delete potential activities
            const { error: delPotential } = await supabase
              .from("potential_activities")
              .delete()
              .eq("itinerary_id", itineraryId);
            if (delPotential) {
              console.error(`Failed to delete potential activities for itinerary ${itineraryId}:`, delPotential);
              throw new Error("Failed to delete potential activities.");
            }

            // Delete itinerary members
            const { error: delMembers } = await supabase
              .from("itinerary_members")
              .delete()
              .eq("itinerary_id", itineraryId);
            if (delMembers) {
              console.error(`Failed to delete itinerary members for itinerary ${itineraryId}:`, delMembers);
              throw new Error("Failed to delete itinerary members.");
            }

            // Delete trip invites
            const { error: delTripInvites } = await supabase
              .from("trip_invites")
              .delete()
              .eq("trip_id", itineraryId);
            if (delTripInvites) {
              console.error(`Failed to delete trip invites for itinerary ${itineraryId}:`, delTripInvites);
              throw new Error("Failed to delete trip invites.");
            }

            // Finally, delete the itinerary itself
            const { error: delItineraries } = await supabase
              .from("itineraries")
              .delete()
              .eq("id", itineraryId);
            if (delItineraries) {
              console.error(`Failed to delete itinerary ${itineraryId}:`, delItineraries);
              throw new Error("Failed to delete itineraries.");
            }
          }
        }

        console.log("Account marked as deleted and all related data cleaned.");
        this.logout();

      } catch (err) {
        console.error("DeleteAccount Error:", err.message);
        this.errorMessage = err.message || "Something went wrong while deleting the account.";
      }
    },
    async submitNewPassword() {
      this.errorMessage = "";
      this.successMessage = "";

      if (this.newPassword !== this.confirmPassword) {
        this.errorMessage = "Passwords do not match.";
        return;
      }

      try {
        const { error } = await supabase.auth.updateUser({
          password: this.newPassword,
        });

        if (error) {
          this.errorMessage = error.message;
        } else {
          this.successMessage = "Password updated successfully.";
          setTimeout(() => {
            this.showPasswordModal = false;
            this.newPassword = "";
            this.confirmPassword = "";
          }, 1500);
          confirmLogout()
        }
      } catch (err) {
        this.errorMessage = "An unexpected error occurred. Please try again.";
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
  position: sticky;

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
  position: sticky;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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