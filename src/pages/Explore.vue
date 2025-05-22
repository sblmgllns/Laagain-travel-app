<script setup>
import { ref, computed, onMounted } from 'vue';
import { cards } from '../assets/scripts/explore.js';
import { supabase } from '../supabase';


const profilePicUrl = ref(null);
const modalItem = ref(null);
const activeTab = ref('attractions');
const bookmarkedItems = ref([]);
const userId = ref(null);
const userTrips = ref([]);
const selectedTripId = ref('');

// Get current user on mount
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
  userId.value = user.id;
  console.log(userId.value);
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

  // Load bookmarks
  await loadBookmarks();
  await loadUserTrips();
});

const handleAddActivity = async (item) => {
  console.log("here", item.title);
  const newActivity = {
    name: item.title,
    description: "",
    location: "",
    date: "",
    start_time: null,
    end_time: null,
    itinerary_id: selectedTripId.value,
  };

  try {
    const { error } = await supabase.from('potential_activities').insert(newActivity);

    if (error) {
      console.error("Error inserting activity:", error.message);
    } else {
      console.log("Activity inserted successfully");

      // Close modal
      const modalEl = document.getElementById("detailsModal");
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) {
        modalInstance.hide();
      }

      // Show notification (simple toast or alert)
      const alert = document.createElement("div");
      alert.className = "alert alert-success position-fixed top-0 end-0 m-3";
      alert.style.zIndex = 1055;
      alert.innerText = "Activity added successfully!";
      document.body.appendChild(alert);

      // Auto-remove after 3 seconds
      setTimeout(() => {
        alert.remove();
      }, 5000);
      window.location.reload();
    }
  } catch (err) {
    console.error("Unexpected error inserting activity:", err);
  }
};

async function loadUserTrips() {
  if (!userId.value) return;

  try {
    // Fetch owned trips (only id and name)
    const { data: ownedTrips, error: ownedError } = await supabase
      .from('itineraries')
      .select('id, name')
      .eq('owner_id', userId.value);

    if (ownedError) throw ownedError;

    // Fetch member trips (only id and name)
    const { data: memberTrips, error: memberError } = await supabase
      .from('itinerary_members')
      .select(`
        itineraries:itinerary_id (id, name)
      `)
      .eq('user_id', userId.value);

    if (memberError) throw memberError;

    // Format and combine results
    const formattedOwnedTrips = ownedTrips.map(trip => ({
      id: trip.id,
      name: trip.name
    }));

    const formattedMemberTrips = memberTrips.map(member => ({
      id: member.itineraries.id,
      name: member.itineraries.name
    }));

    userTrips.value = [...formattedOwnedTrips, ...formattedMemberTrips];
  } catch (error) {
    console.error('Error loading trips:', error);
  }
}

async function loadBookmarks() {
  if (!userId.value) return;
  
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId.value);

  if (error) {
    console.error('Error loading bookmarks:', error);
    return;
  }

  bookmarkedItems.value = data.map(item => ({
    id: item.card_id,
    title: item.title,
    image: item.image,
    category: item.category,
    price: item.price,
    type: item.type,
    rating: item.rating || 0,
    reviews: item.reviews || 0,
    booked: item.booked || ''
  }));
}

async function toggleBookmark(item) {
  if (!userId.value) {
    console.error('User not logged in');
    return;
  }

  console.log("Toggle", item);
  // Generate an ID if one doesn't exist (fallback)
  const cardId = item.id;
  const isBookmarked = bookmarkedItems.value.some(bookmark => 
    bookmark.id === cardId || bookmark.title === item.title
  );

  try {
    if (isBookmarked) {
      // Remove bookmark
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId.value)
        .or(`card_id.eq.${cardId},title.eq.${item.title}`);

      if (error) throw error;
      bookmarkedItems.value = bookmarkedItems.value.filter(
        bookmark => bookmark.id !== cardId && bookmark.title !== item.title
      );
    } else {
      // Add bookmark
      const { error } = await supabase
        .from('bookmarks')
        .insert([
          { 
            user_id: userId.value, 
            card_id: cardId,
            title: item.title, // Store title as fallback
            image: item.image,
            category: item.category,
            price: item.price,
            type: item.type
          }
        ]);

      if (error) throw error;
      bookmarkedItems.value = [...bookmarkedItems.value, { ...item, id: cardId }];
    }
  } catch (error) {
    console.error('Bookmark error:', error);
  }
}

function isBookmarked(item) {
  if (!item || !item.id || !bookmarkedItems.value) return false;
  return bookmarkedItems.value.some(bookmark => bookmark.id === item.id);
}

function showDetails(item) {
  modalItem.value = item;
}

const filteredCards = computed(() => {
  if (activeTab.value === 'bookmarks') {
    return bookmarkedItems.value;
  }
  return results.value.filter(card => card.type === activeTab.value);
}); 

const searchQuery = ref('');
const isLoading = ref(false)
const results = ref([])
const errorMessage = ref('')

