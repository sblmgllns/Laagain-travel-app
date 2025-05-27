<template>
    <!-- header Photo+search-->
    <div class="container-parent">
      <div class="Header-container">  


        <!-- Overlay Content -->
        <div class="header-overlay text-center">
          <!-- Headline and Subhead First -->
          <div class="header-text">
            <h1 class="headline">Plan Trips Together, the Laagain Way.</h1>
            <p class="subhead">Laagain is your collaborative platform to effortlessly plan and share travel adventures with friends.</p>
          </div>

          <!-- Search Bar BELOW the text -->
          <form class="search-form d-flex justify-content-center" role="search" @submit.prevent="fetchTripResults">
            <div class="search-box d-flex flex-row gap-0 input-group w-100">
              <div id="searchIconContainer">
                <i class="bi bi-search text-muted"></i>
              </div>
              <div id="searchQueryContainer">
                <input
                  v-model="searchQuery"
                  :disabled="isLoading"
                  class="inputField"
                  placeholder="Search"
                />
              </div>
              <div style="width: 30%;">
                <button class="btn btn-primary search-btn" type="submit" :disabled="isLoading">Search</button>
              </div>
            </div>
          </form>
        </div>


        <!-- image -->
        <img class="header-image" src="https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//header.jpg" alt="">
      </div>
    </div>


    <!-- New UI Main Content -->
    <div class="container-fluid w-100 bg-white">
      <!-- My Trips-->
      <div class="my-trips-container">
        <h1 class="my-trips-title">My Trips</h1>
      </div>

      <!-- Tabs -->
      <div class="tab-section">
        <ul class="underline-tabs">
          <li
            class="underline-tab"
            :class="{ active: activeTab === 'active' }"
            @click="activeTab = 'active'"
          >
            Active
          </li>
          <li
            class="underline-tab"
            :class="{ active: activeTab === 'completed' }"
            @click="activeTab = 'completed'"
          >
            Completed
          </li>
          <li
            class="underline-tab"
            :class="{ active: activeTab === 'invited' }"
            @click="activeTab = 'invited'"
          >
            Shared
          </li>
        </ul>
      </div>

      <!-- new ui active tab -->
      <div v-if="activeTab === 'active'" class="row justify-content-start">
        <div class="status-container">
          <h5 class="status-title">Now Traveling</h5>
          <div class="underline"></div>
        </div>

        <div v-if="activeNowTasks.length">

          <div class="responsive-scroll-container">
            <div class="responsive-scroll-inner">

              <div class="card-grid" v-for="(task, index) in activeNowTasks" :key="index">

                <div class="result-card h-100">
                      <span class="trip-menu" @click.stop="toggleMenu(task.id)">
                        <i class="bi bi-three-dots"></i>

                        <div v-if="showMenus[task.id]" class="menu-options">
                          <template v-if="task.ownerId == user.id">
                            <a href="#" @click.stop="deletePost(task.id, index, 'activeNowTasks')">Delete</a>
                            <a @click.stop="openInviteModal(task)">Share</a>
                          </template>
                          <template v-else>
                            <a href="#" @click.stop="leaveTrip(task.id, index, 'activeNowTasks')">Leave</a>
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

        <div class="status-container">
          <h5 class="status-title">Upcoming Trip</h5>
          <div class="underline"></div>
        </div>
        
        <div v-if="activeUpcomingTasks.length"> 
          <div class="responsive-scroll-container">
            <div class="responsive-scroll-inner">
              <div class="card-grid" v-for="(task, index) in activeUpcomingTasks" :key="index">
                <div class="result-card h-100">
                      <!-- Three dots menu (top-right corner over image) -->
                      <div
                        class="trip-menu position-absolute top-0 end-0 m-2"
                        @click.stop="toggleMenu(task.id)"
                      >
                        <i class="bi bi-three-dots fs-5"></i>

                        <div v-if="showMenus[task.id]" class="menu-options">
                          <template v-if="task.ownerId == user.id">
                            <a href="#" @click.stop="deletePost(task.id, index, 'activeUpcomingTasks')">Delete</a>
                            <a @click.stop="openInviteModal(task)">Share</a>
                          </template>
                          <template v-else>
                            <a href="#" @click.stop="leaveTrip(task.id, index, 'activeUpcomingTasks')">Leave</a>
                          </template>
                        </div>
                      </div>

                      <!-- Image -->
                      <img
                        :src="task.image || 'https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//default_trip_photo.jpeg'"
                        @click="navigateToEditItinerary(task.id)"
                        class="card-img-top"
                        style="cursor: pointer;"
                      />

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
    
      <!-- new ui completed tab -->
      <div v-if="activeTab === 'completed'" class="row justify-content-start">

        <div v-if="completedTasks.length">
          <div class="responsive-scroll-container">
            <div class="responsive-scroll-inner">
              <div class="card-grid" v-for="(task, index) in completedTasks" :key="index">
                
                <div class="result-card h-100">
                                            <!-- Three dots menu (top-right corner over image) -->
                      <div
                        class="trip-menu position-absolute top-0 end-0 m-2"
                        @click.stop="toggleMenu(task.id)"
                      >
                        <i class="bi bi-three-dots fs-5"></i>

                        <div v-if="showMenus[task.id]" class="menu-options">
                          <template v-if="task.ownerId == user.id">
                            <a href="#" @click.stop="deletePost(task.id, index, 'completedTasks')">Delete</a>
                            <a @click.stop="openInviteModal(task)">Share</a>
                          </template>
                          <template v-else>
                            <a href="#" @click.stop="leaveTrip(task.id, index, 'completedTasks')">Leave</a>
                          </template>
                        </div>
                      </div>

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

      <!-- Invited Tab -->
      <!-- Invited Tab -->
    <div v-if="activeTab === 'invited'" class="row justify-content-start">

      <div class="status-container">
        <h5 class="status-title">Invites</h5>
        <div class="underline"></div>
      </div>

      <div v-if="invitedTasks.length">
        <div class="responsive-scroll-container">
          <div class="responsive-scroll-inner">

            <div class="card-grid" v-for="(task, index) in invitedTasks" :key="index">

              <div class="result-card-inv h-100">
                    
                    <img :src="task.image || 'https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//default_trip_photo.jpeg'" class="invite-img" />

                    <div class="card-body">
                      <div class="card-name">
                          <!-- NEW WRAPPER START -->
                        <div class="invite-main">
                          <!-- Profile Picture -->
                          <div class="inviter-img">
                            <img :src="task.profilePic" alt="Inviter Profile Picture" class="rounded-circle" />
                          </div>

                          <!-- Content & Time Ago -->
                          <div class="invite-text">
                            <div class="content">
                              <h5 class="card-title fw-bold mb-1">{{ task.title }}</h5>
                              <p class="card-text" v-html="task.content"></p>
                            </div>
                            <div class="time-ago">
                              <small><em>{{ timeAgo(task.date) }}</em></small>
                            </div>
                          </div>
                        </div>


                      </div>
                        
                      <div class="invite-actions">
                        <template v-if="!task.status">
                          <div
                            class="btn btn-light fw-bold fs-5 approve-btn"
                            @click="updateInviteStatus(task.id, 'approved')"
                            style="background-color: #089dcf; color: white"
                          >
                            Accept
                          </div>
                          <div
                            class="btn btn-light fw-bold fs-5 decline-btn"
                            @click="updateInviteStatus(task.id, 'declined')"
                            style="background-color: #666; color: white"
                          >
                            Decline
                          </div>
                        </template>
                        <template v-else>
                          <p class="fw-semibold" :style="{ color: task.status === 'approved' ? '#089dcf' : '#666' }">
                            You {{ task.status === 'approved' ? 'accepted' : 'declined' }} this invite.
                          </p>
                        </template>
                      </div>
                      
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
        <p class="text-muted">No invites found.</p>
      </div>

      
        <div class="status-container">
          <h5 class="status-title">Shared Trips</h5>
          <div class="underline"></div>
        </div>
        
        <div v-if="sharedTasks.length"> 
          <div class="responsive-scroll-container">
            <div class="responsive-scroll-inner">
              <div class="card-grid" v-for="(task, index) in sharedTasks" :key="index">
                <div class="result-card h-100">
                      <!-- Three dots menu (top-right corner over image) -->
                      <div
                        class="trip-menu position-absolute top-0 end-0 m-2"
                        @click.stop="toggleMenu(task.id)"
                      >
                        <i class="bi bi-three-dots fs-5"></i>

                        <div v-if="showMenus[task.id]" class="menu-options">
                          <template v-if="task.ownerId == user.id">
                            <a href="#" @click.stop="deletePost(task.id, index, 'invitedTasks')">Delete</a>
                            <a @click.stop="openInviteModal(task)">Share</a>
                          </template>
                          <template v-else>
                            <a href="#" @click.stop="leaveTrip(task.id, index, 'invitedTasks')">Leave</a>
                          </template>
                        </div>
                      </div>

                      <!-- Image -->
                      <img
                        :src="task.image || 'https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//default_trip_photo.jpeg'"
                        @click="navigateToEditItinerary(task.id)"
                        class="card-img-top"
                        style="cursor: pointer;"
                      />

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
        isEditMode: false,
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
          id: '',
          picture: '',
          name: '',
          username: '',
        },
        members: {},
        inviteEmail: "",
        newMemberEmail: "",
        tripMembersInput: '', // Stores the input field value (current email to add)
        tripMembers: [],
        activeNowTasks: [],
        activeUpcomingTasks: [],
        completedTasks: [],
        invitedTasks: [],
        sharedTasks:[], 
        showMenus: {},

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
        await this.fetchSharedTrips();
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

    toggleMenu(taskId) {
    // Toggle the clicked menu and close all others
    this.$set(this.showMenus, taskId, !this.showMenus[taskId]);
    },

    closeAllMenus() {
      this.showMenus = {};
    },

    handleClickOutside(event) {
      // Only close menus if the click is outside the trip menu or menu-options
      if (
        !event.target.closest('.trip-menu') &&
        !event.target.closest('.menu-options')
      ) {
        this.closeAllMenus();
      }
    },

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
        this.isEditMode = false;

      } catch (err) {
        this.isEditMode = false;
        console.error('Error removing member:', err.message);
        alert('Could not remove member.');
      }
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

          if (Array.isArray(this.tasks)) {
            const task = this.tasks.find(t => t.id === id);
            if (task) {
              task.status = newStatus;
            }
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

          // ✅ Step 7: If declined, delete invite from trip_invites to allow re-invite
        if (newStatus === "declined") {
          const { error: deleteError } = await supabase
            .from("trip_invites")
            .delete()
            .eq("id", id);

          if (deleteError) {
            console.error("Error deleting declined invite:", deleteError.message);
          } else {
            console.log(`Declined invite ${id} removed to allow future reinvitation.`);
          }
        }
        
        // Refresh lists
        this.fetchInvites();
        this.fetchSharedTrips();
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
        this.completedTasks = [];
        this.activeUpcomingTasks = [];

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

    async fetchSharedTrips() {
      try {
        // Fetch itineraries where the user is a member (not owner)
        const { data: memberTrips, error: memberError } = await supabase
          .from("itinerary_members")
          .select("itinerary_id, itineraries!itinerary_members_itinerary_id_fkey(id, owner_id, name, start_date, end_date, cover_pic_url, place)")
          .eq("user_id", this.user.id)
          .neq("itineraries.owner_id", this.user.id); // Exclude owned itineraries

        if (memberError) {
          console.error("Error fetching shared trips:", memberError);
          this.errorMessage = "Failed to load shared trips.";
          return;
        }

        // Map the shared trips into task format
        const sharedTripsFormatted = memberTrips.map((entry) => {
          const trip = entry.itineraries;
          return {
            id: trip.id,
            title: trip.name,
            ownerId: trip.owner_id,
            date: `${trip.start_date} - ${trip.end_date}`,
            content: trip.place,
            image: trip.cover_pic_url || ""
          };
        });

        // Push to sharedTasks
        this.sharedTasks = sharedTripsFormatted;
        console.log("Shared Trips:", this.sharedTasks);
      } catch (err) {
        console.error("Unexpected error fetching shared trips:", err);
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
              .select("name, cover_pic_url")
              .eq("id", invite.trip_id)
              .single();

            // Fetch inviter profile picture and username
            const { data: inviterProfile } = await supabase
              .from("profiles")
              .select("username, profile_pic_url")
              .eq("id", invite.inviter_id)
              .single();

            return {
              content: `${inviterProfile?.username} invited you to join "<strong>${tripData?.name}</strong>"`,
              date: invite.time_stamp,
              profilePic: inviterProfile?.profile_pic_url || "https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/profile-pictures//default_profpic.jpg",
              image: tripData?.cover_pic_url || "",
              id: invite.id,
              status: null // can be 'approved' or 'declined'
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
      this.isEditMode = false;
    },

    closeInviteModal() {
      this.tripMembers = ""; 
      this.isEditMode = false;
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
          this.isEditMode = false;
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
          .select('full_name, username, profile_pic_url, id')
          .eq('id', this.selectedItem.ownerId)  // Fetch based on owner ID
          .single();

        if (error) {
          console.error('Error fetching owner profile:', error);
          this.loading = false;  // Set loading to false on error
          return;
        }

        // Update the ownerProfile with the fetched data
        this.ownerProfile = {
          id: data.id,
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
            .select('full_name, username, profile_pic_url, id')
            .in('id', userIds);

          if (membersError) throw membersError;

          this.members = membersData.map(member => ({
            id: member.id,
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

    toggleMenu(tripId) {
      // Close all other menus and toggle the clicked one
      this.showMenus = {
        [tripId]: !this.showMenus[tripId],
      };
    },


    async deletePost(itinerary_id, index, listName = "activeNowTasks") {
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
          this.showMenus[index] = false;
          alert("You cannot delete this itinerary because you are not the owner.");
          return;
        }

        // Ask for confirmation before deleting
        if (!confirm("Are you sure you want to delete this itinerary?")) {
          this.showMenus[index] = false;
          return;
        }

        // Proceed with deletion if user is the owner
        const { error: deleteError1  } = await supabase
          .from("potential_activities")
          .delete()
          .eq("itinerary_id", itinerary_id);

        if (deleteError1 ) {
          console.error("Error deleting itinerary:", deleteError);
          this.showMenus[index] = false;
          alert("Failed to delete itinerary. Try again.");
          
          return;
        }

        // Proceed with deletion if user is the owner
        const { error: deleteError2 } = await supabase
          .from("itineraries")
          .delete()
          .eq("id", itinerary_id);

        if (deleteError2) {
          console.error("Error deleting itinerary:", deleteError);
          this.showMenus[index] = false;
          alert("Failed to delete itinerary. Try again.");
          
          return;
        }

      
        this.showMenu = false;
        this.showMenus[index] = false;
        alert("Itinerary deleted successfully!");
        this[listName].splice(index, 1);

      } catch (err) {
        console.error("Unexpected error:", err);
        this.showMenus[index] = false;
        alert("Something went wrong.");
      }
    },

    /////LEAVE GROUP 
    async leaveTrip(tripId, index, listName = "activeNowTasks") {
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
          alert("You can't leave this trip because you are the owner.");
          this.showMenus[index] = false;
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

        // Send notification to the owner
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

        // Remove from appropriate task list
        if (["activeNowTasks", "activeUpcomingTasks", "completedTasks"].includes(listName)) {
          const list = this[listName];
          if (Array.isArray(list) && index >= 0 && index < list.length) {
            list.splice(index, 1);
          }
        }
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

