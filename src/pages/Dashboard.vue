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
          <router-link class="nav-link me-3" to="/explore">
            <i class="bi bi-search fs-3"></i>
          </router-link>

          <router-link class="nav-link" to="/notifications">
            <i class="bi bi-bell fs-3"></i>
          </router-link>
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
            <div v-for="(task, index) in activeNowTasks" :key="index" class="col-lg-4 col-md-6 col-12">
              <div class="tripCard card mb-2 mt-2 rounded-5 w-100" 
              @click="navigateToEditItinerary(task.id)"
              :style="{
                  backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.2)), url(${task.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }">
                
                <!-- Invite Icon (Opens Modal) -->
                <div class="trip-icon" @click.stop="openInviteModal(task)">
                  <i class="bi bi-person-plus"></i>
                </div>
  
                <div class="card-body d-flex flex-column justify-content-between h-100">
                <!-- Top: Date and Menu -->
                <div class="d-flex justify-content-between align-items-start">
                  <span class="trip-date px-2 py-1">{{ task.date }}</span>

                  <span class="trip-menu" @click.stop="toggleMenu(index)">
                    <i class="bi bi-three-dots"></i>
                    <div v-if="showMenus[index]" class="menu-options">
                      <a href="#" @click.stop="deletePost(task.id, index)">Delete</a>
                    </div>
                  </span>
                </div>

                <!-- Title & Content -->
                <div>
                  <h5 class="card-title">{{ task.title }}</h5>
                  <p class="card-text">{{ task.content }}</p>
                </div>
              </div>

              </div>
            </div>
          </div>
          
          <!-- Upcoming Trips Section (Centered) -->
          <div v-if="activeTab === 'active'" class="d-flex justify-content-center mt-5">
                <div class="upcoming-trips d-flex align-items-center justify-content-center rounded-pill shadow-sm py-2 px-4 mb-3"
                    style="background-color: #adb5bd; min-width: 180px; max-width: 100%;">
                    <div class="circle bg-white rounded-circle me-2" style="width: 12px; height: 12px;"></div>
                    <h6 class="fw-bold text-white m-0">Upcoming Trips</h6>
                </div>
          </div>
        
            <!-- Active Trips List -->
            <div v-if="activeTab === 'active'" class="row justify-content-start">
            <div v-for="(task, index) in activeUpcomingTasks" :key="index" class="col-lg-4 col-md-6 col-12">
              <div class="tripCard card mb-2 mt-2 rounded-5 w-100" 
                @click="navigateToEditItinerary(task.id)"
                :style="{
                  backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.2)), url(${task.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }">
                
                 <!-- Invite Icon (Opens Modal) -->
                <div class="trip-icon" @click.stop="openInviteModal(task)">
                  <i class="bi bi-person-plus"></i>
                </div>
  
                <div class="card-body d-flex flex-column justify-content-between h-100">
                <!-- Top: Date and Menu -->
                <div class="d-flex justify-content-between align-items-start">
                  <span class="trip-date px-2 py-1">{{ task.date }}</span>

                  <span class="trip-menu" @click.stop="toggleMenu(index)">
                    <i class="bi bi-three-dots"></i>
                    <div v-if="showMenus[index]" class="menu-options">
                      <a href="#" @click.stop="deletePost(task.id, index)">Delete</a>
                    </div>
                  </span>
                </div>

                <!-- Title & Content -->
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
              @click="navigateToEditItinerary(task.id)"
              :style="{
                  backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.2)), url(${task.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }">
  
                 <!-- Invite Icon (Opens Modal) -->
                  <div class="trip-icon" @click.stop="openInviteModal(task)">
                    <i class="bi bi-person-plus"></i>
                  </div>
  
                  <div class="card-body d-flex flex-column justify-content-between h-100">
                <!-- Top: Date and Menu -->
                <div class="d-flex justify-content-between align-items-start">
                  <span class="trip-date px-2 py-1">{{ task.date }}</span>

                  <span class="trip-menu" @click.stop="toggleMenu(index)">
                    <i class="bi bi-three-dots"></i>
                    <div v-if="showMenus[index]" class="menu-options">
                      <a href="#" @click.stop="deletePost(task.id, index)">Delete</a>
                    </div>
                  </span>
                </div>

                <!-- Title & Content -->
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
            {{ console.log("Task Data:", task) }}
            <!-- Time Ago -->
            <div class="text-muted text-start ms-4 mb-1 fst-italic">
              <em>{{ timeAgo(task.date) }}</em>
            </div>

            <!-- Invitation Card -->
            <div class="card mb-3 border-0 shadow-sm rounded-4 w-100">
              <div class="card-body d-flex align-items-center px-4 py-1">
                
                <!-- Profile Picture of the Inviter -->
                <div class="me-3 position-absolute">
                  <img 
                    :src="task.profilePic" 
                    alt="Inviter Profile Picture" 
                    class="rounded-circle" 
                    style="width: 80px; height: 80px; object-fit: cover;" 
                  />
                </div>

                <!-- Text Content -->
                <div style="margin-left: 100px;">
                  <h5 class="card-title fw-bold mb-1">{{ task.title }}</h5>
                  <p class="card-text" style="color: black; font-size: 18px; tom: 0;" v-html="task.content"></p>
                </div>
                <!-- Check & X Buttons with Bootstrap Hover Effect (Wider Buttons & More Space) -->
                <div class="d-flex ms-auto">
                  <div class="me-4">
                    <span class="text-success fw-bold fs-5 p-1 rounded bg-light shadow-sm d-inline-block btn btn-light" 
                          @click="updateInviteStatus(task.id, 'approved')" 
                          style="width: 50px; height: 50px; text-align: center; line-height: 46px;">
                      ✔
                    </span>
                  </div>
                  <div>
                    <span class="text-danger fw-bold fs-5 p-1 rounded bg-light shadow-sm d-inline-block btn btn-light" 
                          @click="updateInviteStatus(task.id, 'declined')" 
                          style="width: 50px; height: 50px; text-align: center; line-height: 46px;">
                      ✘
                    </span>
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
      <<div v-if="showInviteModal" class="modal fade show d-block" tabindex="-1" aria-labelledby="inviteModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content" style="height: 80vh;">
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
              <!-- Profile Picture and Owner Info -->
              <div style="display: flex; align-items: center; justify-content: flex-start; margin-top: 5px;">
                <!-- Profile Picture -->
                <img :src="ownerProfile.picture" alt="Owner's Profile Picture" style="width: 40px; height: 40px; margin-left: 20px; border-radius: 50%; margin-right: 10px;">
                
                <!-- Name and Username (Full Name on top, Username below) -->
                <div>
                  <span style="font-family: 'Sarabun', sans-serif; font-weight: 800; font-size: 12px; color: #000; display: block;">{{ ownerProfile.name }}</span>
                  <span style="font-family: 'Sarabun', sans-serif; font-size: 12px; color: #A8A6A6; display: block;">@{{ ownerProfile.username }}</span>
                </div>

                <!-- Owner Indication -->
                <span style="font-family: 'Sarabun', sans-serif; font-size: 14px; color: #03AED2; font-weight: 800; margin-left: auto; margin-right: 20px;">Owner</span>
              </div>

              <!-- Displaying Members -->
              <div style="max-height: 300px;">
                <div v-for="member in members" :key="member.username" style="display: flex; align-items: center; justify-content: flex-start; margin-top: 10px;">
                  <!-- Member Profile Picture -->
                  <img
  :src="member.profile_pic_url"
     alt="Member's Profile Picture" style="width: 40px; height: 40px; margin-left: 20px; border-radius: 50%; margin-right: 10px;">
                  
                  <!-- Member Name and Username -->
                  <div>
                    <span style="font-family: 'Sarabun', sans-serif; font-weight: 800; font-size: 12px; color: #000; display: block;">{{ member.full_name }}</span>
                    <span style="font-family: 'Sarabun', sans-serif; font-size: 12px; color: #A8A6A6; display: block;">@{{ member.username }}</span>
                  </div>

                  <!-- Member Indication -->
                  <span style="font-family: 'Sarabun', sans-serif; font-size: 14px; color: #A8A6A6; margin-left: auto; margin-right: 20px;">Member</span>
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
        user: null,
        profilePic: "",
        username: "",
        fullname: "",
        trip: "5",
        activeTab: "active",
        loading: true,  // Add a loading state,
        showInviteModal: false,
        isEmailSelected: true,
        showMenus: {},
        selectedItem: null,
        selectedTab: 'email',
        ownerProfile: {
          picture: '',
          name: '',
          username: '',
        },
        members: {},
        inviteEmail: "",
        newMemberEmail: "",
        tripMembersInput: '', // Stores the input field value (current email to add)
        tripMembers: [],
        activeNowTasks: [
            // { title: "Boracay 2027", date: "January - December", content: "This is an example post.", image: "https://cebudailynews.inquirer.net/files/2021/10/10-20-Boracay-1024x683.jpeg" },
            // { title: "Singapore", date: "January - December", content: "This is an example post.", image: "https://a.travel-assets.com/findyours-php/viewfinder/images/res70/542000/542607-singapore.jpg" },
            // { title: "Rizal Family Reunion", date: "January - December", content: "This is an example post.", image: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Rizal_Shrine%2C_Calamba%2C_Laguna%2C_Mar_2023.jpg" },
            // { title: "IAO GIRLS TRIP!", date: "January - December", content: "This is an example post.", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9H6Ak0OUlv42bOs9_YwkU7JnLS74Tz0OcIQ&s" },
            // { title: "Home", date: "January - December", content: "This is an example post.", image: "https://minamiresidences.com.ph/wp-content/uploads/2023/07/image-1-53-1.png" }
        ],
        activeUpcomingTasks: [
        ],
        completedTasks: [
            { title: "JAPAN", date: "April - May", content: "This is an example post.", image: "https://lp-cms-production.imgix.net/2020-11/GettyRF_1179891725.jpg?auto=format&fit=crop&sharp=10&vib=20&ixlib=react-8.6.4&w=850&q=20&dpr=5" },
            { title: "Korea 2027", date: "June", content: "This is an example post.", image: "https://th.bing.com/th/id/OIP.MSywdx_5O5dWTucTNjtHsgHaE7?w=298&h=199&c=7&r=0&o=5&dpr=1.3&pid=1.7" },
            { title: "Manila Summer", date: "July - November", content: "This is an example post.", image: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Rizal_Shrine%2C_Calamba%2C_Laguna%2C_Mar_2023.jpg" },
            ],
        invitedTasks: [
            { title: "Upcoming Event", content: "isabela.lobitana invited you to join the “SUMMER 2023” trip plan", date: "2023-02-20T12:00:00Z" },
            { title: "Project Meeting", content: "marcs_pel invited you to join the “SIARGAO WE COMING” trip plan", date: "2022-03-10T08:30:00Z" }
        ]

      }
    },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
    
  async mounted() {
    this.fetchOwnerProfile();
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
      
        await this.fetchTasks();
        await this.fetchInvites();  
      }
    }
    else{
        console.error("User not found in session.");
        return;
    }
    await this.fetchTasks();
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
        },

    async updateInviteStatus(id, newStatus) {
    try {
      // Step 1: Update invite status
      const { error: updateError } = await supabase
        .from("trip_invites")
        .update({ status: newStatus })
        .eq("id", id);

      if (updateError) {
        console.error(`Error updating invite status: ${updateError.message}`);
        return;
      }


      console.log(`Invitation ${id} updated to ${newStatus}`);

      // Step 2: Fetch trip_id and inviter_id
      const { data: inviteData, error: inviteError } = await supabase
        .from("trip_invites")
        .select("trip_id, inviter_id")
        .eq("id", id)
        .single();

      if (inviteError || !inviteData) {
        console.error("Error fetching trip data:", inviteError?.message);
        return;
      }
      console.log(inviteData);
      const { trip_id, inviter_id } = inviteData;

      // Step 3: Get itinerary name using trip_id
      const { data: itineraryData, error: itineraryError } = await supabase
        .from("itineraries")
        .select("name")
        .eq("id", trip_id)
        .single();

      console.log(itineraryData);
      if (itineraryError || !itineraryData) {
        console.error("Error fetching itinerary name:", itineraryError?.message);
        return;
      }

      const itineraryName = itineraryData.name;

      // Step 4: Add current user to itinerary_members
      if (newStatus === "approved") {
        const { error: memberError } = await supabase
          .from("itinerary_members")
          .insert([
            {
              itinerary_id: trip_id,
              user_id: this.user.id,
            },
          ]);

        if (memberError) {
          console.error("Error adding to itinerary_members:", memberError.message);
          return;
        }

        console.log(`User ${this.user.id} added to itinerary_members for trip ${trip_id}`);

        // Step 5: Fetch current user's profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("username, profile_pic_url")
          .eq("id", this.user.id)
          .single();

        if (profileError || !profileData) {
          console.error("Error fetching user profile:", profileError?.message);
          return;
        }

        // Step 6: Send notification to inviter
        const { error: notifError } = await supabase
          .from("notifications")
          .insert([
            {
              user_id: inviteData.inviter_id,
              type: "accept",
              sender_id: this.user.id,
              message: `${profileData.username} accepted your invitation to "${itineraryName}"`,
              image_url: profileData.profile_pic_url || '',
              itinerary_name: itineraryName,
            },
          ]);

        if (notifError) {
          console.error("Error creating notification:", notifError.message);
        } else {
          console.log("Notification sent to inviter.");
        }
      }
    
    // Refresh lists
    this.fetchInvites();
    this.fetchTasks();
  } catch (err) {
    console.error("Unexpected error:", err);
  }
},



      async fetchTasks() {
        try {
          // Fetch trips where the user is the owner
          const { data: ownedTrips, error: ownedError } = await supabase
            .from("itineraries")
            .select("id, owner_id, name, start_date, end_date, cover_pic_url, place")
            .eq("owner_id", this.user.id);

          if (ownedError) {
            console.error("Error fetching owned trips:", ownedError);
            this.errorMessage = "Failed to load owned trips.";
            return;
          }

          console.log("this is:", this.user.id);


          const { data: joinedTrips, error: joinedError } = await supabase
            .from("itinerary_members")
            .select("itinerary_id, itineraries!itinerary_members_itinerary_id_fkey(*)")  // Fetch all related itinerary details
            .eq("user_id", this.user.id);  // Only trips for the current user

          console.log("Joined Trips Data:", joinedTrips);


          if (joinedError) {
            console.error("Error fetching joined trips:", joinedError);
            this.errorMessage = "Failed to load joined trips.";
            return;
          }

          // Extract itinerary details from joined trips
          const joinedTripsData = joinedTrips.map((entry) => entry.itineraries);
          console.log("Joined Trips Data:", joinedTripsData);
          // Combine owned and joined trips
          const allTrips = [...ownedTrips, ...joinedTripsData];

          // Get today's date without time
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Reset the task lists
          this.activeNowTasks = [];
          this.activeUpcomingTasks = [];
          this.completedTasks = [];

          // Categorize trips based on date
          allTrips.forEach(trip => {
            const startDate = new Date(trip.start_date);
            const endDate = new Date(trip.end_date);

            // Normalize times to ignore time portion
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999); // Ensure whole end date counts

            const task = {
              id: trip.id,
              title: trip.name,
              ownerId: trip.owner_id,
              date: `${trip.start_date} - ${trip.end_date}`,
              content: trip.place,
              image: trip.cover_pic_url || ""
            };

            if (today >= startDate && today <= endDate) {
              this.activeNowTasks.push(task); // Ongoing trip
            } else if (today < startDate) {
              this.activeUpcomingTasks.push(task); // Future trip
            } else {
              this.completedTasks.push(task); // Completed trip
            }
          });

          console.log("Active Trips:", this.activeNowTasks);
          console.log("Upcoming Trips:", this.activeUpcomingTasks);
          console.log("Completed Trips:", this.completedTasks);

        } catch (err) {
          console.error("Unexpected error:", err);
          this.errorMessage = "Something went wrong.";
        }
      },

    async fetchInvites() {
      try {
        // Fetch the user's email
        console.log("Fetching user email...");
        console.log("Current user ID:", this.user?.id);
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", this.user.id)
          .single();

          if (userError) {
            console.error("Error fetching user email:", userError);
            return;
          } else if (!userData || !userData.email) { 
            console.error("Error: User email is missing or null.");
            return;
          };

          this.email = userData.email;
          console.log("User email:", this.email);
                  

        // Fetch invites where the user's email matches invited_email
        const { data, error } = await supabase
          .from("trip_invites")
          .select("id, trip_id, invited_email, inviter_id, status, time_stamp")
          .eq("invited_email", this.email)
          .eq("status", "pending"); // Fetch only pending invites

        if (error) {
          console.error("Error fetching invites:", error);
          return;
        }

        // Fetch trip details and inviter profile pictures
        const invitesWithDetails = await Promise.all(
          data.map(async (invite) => {
            // Fetch trip details
            const { data: tripData } = await supabase
              .from("itineraries")
              .select("name")
              .eq("id", invite.trip_id)
              .single();

            // Fetch inviter profile picture and username
            const { data: inviterProfile } = await supabase
              .from("profiles")
              .select("username, profile_pic_url")
              .eq("id", invite.inviter_id)
              .single();

            return {
              title: "Trip Invitation",
              content: `${inviterProfile?.username} invited you to join "<strong>${tripData?.name}</strong>"`,
              date: invite.time_stamp,
              profilePic: inviterProfile?.profile_pic_url || "https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/profile-pictures//default_profpic.jpg",
              id: invite.id,
            };
          })
        );

        this.invitedTasks = invitesWithDetails.sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log("Fetched Invites:", this.invitedTasks);
      } catch (err) {
        console.error("Unexpected error fetching invites:", err);
      }
    },

    openInviteModal(item) {
      this.selectedItem = item;
      this.showInviteModal = true;
      this.loading = true;  // Set loading state to true before fetching data
      console.log(this.selectedItem );
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
        alert("Invites have been sent!"); // Show popup
        this.showInviteModal = false;
        this.$router.push("/dashboard");
      }
    } else {
      // Show all invalid items with appropriate alerts
      alert(`Some invitations could not be sent:\n\n${invalidItems.join("\n")}`);
    }
  },


    async fetchOwnerProfile() {
      try {
        console.log("Fetching profile for owner:", this.selectedItem.ownerId);

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
          picture: data.profile_pic_url || "https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/profile-pictures//default_profpic.jpg",
          name: data.full_name,
          username: data.username,
        };

        console.log("Fetched Owner Profile:", this.ownerProfile);

        // Fetch members' profiles
        const { data: memberIds, error: memberIdsError } = await supabase
            .from('itinerary_members')
            .select('user_id')
            .eq('itinerary_id', this.selectedItem.id);

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
          console.log("Fetched Members:", this.members);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        this.loading = false;  // Ensure loading is false when data fetching completes
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

    handleClickOutside(event) {
        if (!this.$el.contains(event.target)) {
          this.showMenu = false;
        }
      }

  }
  };

</script>


<style scoped>
@import "../assets/styles/dashboard.css"; /* Import external CSS file */
</style>


