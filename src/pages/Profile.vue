<template>
  <div class="container-fluid w-100y ">
    

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
                <a class="nav-link me-3" href="#"> <i class="bi bi-search fs-3"></i> </a>
                <a class="nav-link me-3" href="#"> <i class="bi bi-bell fs-3"></i>  </a>
            </div>
        </nav>
        <div class="card w-100 rounded-1">
            <img :src="profilePic" alt="Profile Picture" class="profile-pic mx-auto" />
            <h1 class="mt-3">@{{ username }}</h1>
            <h4 class="mt-0"> {{ fullname }} </h4>
            <p class="text-muted mx-auto rounded-3" id="tripCount">{{ trip }} Trips
            </p>
        </div>
    </div>

    <!-- Contents Section (Trips and Guides) -->
    <div class="row" id="contentSection">
        <!-- Tabs -->
        <ul class="nav nav-tabs nav-fill">
            <li class="nav-item">
                <a class="nav-link fs-4" :class="{ active: activeTab === 'trips' }" @click="activeTab = 'trips'"><i class="bi bi-geo"></i>Trips</a>
            </li>
            <li class="nav-item">
                <a class="nav-link fs-4" :class="{ active: activeTab === 'guides' }" @click="activeTab = 'guides'"><i class="bi bi-map"></i> Guides</a>
            </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content overflow-auto pb-15vh">
            <!-- Posts Tab -->
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
                            <span class="trip-menu"><i class="bi bi-three-dots"></i></span>
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

            <!-- Likes Tab -->
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
    </div>
  </div>
</template>

<script>
import { supabase } from "../supabase";

export default {
  data() {
    return {
      user: null, // Store the logged-in user
      profilePic: "",
      username: "",
      fullname: "",
      trip: "5",
      activeTab: "trips",
      trips: [
        { title: "Boracay 2027", date: "January - December", content: "This is an example post.", image: "https://cebudailynews.inquirer.net/files/2021/10/10-20-Boracay-1024x683.jpeg" },
        { title: "Singapore", date: "January - December", content: "This is an example post.", image: "https://a.travel-assets.com/findyours-php/viewfinder/images/res70/542000/542607-singapore.jpg" },
        { title: "Rizal Family Reunion", date: "January - December", content: "This is an example post.", image: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Rizal_Shrine%2C_Calamba%2C_Laguna%2C_Mar_2023.jpg" },
        { title: "IAO GIRLS TRIP!", date: "January - December", content: "This is an example post.", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9H6Ak0OUlv42bOs9_YwkU7JnLS74Tz0OcIQ&s" },
        { title: "Home", date: "January - December", content: "This is an example post.", image: "https://minamiresidences.com.ph/wp-content/uploads/2023/07/image-1-53-1.png" }
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
    }
    else{
        console.error("User not found in session.");
        return;
    }
  }
};
</script>


<style scoped>
.profile-pic {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.bottom-navbar{
    width: 75%;
    margin: 0 auto;
}

.tab-content{
    max-height: 80vh;
    padding-bottom: 25vh;
}
#contentSection{
    background-color: #f2f3f5;
}

.nav-link{
    color: #808080;
}

.nav-link:hover{
    color: #03AED2;
}

.nav-link.active{
    border-bottom: 4px solid #03AED2 !important;
    color: #089dcf !important;
}

.tripCard{
    height: 300px;
}

.card-body{
    color: white;
    text-align: left;
}

#tripCount{
    border: 2px solid #FDDE55;
    width: 110px;
}
</style>
