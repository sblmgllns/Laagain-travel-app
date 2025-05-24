<template>
  <div class="container-fluid w-100y">
    
    <!-- Profile Header -->
    <div class="row">

      <!-- user profile details -->
      <div class="card w-100 rounded-1 position-relative">

        <router-link 
          to="/ProfileSettings" 
          class="nav-link position-absolute top-0 end-0 m-2"
        >
          <i class="bi bi-gear fs-4"></i>
        </router-link>

        <img :src="profilePic" alt="Profile Picture" class="profile-pic mx-auto" />
        <h1 class="mt-3">{{ fullname }}</h1>
        <h4 class="mt-0">@{{ username}}</h4>
        <p class="text-muted mx-auto rounded-3" id="tripCount">{{ trip }} Trips</p>

        
      <div v-if="trips.length">

          <div class="responsive-scroll-container">
            <div class="responsive-scroll-inner">
              <div class="card-grid" v-for="(task, index) in trips" :key="index">
                <div class="result-card h-100">
                      <span class="trip-menu" @click.stop="toggleMenu(task.id)">
                        <i class="bi bi-three-dots"></i>

                        <div v-if="showMenus[task.id]" class="menu-options">
                          <template v-if="task.ownerId == user.id">
                            <a href="#" @click.stop="deletePost(task.id, index, 'trips')">Delete</a>
                            <a @click.stop="openInviteModal(task)">Share</a>
                          </template>
                          <template v-else>
                            <a href="#" @click.stop="leaveTrip(task.id, index, 'trips')">Leave</a>
                          </template>
                        </div>
                      </span>
                      
                      <img :src="task.image || 'https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//default_trip_photo.jpeg'"  @click="navigateToEditItinerary(task.id)" class="card-img-top" />
                      
                      <div class="card-body">
                        <div class="card-name">
                          <!-- Title field -->
                          <input
                            type="text"
                            class="form-control-plaintext p-0 m-0"
                            :value="task.title"
                            readonly
                            style="font-weight: 600;"
                          />

                          <!-- Pencil icon -->
                          <span class="edit-icon ms-2">
                            <i class="bi bi-pencil-fill text-secondary"></i>
                          </span>

                          <!-- Underline on hover -->
                          <div class="underline-hover"></div>
                        </div>
              
                        <p class="category">
                          {{ task.content }} <span class="mx-1">●</span> {{ task.date }}
                        </p>

                        
                      </div>

                </div>

              </div>
            </div>
          </div>
      </div>
      <div v-else class="text-center w-100 my-4">
        <img
          src="https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//No%20Data.png"
          alt="No result"
          class="No-Result"
        />
        <p class="text-muted">No trips found.</p>
      </div>
      </div>


    </div>

    <div v-if="showInviteModal" class="modal fade show d-block" tabindex="-1" aria-labelledby="inviteModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content" style="height: 80vh; overflow: hidden;">
          <div class="modal-header">
            <h5 class="modal-title" style="font-family: 'Sarabun', sans-serif; font-weight: 800; color: #03AED2; line-height: 1.04; letter-spacing: 0.04em;">
              Invite your friends to {{ selectedItem?.title }}.
            </h5>
            <button type="button" class="btn-close" @click="closeInviteModal"></button>
          </div>
          <div class="modal-body" style="overflow-y: auto;">
            <!-- Colored Circles -->
            <div style="display: flex; justify-content: center; gap: 0px; align-items: center; margin-top: -20px">
              <!-- First Circle (left circle closer to center) -->
              <div style="width: 100px; height: 100px; border-radius: 50%; background-color: #FFC7E0; margin-right: -15px; z-index: 1;"></div>

              <!-- Second Circle (center circle) -->
              <div style="width: 100px; height: 100px; border-radius: 50%; background-color: #C8F1FF; margin-top: 30px;"></div>

              <!-- Third Circle (right circle moved closer to the left) -->
              <div style="width: 100px; height: 100px; border-radius: 50%; background-color: #FFC0B8; margin-left: -15px;"></div>
            </div>

            <!-- Orange Rectangular Element -->
            <div style="width: 90%; height: 50px; background-color: #FEEFAD; opacity: 0.39; border-radius: 15px; margin-top: 10px; margin-left: auto; margin-right: auto; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; z-index: -1;">
              <!-- Diagonal Link Sharing Icon -->
              <i class="bi bi-link" style="font-size: 27px; color: black; transform: rotate(-45deg);"></i>
              
              <!-- Link Text centered with Sarabun font -->
              <a href="https://join.laagain.travel/nameofitinerary" target="_blank" style="font-family: 'Sarabun', sans-serif; font-weight: 800; color: black; text-decoration: none; font-size: 13px;">
                https://join.laagain.travel/nameofitinerary
              </a>

              <!-- Clipboard Icon -->
              <div style="display: flex; gap: 10px;">
                <i class="bi bi-files" style="font-size: 24px; color: black;"></i>
              </div>
            </div>

            <!-- Gray Rectangular Element Below -->
            <div style="width: 95%; height: 50px; background-color: #EDE9E9; opacity: 1; border-radius: 5px; margin-top: 30px; margin-left: auto; margin-right: auto; display: flex; align-items: center; padding: 0 20px;">
              
              <!-- Person Icon on the Left -->
              <i class="bi bi-person" style="font-size: 24px; color: gray;"></i>

              <!-- Input Field -->
              <input type="text" v-model="tripMembers" placeholder="Allow your friends and family to plan your trip together"
                    style="border: none; background: transparent; font-family: 'Sarabun', sans-serif; font-weight: 800; color: #A8A6A6; font-size: 13px; margin-left: 20px; outline: none; flex: 1;">
            </div>

            <!-- Slider/Tab for Email/Username Switch -->
            <div style="width: 30%; height: 25px; background-color: #EDE9E9; opacity: 1; border-radius: 5px; margin-top: 15px; margin-left: auto; margin-right: auto; display: flex; justify-content: space-between; align-items: center; padding: 0 10px; position: relative;">
              <!-- Slider background -->
              <div
                style="position: absolute; top: 4px; height: 70%; background-color: white; border-radius: 3px; transition: all 0.3s ease; pointer-events: none;"
                :style="{ left: isEmailSelected ? '5%' : '50%', width: '46%' }"
              ></div>

              <!-- Email Tab -->
              <div @click="switchTab('email')" style="cursor: pointer; padding: 3px; width: 48%; text-align: center; z-index: 1; margin-bottom: 4px;">
                <span style="font-family: 'Sarabun', sans-serif; font-weight: 800; color: black; font-size: 10px;">email</span>
              </div>
              
              <!-- Username Tab -->
              <div @click="switchTab('username')" style="cursor: pointer; padding: 7px; width: 48%; text-align: center; margin-bottom: 4px; z-index: 1;">
                <span style="font-family: 'Sarabun', sans-serif; font-weight: 800; color: black; font-size: 10px;">username</span>
              </div>

            
            </div>

            <i
              v-if="ownerProfile.id === user.id"
              class="bi bi-pencil"
              @click="editField"
              style="position: absolute; right: 8px; font-size: 12px; cursor: pointer; z-index: 2; margin-right: 30px;"
              title="Edit"
            ></i>


            <div v-if="!loading" class="modal-body" style="overflow-y: auto;">
              <!-- Owner Info -->
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding: 0 20px;">
                <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                  <img :src="ownerProfile.picture" alt="Owner's Profile Picture"
                      style="flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%;">
                  <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    <span style="font-family: 'Sarabun', sans-serif; font-weight: 800; font-size: 12px; color: #000; display: block;">
                      {{ ownerProfile.name }}
                    </span>
                    <span style="font-family: 'Sarabun', sans-serif; font-size: 12px; color: #A8A6A6; display: block;">
                      @{{ ownerProfile.username }}
                    </span>
                  </div>
                </div>
                <span style="font-family: 'Sarabun', sans-serif; font-size: 14px; color: #03AED2; font-weight: 800;">
                  Owner
                </span>
              </div>
              <!-- Members -->
              <div v-for="member in members" :key="member.username"
                  style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding: 0 20px;">
                
                <!-- Left side (Profile + Name + Username) -->
                <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                  <img :src="member.profile_pic_url" alt="Member's Profile Picture"
                      style="flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%;">
                  <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    <span style="font-family: 'Sarabun', sans-serif; font-weight: 800; font-size: 12px; color: #000; display: block;">
                      {{ member.full_name }}
                    </span>
                    <span style="font-family: 'Sarabun', sans-serif; font-size: 12px; color: #A8A6A6; display: block;">
                      @{{ member.username }}
                    </span>
                  </div>
                </div>

                <!-- Right side (x icon only if in edit mode) -->
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-family: 'Sarabun', sans-serif; font-size: 14px; color: #A8A6A6;">
                    Member
                  </span>
                  <span v-if="isEditMode"
                        @click="removeMember(member.username)"
                        style="color: red; font-size: 16px; cursor: pointer;"
                        title="Remove Member">
                    ×
                  </span>
                </div>
              </div>
            </div>
            <!-- Show Loading Spinner while loading -->
            <div v-if="loading" class="modal-body">
              <p>Loading...</p> <!-- Add your loading spinner here -->
            </div>

          </div>
          <!-- Sticky Footer with Yellow Button -->
          <div class="modal-footer" style="padding-top: 10px; background-color: white; position: sticky; bottom: 0; z-index: 10;">
            <button type="button" 
                    class="btn" 
                    @click="sendInvite" 
                    style="width: 90%; height: 34px; border-radius: 30px; background-color: #FFD90C; color: white; display: flex; align-items: center; justify-content: center; font-family: 'Sarabun', sans-serif; font-weight: 800; padding: 12px 0; margin: 0 auto 5px;">
              <i class="bi bi-person-plus" style="font-size: 18px; margin-right: 10px; color: white;"></i>
              <span style="font-size: 16px;">Invite trip members</span>
            </button>
        </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div v-if="showInviteModal" class="modal-backdrop fade show"></div>
  </div>
  
