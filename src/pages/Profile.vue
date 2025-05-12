<template>
  <div class="container-fluid w-100y">

    <!-- Profile Header -->
    <div class="row">
      <!-- Navbar Top -->
      <nav class="navbar navbar-light bg-light d-flex align-items-center">
        <!-- Left Icon (Settings) -->
        <router-link to="/ProfileSettings" class="nav-link ms-3">
          <i class="bi bi-gear fs-3"></i>
        </router-link>

        <!-- Center Brand (Laagain) -->
        <a class="navbar-brand mx-auto" href="#"></a>

        <!-- Right Icons (Search & Notification) -->
        <div class="d-flex">
          <router-link class="nav-link me-3" to="/explore">
            <i class="bi bi-search fs-3"></i>
          </router-link>

          <a class="nav-link me-3" href="#"><i class="bi bi-bell fs-3"></i></a>
        </div>
      </nav>

      <div class="card w-100 rounded-1">
        <img :src="profilePic" alt="Profile Picture" class="profile-pic mx-auto" />
        <h1 class="mt-3">@{{ username }}</h1>
        <h4 class="mt-0">{{ fullname }}</h4>
        <p class="text-muted mx-auto rounded-3" id="tripCount">{{ trip }} Trips</p>
      </div>
    </div>

    <!-- Contents Section (Trips and Guides) -->
    <div class="row" id="contentSection">
      <!-- Tabs -->
      <ul class="nav nav-tabs nav-fill">
        <li class="nav-item">
          <a class="nav-link fs-4" :class="{ active: activeTab === 'trips' }" @click="activeTab = 'trips'">
            <i class="bi bi-geo"></i> Trips
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link fs-4" :class="{ active: activeTab === 'guides' }" @click="activeTab = 'guides'">
            <i class="bi bi-map"></i> Guides
          </a>
        </li>
      </ul>

      <!-- Tab Content -->
      <div class="tab-content overflow-auto pb-15vh">
        <!-- Trips Tab -->
        <div v-if="activeTab === 'trips'" class="row">
          <div v-for="(post, index) in trips" :key="index" class="col-lg-4 col-md-6 col-12">
            <div class="tripCard card mb-2 mt-2 rounded-5 w-100"
            @click="navigateToEditItinerary(post.id)"
            :style="{
                backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.2)), url(${post.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }"
            >
              <div class="card-body d-flex flex-column justify-content-between h-100">
                <!-- Upper section (Date and Three-dot menu) -->
                <div class="d-flex justify-content-between">
                  <span class="trip-date px-2 py-1">{{ post.date }}</span>
                  <span class="trip-menu" @click.stop="toggleMenu(index)">
                    <i class="bi bi-three-dots"></i>
                    <div v-if="showMenus[index]" class="menu-options">
                      <a href="#" @click.stop="deletePost(post.id, index)">Delete</a>
                    </div>
                  </span>
                </div>

                <!-- Lower section (Title & Content) -->
                <div>
                  <h5 class="card-title">{{ post.title }}</h5>
                  <p class="card-text">{{ post.content }}</p>
                </div>
                <!-- Invite Button -->
        
              </div>
              <!-- Invite Icon (Opens Modal) -->
              <div class="trip-icon" @click.stop="openInviteModal(post)">
                <i class="bi bi-person-plus"></i>
              </div>
            </div>
            
          </div>
        </div>

        <!-- Guides Tab -->
        <div v-if="activeTab === 'guides'" class="row">
          <div v-for="(guide, index) in guides" :key="index" class="col-lg-4 col-md-6 col-12">
            <div class="card mb-2 mt-2 rounded-5 w-100">
              <div class="card-body">
                <h5 class="card-title">{{ guide.title }}</h5>
                <p class="card-text">{{ guide.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Navigation Bar -->
      <div class="position-absolute start-50 translate-middle-x bottom-0 mb-4 w-50 bg-white rounded-pill shadow-lg py-3 d-flex justify-content-around align-items-center text-decoration-none"
        style="height: 70px; 
               box-shadow: 
                   inset 0px 5px 10px rgba(150, 150, 150, 0.5),  
                   0px 10px 30px rgba(100, 100, 100, 0.7);">
        
        <!-- Trips -->
        <div class="text-center">
          <router-link to="/dashboard" class="text-decoration-none d-flex flex-column align-items-center nav-item">
            <i class="bi bi-suitcase-fill fs-4 text-gray"></i>
            <p class="fw-bold m-0 small text-gray">Trips</p>
          </router-link>
        </div>

        <!-- Explore -->
        <div class="text-center">
          <router-link to="/explore" class="text-decoration-none d-flex flex-column align-items-center nav-item">
            <i class="bi bi-compass-fill fs-4 text-gray"></i>
            <p class="fw-bold m-0 small text-gray">Explore</p>
          </router-link>
        </div>

        <!-- Plus Button (Centered Floating Button) -->
        <div class="position-absolute start-50 translate-middle rounded-circle d-flex align-items-center justify-content-center"
            style="width: 60px; height: 60px; top: -5px; background-color: #03AED2; 
                box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.3);">

            <router-link to="/new-itinerary" class="text-white text-decoration-none d-flex align-items-center justify-content-center w-100 h-100">
                <i class="bi bi-plus-lg" 
                style="font-size: 2.5rem; /* Make it bigger */
                        font-weight: bold; 
                        -webkit-text-stroke: 3px white; 
                        text-stroke: 3px white;"></i>
            </router-link>
        </div>

        <!-- Hotel -->
        <div class="text-center">
          <router-link to="/hotel" class="text-decoration-none d-flex flex-column align-items-center nav-item">
            <i class="bi bi-building-fill fs-4 text-gray"></i>
            <p class="fw-bold m-0 small text-gray">Hotel</p>
          </router-link>
        </div>

        <!-- Profile -->
        <div class="text-center">
          <router-link to="/profile" class="text-decoration-none d-flex flex-column align-items-center nav-item">
            <i class="bi bi-person-fill fs-4 text-gray"></i>
            <p class="fw-bold m-0 small text-gray">Profile</p>
          </router-link>
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

            <div v-if="!loading" class="modal-body" style="overflow-y: auto;">
            <!-- Owner Info -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding: 0 20px;">
              <!-- Left side (profile pic + text) -->
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

              <!-- Role -->
              <span style="font-family: 'Sarabun', sans-serif; font-size: 14px; color: #03AED2; font-weight: 800;">
                Owner
              </span>
            </div>

            <!-- Members -->
            <div v-for="member in members" :key="member.username"
                style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding: 0 20px;">
              <!-- Left side (profile pic + text) -->
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

              <!-- Role -->
              <span style="font-family: 'Sarabun', sans-serif; font-size: 14px; color: #A8A6A6;">
                Member
              </span>
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
      ]
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

      // Count joined trips
      const { count: joinedTripCount, error: joinedCountError } = await supabase
        .from("itinerary_members")
        .select("itinerary_id", { count: "exact", head: true })
        .eq("user_id", this.user.id);

      if (joinedCountError) {
        console.error("Error fetching joined trip count:", joinedCountError);
        return;
      }

      // Total trip count (owned + joined)
      this.trip = ownedTripCount + joinedTripCount;

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

        // Fetch trips where the user is a member
        const { data: joinedTrips, error: joinedError } = await supabase
          .from("itinerary_members")
          .select("itinerary_id, itineraries!itinerary_members_itinerary_id_fkey(*)")
          .eq("user_id", this.user.id);

        if (joinedError) {
          console.error("Error fetching joined trips:", joinedError);
          this.errorMessage = "Failed to load joined trips.";
          return;
        }

        // Extract itinerary details from joined trips
        const joinedTripsData = joinedTrips.map(entry => entry.itineraries);

        // Combine owned and joined trips
        const allTrips = [...ownedTrips, ...joinedTripsData];

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
      this.loading = true;  // Set loading state to true before fetching data
      this.fetchOwnerProfile();  // Re-fetch data when the modal opens
    },

    closeInviteModal() {
      this.tripMembers = ""; 
      this.showInviteModal = false;
      this.inviteEmail = "";
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
        alert("Invites have been sent!"); // Show popup
        this.showInviteModal = false;
        this.$router.push("/dashboard");
      }
    } else {
      // Show all invalid items with appropriate alerts
      alert(`Some invitations could not be sent:\n\n${invalidItems.join("\n")}`);
    }
  },

    toggleMenu(index) {
      // Close other menus and toggle only the clicked one
      this.showMenus = { ...this.showMenus, [index]: !this.showMenus[index] };
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

        alert("Itinerary deleted successfully!");
        this.showMenu = false;
        this.showMenus[index] = false;
        window.location.reload(); // Refresh the page

      } catch (err) {
        console.error("Unexpected error:", err);
        this.showMenus[index] = false;
        alert("Something went wrong.");
      }
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

        // Update the ownerProfile with the fetched data
        this.ownerProfile = {
          picture: data.profile_pic_url,
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
            .select('full_name, username, profile_pic_url')
            .in('id', userIds);

          if (membersError) throw membersError;

          this.members = membersData.map(member => ({
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
</style>