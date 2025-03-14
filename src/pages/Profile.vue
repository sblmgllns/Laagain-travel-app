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
          <a class="nav-link me-3" href="#"><i class="bi bi-search fs-3"></i></a>
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
                  <span class="trip-menu" @click="toggleMenu(index)">
                    <i class="bi bi-three-dots"></i>
                    <div v-if="showMenus[index]" class="menu-options">
                      <a href="#" @click.stop="deletePost(post.id)">Delete</a>
                    </div>
                  </span>
                </div>

                <!-- Lower section (Title & Content) -->
                <div>
                  <h5 class="card-title">{{ post.title }}</h5>
                  <p class="card-text">{{ post.content }}</p>
                </div>
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
  </div>
</template>

<script>
import { supabase } from "../supabase";

export default {
  data() {
    return {
      showMenus: {},
      user: null, // Store the logged-in user
      profilePic: "",
      username: "",
      fullname: "",
      trip: "",
      activeTab: "trips",
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
        
        const { count, error } = await supabase
          .from("itineraries")
          .select("*", { count: "exact", head: true }) // `head: true` prevents fetching actual data
          .eq("owner_id", this.user.id);

        if (error) {
          console.error("Error fetching itinerary count:", error);
          return;
        }

        this.trip = count; 

        await this.fetchTrips();
      }
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
    async fetchTrips() {
      try {
        const { data, error } = await supabase
          .from("itineraries")
          .select("id, name, start_date, end_date, cover_pic_url, place")
          .eq("owner_id", this.user.id);

        if (error) {
          console.error("Error fetching trips:", error);
          this.errorMessage = "Failed to load trips.";
          return;
        }

        // Map data from Supabase to match your component's structure
        this.trips = data.map(trip => ({
          id: trip.id,
          title: trip.name,
          date: `${trip.start_date} - ${trip.end_date}`,
          content: trip.place, // Modify if there's a description column
          image: trip.cover_pic_url || "" // Fallback image
        }));

        console.log("Fetched trips:", this.trips);
      } catch (err) {
        console.error("Unexpected error:", err);
        this.errorMessage = "Something went wrong.";
      }
    },
    toggleMenu(index) {
      // Close other menus and toggle only the clicked one
      this.showMenus = { ...this.showMenus, [index]: !this.showMenus[index] };
    },
    async deletePost(itinerary_id) {
      if (confirm("Are you sure you want to delete this post?")) {
        alert("Post deleted! (Replace this with actual delete logic)");
        const { error } = await supabase
          .from("itineraries") // Your table name
          .delete()
          .eq("id", itinerary_id); // Match the row by its ID

        if (error) {
          console.error("Error deleting itinerary:", error);
          return;
        }
        this.showMenu = false;
        window.location.reload();
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