</template>

<script>
import { supabase } from "../supabase";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();

    const navigateToEditItinerary = (tripId) => {
      router.push({ path: "/edit-itinerary", query: { id: tripId } });
    };

    return { navigateToEditItinerary };
  },

  data() {
    return {
      isEmailSelected: true,
      isEditMode: false,
      showMenus: {},
      user: null, // Store the logged-in user
      profilePic: "",
      username: "",
      fullname: "",
      selectedTab: 'email',
      trip: "",
      activeTab: "trips",
      loading: true,  // Add a loading state,
      showInviteModal: false,
      selectedItem: null,
      ownerProfile: {
        id:'',
        picture: '',
        name: '',
        username: '',
      },
      members: [],
      inviteEmail: "",
      trips: [
        // { title: "Boracay 2027", date: "January - December", content: "This is an example post.", image: "https://cebudailynews.inquirer.net/files/2021/10/10-20-Boracay-1024x683.jpeg" },
        ],
      guides: [
        { title: "Liked Item 1", content: "This is something you liked." },
        { title: "Liked Item 2", content: "Another liked item." }
      ], 
    showMenus: {}, // { [tripId]: boolean }

    };
  },
  async mounted() {
    this.fetchOwnerProfile();
    const { data: sessionData } = await supabase.auth.getSession();
    this.user = sessionData?.session?.user;
    document.addEventListener("click", this.handleClickOutside);

    // If a user is logged in, update username & fullname accordingly
    if (this.user) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, username, profile_pic_url")
        .eq("id", this.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
      } else {
        this.fullname = profile.full_name;
        this.username = profile.username;
        this.profilePic = profile.profile_pic_url || "https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/profile-pictures//default_profpic.jpg"; // Fallback image
      }
        // Count owned trips
      const { count: ownedTripCount, error: ownedCountError } = await supabase
        .from("itineraries")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", this.user.id);

      if (ownedCountError) {
        console.error("Error fetching owned trip count:", ownedCountError);
        return;
      }

      // Total trip count (owned + joined)
      this.trip = ownedTripCount;

      // Fetch the trip details
      await this.fetchTrips();
    }
    else{
        console.error("User not found in session.");
        return;
    }
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  methods: {
    switchTab(type) {
      if (type === 'email') {
        console.log("Switched to email");
        this.isEmailSelected = true;
        this.selectedTab = 'email'; // Use a reactive variable
      } else {
        console.log("Switched to username");
        this.isEmailSelected = false;
        this.selectedTab = 'username';
      }
    },

    editField() {
    this.isEditMode = !this.isEditMode;
    },

    async removeMember(username, index) {
      try {
        const memberToRemove = this.members.find(member => member.username === username);
        if (!memberToRemove) {
          console.warn('Member not found');
          return;
        }

        const tripId = this.selectedItem.id;
        const tripName = this.selectedItem.title || 'a trip';

        console.log("Removing from trip:", tripId, memberToRemove.id);

        // Delete the member from the itinerary_members table
        const { error: deleteError } = await supabase
          .from("itinerary_members")
          .delete()
          .eq("user_id", memberToRemove.id)
          .eq("itinerary_id", tripId);

        if (deleteError) throw deleteError;

        // Insert a notification to the removed member
        const { error: notifyError } = await supabase
          .from("notifications")
          .insert([
            {
              user_id: memberToRemove.id,
              type: "removed",
              message: `${this.ownerProfile.username} removed you from the itinerary "${tripName}"`,
              itinerary_id: tripId,
              sender_id: this.ownerProfile.id,
              image_url: this.ownerProfile.picture,
              itinerary_name: tripName,
              created_at: new Date().toISOString(),
              is_read: false
            }
          ]);

        if (notifyError) {
          console.warn("Member removed, but notification insert failed:", notifyError.message);
        }

        // Update frontend
        this.members = this.members.filter(member => member.username !== username);

      } catch (err) {
        this.isEditMode = false;
        console.error('Error removing member:', err.message);
        alert('Could not remove member.');
      }
      this.isEditMode = false;
    },

      
    async fetchTrips() {
      try {
        // Fetch trips where the user is the owner
        
        const { data: ownedTrips, error: ownedError } = await supabase
          .from("itineraries")
          .select("id, name, owner_id, start_date, end_date, cover_pic_url, place")
          .eq("owner_id", this.user.id);

        if (ownedError) {
          console.error("Error fetching owned trips:", ownedError);
          this.errorMessage = "Failed to load owned trips.";
          return;
        }

        // Combine owned and joined trips
        const allTrips = [...ownedTrips];

        // Map data from Supabase to match your component's structure
        this.trips = allTrips.map(trip => ({
          id: trip.id,
          ownerId: trip.owner_id,
          title: trip.name,
          date: `${trip.start_date} - ${trip.end_date}`,
          content: trip.place,
          image: trip.cover_pic_url || "" // Fallback image
        }));

        console.log("Fetched trips:", this.trips);
        } catch (err) {
          console.error("Unexpected error:", err);
          this.errorMessage = "Something went wrong.";
        }
    },

    openInviteModal(item) {
      this.selectedItem = item;
      this.showInviteModal = true;
      this.isEditMode = false;
      this.loading = true;  // Set loading state to true before fetching data
      this.fetchOwnerProfile();  // Re-fetch data when the modal opens
    },

    closeInviteModal() {
      this.tripMembers = ""; 
      this.showInviteModal = false;
      this.inviteEmail = "";
      this.isEditMode = false;
    },

  async sendInvite() {
    if (!this.tripMembers) return;

    const membersArray = this.tripMembers.split(",").map((item) => item.trim());
    let allInvitesValid = true; // Flag to check if all invites are valid
    let validInvites = []; // To store valid invite data that will be sent later
    let invalidItems = []; // To track invalid items for the alert message

    for (const item of membersArray) {
      if (!item) continue;

      // Email mode
      if (this.selectedTab === 'email') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(item)) {
          invalidItems.push(`"${item}" is not a valid email address.`);
          allInvitesValid = false;
          continue;
        }

        if (item === this.user.email) {
          invalidItems.push("You cannot invite yourself.");
          allInvitesValid = false;
          continue;
        }

        // Check if the user has already been invited (this is the double check part)
        const { data: existingInviteData, error: inviteError } = await supabase
          .from("trip_invites")
          .select("invited_email")
          .eq("invited_email", item)
          .eq("trip_id", this.selectedItem.id);

        if (inviteError) {
          console.error("Error checking if invite exists:", inviteError.message);
          invalidItems.push(`There was an error while checking if "${item}" has already been invited. Please try again later.`);
          allInvitesValid = false;
          continue;
        }

        // If there's already an existing invite for this email and trip_id
        if (existingInviteData && existingInviteData.length > 0) {
          invalidItems.push(`"${item}" has already been invited.`);
          allInvitesValid = false;
          continue;
        } else {
          // No existing invite, proceed with sending invite
          console.log(`No invite found for "${item}"`);
        }

        // Check if the email is registered
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("email")
          .eq("email", item)
          .single();

        if (userError || !userData) {
          invalidItems.push(`The email "${item}" is not registered.`);
          allInvitesValid = false;
          continue;
        }

        // If all checks pass, add this invite to validInvites
        validInvites.push({
          trip_id: this.selectedItem.id,
          invited_email: item,
          inviter_id: this.user.id,
          status: "pending",
          time_stamp: new Date().toISOString(),
        });
      }

      // Username mode
      else if (this.selectedTab === 'username') {
        if (item === this.user.username) {
          invalidItems.push("You cannot invite yourself.");
          allInvitesValid = false;
          continue;
        }

        // Get the user's email from their username
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("username, email")
          .eq("username", item)
          .single();

        if (userError || !userData) {
          invalidItems.push(`The username "${item}" is not registered.`);
          allInvitesValid = false;
          continue;
        }

        const invitedEmail = userData.email;

        // Check if the user has already been invited using their email
        const { data: existingInviteData, error: inviteError } = await supabase
          .from("trip_invites")
          .select("invited_email")
          .eq("invited_email", invitedEmail)
          .eq("trip_id", this.selectedItem.id);

        if (inviteError) {
          console.error("Error checking if invite exists:", inviteError.message);
          invalidItems.push(`There was an error while checking if "${item}" has already been invited. Please try again later.`);
          allInvitesValid = false;
          continue;
        }

        if (existingInviteData && existingInviteData.length > 0) {
          invalidItems.push(`"${item}" has already been invited.`);
          allInvitesValid = false;
          continue;
        }

        // If all checks pass, add this invite to validInvites
        validInvites.push({
          trip_id: this.selectedItem.id,
          invited_email: invitedEmail, // use their email for the invite
          inviter_id: this.user.id,
          status: "pending",
          time_stamp: new Date().toISOString(),
        });
      }
    }

    if (allInvitesValid) {
      // Send all valid invites together
      const { error: inviteInsertError } = await supabase.from("trip_invites").insert(validInvites);

      if (inviteInsertError) {
        console.error("Error sending invites:", inviteInsertError.message);
        alert("There was an error sending the invites. Please try again.");
      } else {
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
            message: `${senderProfile.username} invited you to join the itinerary "${this.selectedItem.title}"`,
            itinerary_id: invite.trip_id,
            sender_id: this.user.id,
            image_url: senderProfile.profile_pic_url, // Include sender's profile pic
            itinerary_name: this.selectedItem.title, // Include itinerary title
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
          }
          else{
            console.log("send succ");
          }
        }
        this.isEditMode = false;
        alert("Invites have been sent!"); // Show popup
        this.showInviteModal = false;
      }
    } else {
      // Show all invalid items with appropriate alerts
      alert(`Some invitations could not be sent:\n\n${invalidItems.join("\n")}`);
    }
  },

    toggleMenu(index) {
      // Close all menus first
      this.showMenus = {};

      // Then toggle the selected one
      this.showMenus[index] = !this.showMenus[index];
    },


    async deletePost(itinerary_id, index) {
      try {
        // Fetch the owner_id of the itinerary before deleting
        const { data, error } = await supabase
          .from("itineraries")
          .select("owner_id")
          .eq("id", itinerary_id)
          .single();

        if (error || !data) {
          console.error("Error fetching itinerary owner:", error);
          alert("Failed to verify ownership. Try again.");
          this.showMenus[index] = false;
          return;
        }

        // Check if the current user is the owner
        if (data.owner_id !== this.user.id) {
          alert("You cannot delete this itinerary because you are not the owner.");
          this.showMenus[index] = false;
          return;
        }

        // Ask for confirmation before deleting
        if (!confirm("Are you sure you want to delete this itinerary?")) {
          this.showMenus[index] = false;
          return;
        }

        // Proceed with deletion if user is the owner
        const { error: deleteError } = await supabase
          .from("itineraries")
          .delete()
          .eq("id", itinerary_id);

        if (deleteError) {
          console.error("Error deleting itinerary:", deleteError);
          alert("Failed to delete itinerary. Try again.");
          this.showMenus[index] = false;
          return;
        }

        // Step 5: Delete associated trip invites
        const { error: inviteDeleteError } = await supabase
          .from("trip_invites")
          .delete()
          .eq("trip_id", itinerary_id);

        if (inviteDeleteError) {
          console.error("Error deleting trip invites:", inviteDeleteError.message);
          // You may choose not to alert the user here to avoid confusion
        }

        this.showMenu = false;
        this.showMenus[index] = false;
        alert("Itinerary deleted successfully!");
  
        this.trips.splice(index, 1);

      } catch (err) {
        console.error("Unexpected error:", err);
        this.showMenus[index] = false;
        alert("Something went wrong.");
      }
    },

    async leaveTrip(tripId, index) {
      if (!confirm("Are you sure you want to leave this trip?")) return;

      try {
        // Check if the current user is the owner of the trip
        const { data: trip, error: tripError } = await supabase
          .from("itineraries")
          .select("owner_id, name")
          .eq("id", tripId)
          .single();

        if (tripError) {
          console.error("Error checking trip ownership:", tripError.message);
          alert("Unable to verify your ownership of the trip.");
          return;
        }

        if (trip.owner_id === this.user.id) {
          this.showMenus[index] = false;
          alert("You can't leave this trip because you are the owner.");
          
          return;
        }

        // Proceed to delete membership
        const { error } = await supabase
          .from("itinerary_members")
          .delete()
          .eq("user_id", this.user.id)
          .eq("itinerary_id", tripId);

        if (error) {
          this.showMenus[index] = false;
          console.error("Error leaving trip:", error.message);
          alert("There was an issue leaving the trip. Please try again.");
          return;
        }

        // Fetch user profile to get username and profile_pic_url
        const { data: senderProfile, error: profileError } = await supabase
          .from("profiles")
          .select("username, profile_pic_url")
          .eq("id", this.user.id)
          .single();

        if (profileError) {
          console.error("Failed to fetch sender profile:", profileError.message);
        }

        //Send notification to the owner
        const { error: notifError } = await supabase
          .from("notifications")
          .insert([
            {
              user_id: trip.owner_id,
              sender_id: this.user.id,
              type: "left",
              message: `${senderProfile?.username || "Someone"} left your itinerary "${trip.name}"`,
              itinerary_id: tripId,
              image_url: senderProfile?.profile_pic_url || 'https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/profile-pictures/default_profpic.jpg',
              itinerary_name: trip.name,
              created_at: new Date().toISOString(),
              is_read: false,
            }
          ]);

        if (notifError) {
          console.error("Failed to send notification:", notifError.message);
        }

        // Remove trip from UI
        this.trips.splice(index, 1);

        // Recalculate trip count
        const { count: ownedTripCount, error: ownedCountError } = await supabase
          .from("itineraries")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", this.user.id);

        const { count: joinedTripCount, error: joinedCountError } = await supabase
          .from("itinerary_members")
          .select("itinerary_id", { count: "exact", head: true })
          .eq("user_id", this.user.id);

        if (!ownedCountError && !joinedCountError) {
          this.trip = ownedTripCount + joinedTripCount;
        }
        this.showMenus[index] = false;
        alert("You have successfully left the trip.");
      } catch (err) {
        this.showMenus[index] = false;
        console.error("Unexpected error while leaving trip:", err);
        alert("An unexpected error occurred.");
      }

      this.showMenus[index] = false;
    },


    async fetchOwnerProfile() {
      try {
        console.log("Fetching profile for owner:", this.selectedItem.id);

        // Fetch owner data from Supabase
        const { data, error } = await supabase
          .from('profiles')  // Replace 'profiles' with your actual table name
          .select('full_name, username, profile_pic_url')
          .eq('id', this.selectedItem.ownerId)  // Fetch based on owner ID
          .single();

        if (error) {
          console.error('Error fetching owner profile:', error);
          this.loading = false;  // Set loading to false on error
          return;
        }

        console.log("owner id:", this.selectedItem.ownerId);
        // Update the ownerProfile with the fetched data
        this.ownerProfile = {
          id: this.selectedItem.ownerId,
          picture: data.profile_pic_url || 'https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/profile-pictures/default_profpic.jpg',
          name: data.full_name,
          username: data.username,
        };

        console.log("Fetched Owner Profile:", this.ownerProfile);

        // Fetch members' profiles
        const { data: memberIds, error: memberIdsError } = await supabase
            .from('itinerary_members')
            .select('user_id')
            .eq('itinerary_id', this.selectedItem.id);

          console.log("ID:", memberIds);
          if (memberIdsError) throw memberIdsError;

          const userIds = memberIds.map(member => member.user_id);

          const { data: membersData, error: membersError } = await supabase
            .from('profiles')
            .select('full_name, username, profile_pic_url, id')
            .in('id', userIds);

          if (membersError) throw membersError;

          this.members = membersData.map(member => ({
            id: member.id,
            username: member.username,
            full_name: member.full_name,
            profile_pic_url: member.profile_pic_url || 'https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/profile-pictures/default_profpic.jpg', // Default profile pic if missing
          }));

          console.log("Fetched Members Info:");
          this.members.forEach(member => {
            console.log(`Full Name: ${member.full_name}, Username: ${member.username}`);
          });

      } catch (error) {
        console.error('Error:', error);
      } finally {
        this.loading = false;  // Ensure loading is false when data fetching completes
      }
    },


    handleClickOutside(event) {
        if (!this.$el.contains(event.target)) {
          this.showMenu = false;
        }
      }
    }
  };
</script>


<style scoped>
@import "../assets/styles/profile.css"; /* Import external CSS file */
@import "../assets/styles/card-profile.css"
</style>