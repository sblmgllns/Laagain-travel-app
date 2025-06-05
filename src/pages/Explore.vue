<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { cards } from '../assets/scripts/explore.js';
  import { supabase } from '../supabase';
  import { watch } from 'vue';
  import { useRouter } from 'vue-router'


  const profilePicUrl = ref(null);
  const profileUsername = ref(null);
  const modalItem = ref(null);
  const activeTab = ref('bookmarks');
  const bookmarkedItems = ref([]);
  const userId = ref(null);
  const userTrips = ref([]);
  const selectedTripId = ref('');
   const selectedTripName = ref('');
   const router = useRouter();
   const current = router.currentRoute.value.fullPath

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
    //console.log(userId.value);
    // 2. Fetch user record from 'users' table
    const { data, error } = await supabase
      .from('profiles')
      .select('profile_pic_url, full_name')
      .eq('id', user.id) // assuming your 'users' table uses auth user id
      .single()

    if (error) {
      console.error('Error fetching profile_pic_url:', error)
    } else {
      profilePicUrl.value = data.profile_pic_url
      profileUsername.value = data.full_name
      //console.log("username is: ")
    }
    fetchRandomImage()
    // Load bookmarks
    await loadBookmarks();
    await loadUserTrips();
  });
  // random image for header background
  const API_KEY = 'JP7RawomxhGEzqwcex2gKAnbVckzjGvB0RILGBXN8o6h4sTKhICe0n2R'  // Replace this with your actual key
  const query = 'maldives'  // You can change to any keyword you want

  const backgroundImage = ref('')

  async function fetchRandomImage() {
    try {
      const response = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=15`, {
        headers: { Authorization: API_KEY }
      })
      const data = await response.json()
      if (data.photos && data.photos.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.photos.length)
        backgroundImage.value = data.photos[randomIndex].src.landscape
      }
    } catch (error) {
      console.error('Error fetching image:', error)
    }
  }

  const handleAddActivity = async (item) => {
    //console.log("here", item.title);
    const newActivity = {
      name: item.title,
      description: item.desc,
      location: item.category,
      date: "",
      start_time: null,
      end_time: null,
      itinerary_id: selectedTripId.value,
      activity_pic_url: item.image,
      username: profileUsername.value,
      profile_pic_url: profilePicUrl.value,
      type: "attraction",
      user_id: userId
    };

    try {
      const { error } = await supabase.from('potential_activities').insert(newActivity);

      if (error) {
        console.error("Error inserting activity:", error.message);
      } else {
        //console.log("Activity inserted successfully");

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
        // window.location.reload();
        // router.go();
        router.replace('/temp').then(() => router.replace(current))
      }
    } catch (err) {
      console.error("Unexpected error inserting activity:", err);
    }
  };

  async function loadUserTrips() {
    if (!userId.value) return;

    try {
      // Fetch owned trips (only id and name)
      const today = new Date().toISOString().split('T')[0]; // format: 'YYYY-MM-DD'

      const { data: ownedTrips, error: ownedError } = await supabase
        .from('itineraries')
        .select('id, name, end_date, cover_pic_url')
        .eq('owner_id', userId.value)
        .gte('end_date', today); // only include trips whose end_date is today or later


      if (ownedError) throw ownedError;

      // Fetch member trips (only id and name)
      const { data: memberTripsRaw, error: memberError } = await supabase
        .from('itinerary_members')
        .select(`
          itineraries:itinerary_id (id, name, end_date, cover_pic_url)
        `)
        .eq('user_id', userId.value);

      const memberTrips = memberTripsRaw?.filter(trip =>
        trip.itineraries?.end_date >= today
      );

      if (memberError) throw memberError;

      // Format and combine results
      const formattedOwnedTrips = ownedTrips.map(trip => ({
        id: trip.id,
        name: trip.name,
        pic: trip.cover_pic_url
      }));

      const formattedMemberTrips = memberTrips.map(member => ({
        id: member.itineraries.id,
        name: member.itineraries.name,
        pic: member.cover_pic_url
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
      booked: item.booked || '',
      desc: item.description,
      rating: item.rating,
      reviews: item.reviews,
      website: item.website,
      image_caption: item.img_caption,
      image_published: item.img_published
    }));
  }

  async function toggleBookmark(item) {
    if (!userId.value) {
      console.error('User not logged in');
      return;
    }

    //console.log("Toggle", item);
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
              type: item.type,
              description: item.desc,
              rating: item.rating,
              reviews: item.reviews,
              website: item.website,
              img_caption: item.image_caption,
              img_published: item.image_published
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

  const sortOrder = ref("default");
  const sortedCards = computed(() => {
    const cards = [...filteredCards.value]; // clone to avoid side effects

    switch (sortOrder.value) {
      case 'decreasing_rating':
        return cards.sort((a, b) => b.rating - a.rating);
      case 'increasing_rating':
        return cards.sort((a, b) => a.rating - b.rating);
      case 'decreasing_price':
        return cards.sort((a, b) => b.price.length - a.price.length);
      case 'increasing_price':
        return cards.sort((a, b) => a.price.length - b.price.length);
      default:
        return cards;
    }
  });

  const searchQuery = ref('');
  const locationQuery = ref("");
  const isLoading = ref(false)
  const results = ref([])
  const errorMessage = ref('')
  const isEditing = ref(false); //editing location field

  watch(activeTab, (newTab) => {
    if (newTab !== 'bookmarks') {
      fetchTripResults();
    }
    else if(newTab == 'bookmarks' && searchQuery!= ''){
      
    }
  });
  
  async function fetchTripResults() {
    //console.log("fetching data in Supabase");
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
          address: locationQuery.value
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

        let photoInfo = {};
        // Get photo
        try {
          const { data: photoData } = await supabase.functions.invoke('get-trip-photos', {
            method: 'POST',
            body: {
              locationId,
              language: 'en',
              limit: 1, // just get the first photo
            }
          });
        
          photoInfo = photoData || {};
          if (
            Array.isArray(photoData?.data) &&
            photoData.data.length > 0 &&
            photoData.data[0]?.images?.original?.url
          ) {
            imageUrl = photoData.data[0].images.original.url;
          } else {
            console.warn('No valid photo found for location', locationId, photoData);
          }
        } catch (photoErr) {
          console.warn(`Failed to fetch photo for location ${locationId}`, photoErr);
        }

        // Get additional location details
        let detailedInfo = {};
        try {
          const { data: detailData } = await supabase.functions.invoke('get-location-details', {
            method: 'POST',
            body: {
              locationId,
              language: 'en',
              currency: 'USD'
            }
          });

          detailedInfo = detailData || {};
        } catch (detailErr) {
          console.warn(`Failed to fetch details for location ${locationId}`, detailErr);
        }

        return {
          id: locationId,
          image: imageUrl,
          image_caption: photoInfo.data[0].caption || 'No Caption',
          image_published: photoInfo.data[0].published_date || 'No Publish Date',
          category: item.address_obj
            ? [
                detailedInfo.address_obj.street1,
                detailedInfo.address_obj.street2,
                detailedInfo.address_obj.city,
                detailedInfo.address_obj.state,
                detailedInfo.address_obj.country,
                detailedInfo.address_obj.postalcode
              ].filter(Boolean).join(', ')
            :  'Unknown Location',
          title: item.name,
          desc: detailedInfo.description || "No Description Available",
          website: detailedInfo.web_url || "No Website Available",
          rating: item.rating || detailedInfo.rating || 0,
          reviews: item.num_reviews || detailedInfo.num_reviews || 0,
          price: detailedInfo.price_level?.replace(/\$/g, '₱'),
          type: activeTab.value,
          url: detailedInfo.web_url || '',  // Optional extra
        };
      }));


      results.value = enrichedResults;
      //console.log("Enriched results", enrichedResults);
      // //console.log(photoData);

    } catch (err) {
      errorMessage.value = err.message || 'An error occurred during fetch';
      results.value = [];
    } finally {
      isLoading.value = false;
    }
  }
  
  const confirmButtonText = ref('Select Location');
  function confirmLocation() {
    const locationInput = document.getElementById('locationInput').value;
    if(locationInput.length == 0){
      confirmButtonText.value = "Select Location";
      locationQuery.value = '';
    }
    else{
      confirmButtonText.value = locationInput;
      locationQuery.value = locationInput;
    }
    fetchTripResults();
  }

  const isOpen = ref(false)
  const toggleDropdown = () => (isOpen.value = !isOpen.value)
  function selectTrip(tripId, tripName) {
    selectedTripId.value = tripId;
    selectedTripName.value = tripName;
    isOpen.value = false;
  }

</script>

<template>
    <!-- Fixed Top Bar -->
    <!-- <div class="top-bar w-100 d-flex align-items-center">
        <div class="col-auto d-flex align-items-center justify-content-center">
          <img 
            :src="profilePicUrl" 
            alt="Profile Picture" 
            class="rounded-circle border border-white shadow-sm img-fluid"
            style="width: 80px; height: 80px; object-fit: cover;" 
          />
        </div>
    </div> -->

  <div class="results-page">

    <main class="results">

      <!-- HEADER / SEARCH SECTION -->
      <div class="results-header" :style="{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : '' }" >
        <div class="d-flex flex-column align-items-center">
          <div id="planTripLabel"> Start Your Journey </div>
          <!-- <p class="text-muted" id="planTripDesc">
              Laagain turns group plans into shared adventures—
              with collaborative tools every step of the way.
          </p> -->
        </div>

        <!-- Search Bar -->
        <form class="search-form d-flex justify-content-center" role="search" @submit.prevent="fetchTripResults">
          <div class="search-box d-flex flex-row gap-0 input-group">
            <div id="searchIconContainer">
                <i class="bi bi-search text-muted"></i>
            </div>

            <div id="searchQueryContainer">
              <input
                v-model="searchQuery"
                :disabled="isLoading"
                class="inputField "
                placeholder="Start Your Journey ..."
              />
            </div>
            
            <div class="" style="width:30%;">
              <button class="btn btn-primary search-btn "  type="submit" :disabled="isLoading">  Search </button>
            </div>          
          </div>
        </form>

        <!-- Tabs -->
        <div class="tabs d-flex flex-row flex-wrap gap-2 tabs my-3 justify-content-center align-items-center">
          <button
            class="btn me-0 custom-tab-button"
            :class="{'btn-primary': activeTab === 'bookmarks', 'btn-outline-primary': activeTab !== 'bookmarks'}"
            @click="activeTab = 'bookmarks'"
          >
            Bookmarks
          </button>

          <button
            class="btn me-0 custom-tab-button"
            :class="{'btn-primary': activeTab === 'attractions', 'btn-outline-primary': activeTab !== 'attractions'}"
            @click="activeTab = 'attractions'"
          >
            Attractions
          </button>

          <button
            class="btn me-0 custom-tab-button"
            :class="{'btn-primary': activeTab === 'hotels', 'btn-outline-primary': activeTab !== 'hotels'}"
            @click="activeTab = 'hotels'"
          >
            Hotels
          </button>

          <button
            class="btn me-0 custom-tab-button"
            :class="{'btn-primary': activeTab === 'restaurants', 'btn-outline-primary': activeTab !== 'restaurants'}"
            @click="activeTab = 'restaurants'"
          >
            Restaurants
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="text-center my-4">Loading results...</div>

      <!-- SECONDARY OPTIONS SECTION  -->
      <div class="results-toolbar d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
        <div class="d-flex align-items-center gap-3">
          <!-- Location Select -->
          <button class="select-loc-btn btn btn-outline-primary d-flex align-items-center gap-2" type="button" data-bs-toggle="modal" data-bs-target="#locationModal">
            <div>
              <i class="bi bi-geo-alt"></i>
            </div>
            <div style="line-height: 1em;">
              {{ confirmButtonText }}
            </div>
          </button>

          <!-- Sort Filters --> 
          <select v-model="sortOrder" class="form-select w-auto custom-select">
            <option value="default" selected>Relevance</option>
            <option value="decreasing_price">Price: High to Low</option>
            <option value="decreasing_rating">Rating: High to Low</option>
            <option value="increasing_price">Price: Low to High</option>
            <option value="increasing_rating">Rating: Low to High</option>
          </select>
        </div>

        <!-- Results Found -->
        <h6 class="mb-0 text-end text-muted">{{ filteredCards.length }} result/s found</h6>
      </div>

      <!-- RESULTS SECTION -->
      <div class="card-grid">
        <div class="result-card" v-for="(item, index) in sortedCards" :key="index">
          <img :src="item.image" class="card-img-top" />

          <div class="card-body">
            <p class="category">{{ item.category }}</p>
            <h6 class="card-title">{{ item.title }}</h6>
            <div class="rating">
              <i class="bi bi-star-fill text-warning"></i>
              {{ item.rating }} ({{ item.reviews }})
            </div>
            <p class="price">{{ item.price }}</p>
            <button
              class="viewDetailsBtn btn btn-outline-primary btn-sm"
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

    <teleport to="body">
    <!--Select Location Modal -->
    <div class="modal fade" id="locationModal" tabindex="-1" aria-labelledby="locationModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="loc-modal modal-content rounded-4 p-3">

          <!-- Header with label and close icon -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="modal-title fw-bold" id="locationModalLabel">Select Location</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body pt-0">
            <!-- Search bar -->
            <input id="locationInput"
              type="text"
              class="form-control form-control-lg mb-4 rounded-pill px-4"
              placeholder="Search by city, region or country"
              value=''
            />
          </div>

          <!-- Footer with Clear and Confirm -->
          <div class="modal-footer border-0 d-flex justify-content-center">
            <!-- <button type="button" class="btn btn-link text-decoration-none" @click="locationQuery = ''" >Clear</button> -->
            <button type="button" class="btn btn-warning text-white px-4" @click="confirmLocation" data-bs-dismiss="modal" aria-label="Close">Confirm</button>
          </div>

        </div>
      </div>
    </div>
    </teleport>

    <teleport to="body">
    <!-- Details ModaL -->
    <div class="modal fade" id="detailsModal" tabindex="-1" aria-labelledby="detailsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered overflow-auto">
            <div class="modal-content d-flex">
              
              <!-- image part -->
              <div class="modal-header">
                  <div style="background-color: white; height: 90%; margin-bottom: 10px;">
                    <img :src="modalItem?.image" class="img-fluid me-md-3 mb-3 " style="width:100%; height:100%;object-fit:cover; border-radius:8px;"/>
                  </div>
                  <p class="text-muted text-start">{{ modalItem?.image_caption }} || {{ modalItem?.image_published }} </p> 
              </div>

              <!-- details part -->
              <div class="modal-body d-flex flex-column">
                
                <!-- title, address, and bookmark section-->
                <div class="mainDetails d-flex flex-column">
                    <div class="d-flex flex-row">
                      <h5 class="modal-title" id="detailsModalLabel">{{ modalItem?.title }}</h5>
                      <button class="btn" @click="toggleBookmark(modalItem)">
                        <i 
                          class="bi"
                          :class="{
                            'bi-bookmark-fill bookmark-yellow': isBookmarked(modalItem),
                            'bi-bookmark': !isBookmarked(modalItem)
                          }"
                        ></i>
                      </button>
                    </div>

                    <p class="text-muted text-start">{{ modalItem?.category }}</p> 
                </div>

                <!-- details section -->
                <div class="detailsSection d-flex flex-column">
                  <div class="descSection d-none d-md-block">
                    <p class="text-muted text-justify">{{ modalItem?.desc }}</p>
                  </div>

                  <div class="d-flex justify-content-between">
                    <span>Price:</span>
                    <span>{{ modalItem?.price }}</span>
                  </div>

                  <div class="d-flex justify-content-between">
                    <span>Rating:</span>
                    <span><i class="bi bi-star-fill text-warning"></i> {{ modalItem?.rating }} ({{ modalItem?.reviews }})</span>
                  </div>

                  <div class="d-flex justify-content-between">
                    <span>Website:</span>
                    <span><p class="text-start" v-if="modalItem?.website">
                    <a :href="modalItem.website" target="_blank" rel="noopener noreferrer">Visit site</a>
                  </p></span>
                  </div>
                </div>

                <!-- add to trip section -->
                <div class="addToTripSection d-flex justify-content-between mt-3">
                    <!-- <div class="dropdown me-2">
                      <select class="tripDropdown form-select" v-model="selectedTripId">
                        <option disabled value="">Select a Trip</option>
                        <option 
                          v-for="trip in userTrips" 
                          :key="trip.id" 
                          :value="trip.id"
                        >
                          {{ trip.name }}
                        </option>
                      </select>
                    </div> -->
                    
                    <div class="selectorArea relative">
                      <div 
                        class="dropdownTrigger border p-3 cursor-pointer bg-white shadow-sm flex justify-between items-center"
                        @click="toggleDropdown">
                        <i class="bi bi-chevron-down"></i>
                        <span class="d-none d-md-inline">{{ selectedTripName || 'Select a Trip' }}</span>
                        <span class="d-inline d-md-none">{{ selectedTripName || 'trip' }}</span>
                      </div>

                      
                      <div
                        v-if="isOpen"
                        class="customDropdown position-absolute z-3"
                      >
                        <button 
                          v-for="trip in userTrips" 
                          :key="trip.id" 
                          class=" tripItem p-2 d-flex flex-row align-items-center w-100 border-0"
                          @click="selectTrip(trip.id, trip.name)"
                          type="button"
                        >
                          <div id="tripimg">
                            <img :src="trip.pic || 'https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//default_trip_photo.jpeg'" />
                          </div>

                          <div id="tripname">
                            {{ trip.name }}
                          </div>
                        </button>

                        <!-- <button id="createTrip" class="p-2 d-flex flex-row" data-bs-dismiss="modal" >
                          <div> + Create New Trip </div>
                        </button> -->
                      </div>

                    </div>
                    
                    <!-- end of this attempt -->
                    <button @click="handleAddActivity(modalItem)" class="addBtn btn btn-primary">
                      <span class="d-none d-md-block">Add</span>
                      <span class="d-block d-md-none">+</span>
                    </button>
                </div>
              </div>

              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
        </div>
    </div>
    </teleport>

    <teleport to="body">
    <!-- Create Trip Modal -->
    </teleport>
  
    <!-- Bottom Navigation Bar -->
    <!-- <div class="position-absolute start-50 translate-middle-x bottom-0 mb-4 w-50 bg-white rounded-pill shadow-lg py-3 d-flex justify-content-around align-items-center text-decoration-none"
      style="height: 70px; 
            box-shadow: 
                inset 0px 5px 10px rgba(150, 150, 150, 0.5),  
                0px 10px 30px rgba(100, 100, 100, 0.7);">
      

      <div class="text-center">
        <router-link to="/dashboard" class="text-decoration-none d-flex flex-column align-items-center nav-item">
          <i class="bi bi-suitcase-fill fs-4 text-gray"></i>
          <p class="fw-bold m-0 small text-gray">Trips</p>
        </router-link>
      </div>


      <div class="text-center">
        <router-link to="/explore" class="text-decoration-none d-flex flex-column align-items-center nav-item">
          <i class="bi bi-compass-fill fs-4 text-gray"></i>
          <p class="fw-bold m-0 small text-gray">Explore</p>
        </router-link>
      </div>


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


      <div class="text-center">
        <router-link to="/hotel" class="text-decoration-none d-flex flex-column align-items-center nav-item">
          <i class="bi bi-building-fill fs-4 text-gray"></i>
          <p class="fw-bold m-0 small text-gray">Hotel</p>
        </router-link>
      </div>

      <div class="text-center">
        <router-link to="/profile" class="text-decoration-none d-flex flex-column align-items-center nav-item">
          <i class="bi bi-person-fill fs-4 text-gray"></i>
          <p class="fw-bold m-0 small text-gray">Profile</p>
        </router-link>
      </div>
    </div> -->
  </div>

</template>


<style scoped>
  @import "../assets/styles/explore.css"; /* Import external CSS file */
</style>
