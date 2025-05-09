<script setup>
import { ref , computed , onMounted} from 'vue';

//separate file for the data retrievals para not so gubot
import {cards} from '../assets/scripts/explore.js';

import { supabase } from '../supabase' // adjust path if needed

const profilePicUrl = ref(null)

onMounted(async () => {
  // 1. Get current user
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError) {
    console.error('Error getting user:', userError)
    return
  }

  // 2. Fetch user record from 'users' table
  const { data, error } = await supabase
    .from('profiles')
    .select('profile_pic_url')
    .eq('id', user.id) // assuming your 'users' table uses auth user id
    .single()

  if (error) {
    console.error('Error fetching profile_pic_url:', error)
  } else {
    profilePicUrl.value = data.profile_pic_url
  }
})

const modalItem = ref(null);
function showDetails(item) {
  modalItem.value = item
}

const activeTab = ref('attractions')

console.log('cards is', cards)
console.log('cards.value is', cards.value)

const filteredCards = computed(() =>
  cards.value.filter(card => card.type === activeTab.value)
)

</script>

<template>
    <!-- Fixed Top Bar -->
    <div class="top-bar w-100 d-flex align-items-center">
        <div class="col-auto d-flex align-items-center justify-content-center">
          <img 
            :src="profilePicUrl" 
            alt="Profile Picture" 
            class="rounded-circle border border-white shadow-sm img-fluid"
            style="width: 80px; height: 80px; object-fit: cover;" 
          />
        </div>

    </div>

  <div class="results-page">

    <aside class="sidebar">
        <div class="filter-group">
            <h5>Location</h5>
            <button class="select-loc-btn btn btn-outline-primary d-flex align-items-center gap-2" type="button" data-bs-toggle="modal" data-bs-target="#locationModal">
                <i class="bi bi-geo-alt"></i>
                <span>Select location</span>
            </button>
        </div>

      <div class="filter-group">
        <h5>Price range</h5>
        <input type="range" class="form-range" min="0" max="1042" />
        <div class="d-flex justify-content-between">
          <span>PHP 0</span>
          <span>PHP 1000</span>
        </div>
      </div>
    </aside>

    <main class="results">
      <div class="results-header d-flex justify-content-between align-items-center">
        <form class="search-form d-flex" role="search">
            <div class="input-group rounded-input">
                <span class="input-group-text bg-white border-end-0">
                    <i class="bi bi-search"></i>
                </span>
                <input type="search"  class="input-bar" placeholder="Search" aria-label="Search">
                <!-- <button class="btn btn-primary" type="submit">Search</button> -->
            </div>
        </form>

        <h6>{{ filteredCards.length }} results found</h6>

        <select class="form-select w-auto">
          <option selected>Relevance</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
          <option>Rating: High to Low</option>
          <option>Rating: Low to High</option>
        </select>
      </div>

      <!-- Tabs -->
      <div class="d-flex tabs my-3">
        <button
          class="btn me-2"
          :class="{'btn-primary': activeTab === 'bookmarks', 'btn-outline-primary': activeTab !== 'bookmarks'}"
          @click="activeTab = 'bookmarks'"
        >
          Bookmarks
        </button>

        <button
          class="btn me-2"
          :class="{'btn-primary': activeTab === 'attractions', 'btn-outline-primary': activeTab !== 'attractions'}"
          @click="activeTab = 'attractions'"
        >
          Attractions
        </button>

        <button
          class="btn me-2"
          :class="{'btn-primary': activeTab === 'hotels', 'btn-outline-primary': activeTab !== 'hotels'}"
          @click="activeTab = 'hotels'"
        >
          Hotels
        </button>
      </div>

      <div class="card-grid">
        <div class="result-card" v-for="(item, index) in filteredCards" :key="index">
          <img :src="item.image" class="card-img-top" />
          <div class="card-body">
            <p class="category">{{ item.category }}</p>
            <h6 class="card-title">{{ item.title }}</h6>
            <div class="rating">
              <i class="bi bi-star-fill text-warning"></i> {{ item.rating }} ({{ item.reviews }}) • {{ item.booked }}
            </div>
            <p class="price">From US$ {{ item.price.toFixed(2) }}</p>
            <button
            class="btn btn-outline-primary btn-sm"
            data-bs-toggle="modal"
            data-bs-target="#detailsModal"
            @click="showDetails(item)"
            >
            View Details
            </button>
            <button id="bookmarkBtn" class="btn">
                <i id="bookmarkIcon" class="bi bi-bookmark"></i>
            </button>
          </div>
        </div>
      </div>
    </main>

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


    <!-- Location Modal -->
    <div class="modal fade" id="locationModal" tabindex="-1" aria-labelledby="locationModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="loc-modal modal-content rounded-4 p-3">

            <div class="modal-body">
                <!-- Search bar -->
                <input type="text" class="form-control form-control-lg mb-4 rounded-pill px-4" placeholder="Search by city, region or country">

                <!-- Country and city options -->
                <div class="mb-3">
                <div class="mt-2 d-flex flex-wrap gap-2 ps-4">
                    <span class="btn btn-outline-secondary rounded-pill">Cebu</span>
                    <span class="btn btn-outline-secondary rounded-pill">Bohol</span>
                    <span class="btn btn-outline-secondary rounded-pill">Tacloban</span>
                </div>
                </div>
            </div>

            <!-- Footer with Clear and Confirm -->
            <div class="modal-footer border-0 justify-content-between">
                <button type="button" class="btn btn-link text-decoration-none">Clear</button>
                <button type="button" class="btn btn-warning text-white px-4">Confirm</button>
            </div>

            </div>
        </div>
    </div>

    <!-- Details ModAL -->
    <div class="modal fade" id="detailsModal" tabindex="-1" aria-labelledby="detailsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="detailsModalLabel">{{ modalItem?.title }}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body d-flex flex-column flex-md-row">
                <img :src="modalItem?.image" class="img-fluid me-md-3 mb-3" style="max-width: 300px;" />
                <div>
                    <div class="justify-content-start">
                        <p class="text-muted">{{ modalItem?.category }}</p>
                        <p><strong>Price:</strong> US$ {{ modalItem?.price?.toFixed(2) }}</p>
                        <p><strong>Rating:</strong> {{ modalItem?.rating }} ({{ modalItem?.reviews }})</p>
                        <p><strong>Booked:</strong> {{ modalItem?.booked }}</p>
                        <p><strong>Website:</strong> <a href="#">Visit site</a></p>
                    </div>
                    <button id="bookmarkBtn" class="btn">
                        <i id="bookmarkIcon" class="bi bi-bookmark"></i>
                    </button>
                    <div class="d-flex justify-content-end mt-3">
                        <div class="dropdown me-2">
                        <!-- <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            Choose Itinerary
                        </button>
        
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#">Favorites</a></li>
                            <li><a class="dropdown-item" href="#">Wishlist</a></li>
                        </ul> -->

                        <select class="form-select w-auto">
                            <option selected>Trip 1</option>
                            <option >Trip 2</option>
                            <option >Trip 3</option>
                        </select>
                        </div>
                        <button class="btn btn-danger"> Add</button>
                    </div>
                </div>
            </div>
            </div>
        </div>
    </div>


</template>


<style scoped>
@import "../assets/styles/explore.css"; /* Import external CSS file */
</style>
