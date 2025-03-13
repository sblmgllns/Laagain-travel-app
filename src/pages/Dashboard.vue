<template>
    <div class="container-fluid w-100 bg-white">
      
      <!-- Profile Header with Laagain -->
      <div class="row p-3 d-flex align-items-center">
        <!-- Profile Picture -->
        <div class="col-auto d-flex align-items-center justify-content-center">
          <img 
            :src="profilePic" 
            alt="Profile Picture" 
            class="rounded-circle border border-white shadow-sm img-fluid"
            style="width: 80px; height: 80px; object-fit: cover;" 
          />
        </div>
  
        <!-- Laagain Text (Same Line as Profile Pic) -->
        <div class="col text-center">
          <h4 class="fw-bold m-0">laagain</h4>
        </div>
  
        <!-- Icons -->
        <div class="col-auto d-flex">
          <a class="nav-link me-3" href="#"><i class="bi bi-search fs-3"></i></a>
          <a class="nav-link" href="#"><i class="bi bi-bell fs-3"></i></a>
        </div>
      </div>
  
      <!-- MY TRIPS Centered -->
      <div class="text-center mt-1 mb-3">
        <h2 class="fw-bold display-3 fs-1" style="color: #03AED2;">MY TRIPS</h2>
      </div>
  
      <!-- Tabs Section -->
      <div class="row" id="contentSection">
        
        <ul class="nav nav-tabs nav-fill">
          <li class="nav-item">
            <a class="nav-link fs-5 tab-spacing" :class="{ active: activeTab === 'active' }" @click="activeTab = 'active'">
              Active
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link fs-5 tab-spacing" :class="{ active: activeTab === 'completed' }" @click="activeTab = 'completed'">
              Completed
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link fs-5 tab-spacing" :class="{ active: activeTab === 'invited' }" @click="activeTab = 'invited'">
              Invited
            </a>
          </li>
        </ul>
  
        <!-- Tab Content -->
        <div class="tab-content overflow-auto pb-15vh">
          
          <!-- NOW TRAVELING Section (Only in Active Tab) -->
          <div v-if="activeTab === 'active'" 
            class="now-traveling mx-auto text-center rounded-pill shadow-sm py-2 px-4 mb-2 d-inline-flex align-items-center mt-4" 
            style="background-color: #FFD90C;">
            <div class="circle bg-white rounded-circle me-2" style="width: 10px; height: 10px;"></div>
            <h6 class="fw-bold text-white m-0">Now Traveling</h6>
          </div>
  
          <!-- Active Trips List -->
          <div v-if="activeTab === 'active'" class="row justify-content-start">
            <div v-for="(task, index) in activeTasks" :key="index" class="col-lg-4 col-md-6 col-12">
              <div class="tripCard card mb-2 mt-2 rounded-5 w-100" 
                :style="{
                  backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.2)), url(${task.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }">
                
                <!-- People or Invite Icon -->
                <div class="trip-icon">
                  <i class="bi bi-person-plus"></i>
                </div>
  
                <div class="card-body d-flex flex-column justify-content-between h-100">
                  <div class="d-flex justify-content-between">
                    <span class="trip-date px-2 py-1">{{ task.date }}</span>
                    <span class="trip-menu"><i class="bi bi-three-dots"></i></span>
                  </div>
                  <div>
                    <h5 class="card-title">{{ task.title }}</h5>
                    <p class="card-text">{{ task.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Upcoming Trips Section (Centered) -->
          <div v-if="activeTab === 'active' && activeTasks.length > 3" class="d-flex justify-content-center mt-5">
                <div class="upcoming-trips d-flex align-items-center justify-content-center rounded-pill shadow-sm py-2 px-4 mb-3"
                    style="background-color: #adb5bd; min-width: 180px; max-width: 100%;">
                    <div class="circle bg-white rounded-circle me-2" style="width: 12px; height: 12px;"></div>
                    <h6 class="fw-bold text-white m-0">Upcoming Trips</h6>
                </div>
            </div>
        
            <!-- Active Trips List -->
          <div v-if="activeTab === 'active'" class="row justify-content-start">
            <div v-for="(task, index) in activeTasks" :key="index" class="col-lg-4 col-md-6 col-12">
              <div class="tripCard card mb-2 mt-2 rounded-5 w-100" 
                :style="{
                  backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.2)), url(${task.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }">
                
                <!-- People or Invite Icon -->
                <div class="trip-icon">
                  <i class="bi bi-person-plus"></i>
                </div>
  
                <div class="card-body d-flex flex-column justify-content-between h-100">
                  <div class="d-flex justify-content-between">
                    <span class="trip-date px-2 py-1">{{ task.date }}</span>
                    <span class="trip-menu"><i class="bi bi-three-dots"></i></span>
                  </div>
                  <div>
                    <h5 class="card-title">{{ task.title }}</h5>
                    <p class="card-text">{{ task.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Completed Tab -->
          <div v-if="activeTab === 'completed'" class="row mt-4">
            <div v-for="(task, index) in completedTasks" :key="index" class="col-lg-4 col-md-6 col-12">
              <div class="tripCard card mb-2 mt-2 rounded-5 w-100"
                :style="{
                  backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.2)), url(${task.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }">
  
                <!-- People or Invite Icon -->
                <div class="trip-icon">
                  <i class="bi bi-person-plus"></i>
                </div>
  
                <div class="card-body d-flex flex-column justify-content-between h-100">
                  <div class="d-flex justify-content-between">
                    <span class="trip-date px-2 py-1">{{ task.date }}</span>
                    <span class="trip-menu"><i class="bi bi-three-dots"></i></span>
                  </div>
                  <div>
                    <h5 class="card-title">{{ task.title }}</h5>
                    <p class="card-text">{{ task.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Invited Tab -->
          <div v-if="activeTab === 'invited'" class="row mx-0 mt-5">
            <div v-for="(task, index) in invitedTasks" :key="index" class="col-12 px-0">
              <div class="text-muted text-start ms-4 mb-1 fst-italic">
                <em>{{ timeAgo(task.date) }}</em>
              </div>
  
              <!-- Invitation Card -->
              <div class="card mb-3 border-0 shadow-sm rounded-4 w-100">
                <div class="card-body d-flex align-items-center px-4 py-1">
                  
                  <!-- Profile Picture -->
                  <div class="me-3">
                    <img 
                        :src="profilePic && profilePic.trim() ? profilePic : 'https://via.placeholder.com/50'" 
                        alt="Profile Picture" 
                        class="rounded-circle" 
                        style="width: 50px; height: 50px; object-fit: cover;" 
                        />
                  </div>
  
                  <!-- Text Content -->
                  <div>
                    <h5 class="card-title fw-bold mb-1">{{ task.title }}</h5>
                    <p class="card-text" style="color: black; margin-bottom: 0;">
                      <span v-html="task.content
                        .replace('SUMMER 2023', '<strong>SUMMER 2023</strong>') 
                        .replace('SIARGAO WE COMING', '<strong>SIARGAO WE COMING</strong>')">
                      </span>
                    </p>
                  </div>
  
                  <!-- Check & X Buttons -->
                  <div class="d-flex ms-auto">
                    <div class="icon-container me-2">
                      <span class="text-success fw-bold">✔</span>
                    </div>
                    <div class="icon-container">
                      <span class="text-danger fw-bold">✘</span>
                    </div>
                  </div>
  
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

            <router-link to="/add" class="text-white text-decoration-none d-flex align-items-center justify-content-center w-100 h-100">
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
    methods: {
        timeAgo(date) {
            const now = new Date();
            const past = new Date(date);
            const diff = Math.floor((now - past) / 1000); // Difference in seconds

            if (diff < 60) return "Just now"; // Less than a minute
            if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`; // Less than an hour
            if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`; // Less than a day
            if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`; // Less than a month
            if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`; // Less than a year
            return `${Math.floor(diff / 31536000)} years ago`; // More than a year
        }
    },

    data() {
      return {
        user: null,
        profilePic: "",
        username: "",
        fullname: "",
        trip: "5",
        activeTab: "active",
        activeTasks: [
            { title: "Boracay 2027", date: "January - December", content: "This is an example post.", image: "https://cebudailynews.inquirer.net/files/2021/10/10-20-Boracay-1024x683.jpeg" },
            { title: "Singapore", date: "January - December", content: "This is an example post.", image: "https://a.travel-assets.com/findyours-php/viewfinder/images/res70/542000/542607-singapore.jpg" },
            { title: "Rizal Family Reunion", date: "January - December", content: "This is an example post.", image: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Rizal_Shrine%2C_Calamba%2C_Laguna%2C_Mar_2023.jpg" },
            { title: "IAO GIRLS TRIP!", date: "January - December", content: "This is an example post.", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9H6Ak0OUlv42bOs9_YwkU7JnLS74Tz0OcIQ&s" },
            { title: "Home", date: "January - December", content: "This is an example post.", image: "https://minamiresidences.com.ph/wp-content/uploads/2023/07/image-1-53-1.png" }
        ],
        completedTasks: [
            { title: "JAPAN", date: "April - May", content: "This is an example post.", image: "https://lp-cms-production.imgix.net/2020-11/GettyRF_1179891725.jpg?auto=format&fit=crop&sharp=10&vib=20&ixlib=react-8.6.4&w=850&q=20&dpr=5" },
            { title: "Korea 2027", date: "June", content: "This is an example post.", image: "https://th.bing.com/th/id/OIP.MSywdx_5O5dWTucTNjtHsgHaE7?w=298&h=199&c=7&r=0&o=5&dpr=1.3&pid=1.7" },
            { title: "Manila Summer", date: "July - November", content: "This is an example post.", image: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Rizal_Shrine%2C_Calamba%2C_Laguna%2C_Mar_2023.jpg" },
            ],
        invitedTasks: [
            { title: "Upcoming Event", content: "isabella.lobitana invited you to join the “SUMMER 2023” trip plan", date: "2023-02-20T12:00:00Z" },
            { title: "Project Meeting", content: "marcs_pel invited you to join the “SIARGAO WE COMING” trip plan", date: "2022-03-10T08:30:00Z" }
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
  body, .container-fluid, .nav-link, .card-title, .card-text, h4, h2, h5, h6, p {
    font-family: 'Sarabun', sans-serif;
  }

  .profile-pic {
    width: 250px;
    height: 200px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.text-gray {
    color: #b0b0b0; /* Default gray color */
    transition: color 0.3s ease-in-out, transform 0.2s ease-in-out;
}

.nav-item:hover i,
.nav-item:hover p {
    color: #03AED2 !important; /* Blue when hovered */
    transform: scale(1.1); /* Slight zoom effect */
}

  .nav-link {
    color: #808080;
    font-weight: bold; 
  }
  
  .nav-link:hover {
    color: #03AED2;
  }
  
  .tripCard {
    position: relative; /* Ensure the tripCard is a positioned element for absolute positioning of the icon */
}

.trip-icon {
    position: absolute;
    bottom: 35px; /* Adjust the vertical position of the icon */
    right: 40px; /* Adjust the horizontal position of the icon */
    font-size: 24px; /* Adjust the icon size */
    color: white; /* Icon color */
    z-index: 2; /* Make sure the icon appears above the card */
}


  .nav-link.active {
    border-bottom: 4px solid #03AED2 !important;
    color: #089dcf !important;
  }

  .nav-link.tab-spacing {
    letter-spacing: 0.04em; /* Adjust the value to fit your need */
}
  
  
  .tripCard {
    height: 300px;
  }
  
  .card-body {
    color: white;
    text-align: left;
  }
  
  .tab-content {
    background-color: #e3e2e2; /* Gray background only for tab content */
    padding-bottom: 15vh;
}

.icon-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px; /* Reduced size */
    height: 40px; /* Reduced size */
    border-radius: 10px; /* Slightly smaller border radius for a more subtle circle */
    border: 2px solid #ddd; /* Light border around the icon */
    margin: 0;
}

.icon-container span {
    font-size: 25px; /* Reduced font size for a smaller icon */
    margin: 0;
}


  #contentSection {
    background-color: #ffffff;
  }
</style>
  