async function fetchTripResults() {
  console.log("fetching data in Supabase");
  errorMessage.value = '';
  if (!searchQuery.value) {
    errorMessage.value = 'Please enter a search query.';
    return;
  }

  isLoading.value = true;

  try {
    const { data: searchData, error: searchError } = await supabase.functions.invoke('new-trip-search', {
      method: 'POST',
      body: {
        searchQuery: searchQuery.value,
        language: 'en',
        category: activeTab.value,
      }
    });

    if (searchError || !Array.isArray(searchData?.data)) {
      errorMessage.value = searchError?.message || 'Failed to fetch search results';
      results.value = [];
      return;
    }

    // Fetch photos for each locationId
    const locations = searchData.data;

    const enrichedResults = await Promise.all(locations.map(async (item) => {
      const locationId = item.location_id || item.id;

      // Default image fallback
      let imageUrl = 'fallback-image-url';

      // Attempt to get a photo for this location
      try {
        const { data: photoData } = await supabase.functions.invoke('get-trip-photos', {
          method: 'POST',
          body: {
            locationId,
            language: 'en',
            limit: 1, // just get the first photo
            source: 'Traveler'
          }
        });

        // Grab the first photo URL if it exists
        if (Array.isArray(photoData?.data) && photoData.data[0]?.images?.original?.url) {
          imageUrl = photoData.data[0].images.original.url;
        }
      } catch (photoErr) {
        console.warn(`Failed to fetch photo for location ${locationId}`, photoErr);
      }

      return {
        id: locationId,
        image: imageUrl,
        category: item.address_obj?.street1
          ? `${item.address_obj.street1}, ${item.location_string || ''}`
          : item.location_string || 'Unknown Location',
        title: item.name,
        rating: item.rating || 0,
        reviews: item.num_reviews || 0,
        booked: 'N/A',
        price: parseFloat(item.price_level?.replace(/[^0-9.]/g, '')) || 0,
        type: activeTab.value,
      };
    }));

    results.value = enrichedResults;
    console.log("Enriched results", enrichedResults);

  } catch (err) {
    errorMessage.value = err.message || 'An error occurred during fetch';
    results.value = [];
  } finally {
    isLoading.value = false;
  }
}


</script>

<template>
  <div class="results-page">

    <main class="results">
      <div class="results-header d-flex justify-content-between align-items-center">
        <form class="search-form d-flex" role="search" @submit.prevent="fetchTripResults">
          <div class="input-group rounded-input">
            <span class="input-group-text bg-white border-end-0">
              <i class="bi bi-search"></i>
            </span>
            <input
              v-model="searchQuery"
              :disabled="isLoading"
              placeholder="Search"
            />
            <button class="btn btn-primary"  type="submit" :disabled="isLoading">Search</button>
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

      <div v-if="isLoading" class="text-center my-4">Loading results...</div>
      <div v-if="errorMessage" class="text-danger text-center my-4">Error: {{ errorMessage.message }}</div>

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

        <button
          class="btn me-2"
          :class="{'btn-primary': activeTab === 'restaurants', 'btn-outline-primary': activeTab !== 'restaurants'}"
          @click="activeTab = 'restaurants'"
        >
          Restaurants
        </button>
      </div>

      <div class="card-grid">
        <div class="result-card" v-for="(item, index) in filteredCards" :key="index">
          <img :src="item.image" class="card-img-top" />

          <div class="card-body">
            <p class="category">{{ item.category }}</p>
            <h6 class="card-title">{{ item.title }}</h6>

            <button
              class="btn btn-outline-primary btn-sm"
              data-bs-toggle="modal"
              data-bs-target="#detailsModal"
              @click="showDetails(item)"
            >
              View Details
            </button>
            <button class="btn" @click="toggleBookmark(item)">
              <i
                class="bi"
                :class="{
                  'bi-bookmark-fill bookmark-yellow': isBookmarked(item),
                  'bi-bookmark': !isBookmarked(item)
                }"
              ></i>
            </button>
          </div>
        </div>
      </div>
    </main>

  </div>


    <!-- Location Modal -->
    <div class="modal fade" id="locationModal" tabindex="-1" aria-labelledby="locationModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="loc-modal modal-content rounded-4 p-3">

            <div class="modal-body">
                <!-- Search bar -->
                <input
                  type="text"
                  class="form-control form-control-lg mb-4 rounded-pill px-4"
                  placeholder="Search by city, region or country"
                />
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
                    <button 
                      class="btn"
                      @click="toggleBookmark(modalItem)"
                    >
                      <i 
                        class="bi"
                        :class="{
                          'bi-bookmark-fill text-primary': isBookmarked(modalItem),
                          'bi-bookmark': !isBookmarked(modalItem)
                        }"
                      ></i>
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

                        <select class="form-select w-auto" v-model="selectedTripId">
                          <option disabled value="">Select a Trip</option>
                          <option 
                            v-for="trip in userTrips" 
                            :key="trip.id" 
                            :value="trip.id"
                          >
                            {{ trip.name }}
                          </option>
                        </select>
                        </div>
                        <button @click="handleAddActivity(modalItem)" class="btn btn-primary">
                          Add
                        </button>
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
