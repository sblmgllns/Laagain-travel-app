<script setup>
import { supabase } from "../supabase";
import { useRoute } from 'vue-router';
import { ref, shallowRef, watch, onMounted, nextTick } from 'vue';

import { ScheduleXCalendar } from '@schedule-x/vue';
import {
  createCalendar,
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar';
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';
import '@schedule-x/theme-default/dist/index.css';


const route = useRoute();
const tripId = route.query.id;

const itineraryName = ref('');
const place = ref('');
const startDate = ref('');
const endDate = ref('');
const calendarApp = shallowRef(null); // ✅ Use shallowRef!
const calendarEvents = ref([]);

// Fetch itinerary data including start_date
const fetchItineraryData = async () => {
  try {
    const { data, error } = await supabase
      .from('itineraries')
      .select('name, place, start_date, end_date')
      .eq('id', tripId);

    if (error) {
      console.error('Error fetching itinerary data:', error);
      return;
    }

    if (data && data.length > 0) {
      itineraryName.value = data[0].name;
      startDate.value = data[0].start_date || '2023-11-30';
      place.value = data[0].place;
      endDate.value = data[0].end_date;
    }
  } catch (err) {
    console.error('Error during fetch:', err);
  }
};

onMounted(() => {
  fetchItineraryData();
  fetchPotentialActivities();
});

// Watch for startDate and create calendar once ready
watch(startDate, async (val) => {
  if (!val) return;

  await fetchActivities(); // Initial load
  // setupRealtime(); // Setup real-time syncing
  await nextTick();

  calendarApp.value = createCalendar({
    plugins: [createDragAndDropPlugin()],
    callbacks: {
      onEventUpdate(events) {
        // Optionally update Supabase when an event is moved/changed
      },
        // < -- to show event details when clicked,, we can change the modal  --> 
        onEventClick(event) {
        console.log("Clicked event:", event);
          // Optional: pre-fill modal with event data
          newActivity.value = {
            id: event.id, 
            title: event.title,
            description: '', // You can fetch or attach this if available
            location: '', // same here
            date: event.start.split(' ')[0],
            startTime: event.start.split(' ')[1],
            endTime: event.end.split(' ')[1],   
          };

        showActivityModal.value = true;
      },
      // < -- resizing events by dragging their top or bottom edges   --> 
      onEventDidMount({ event, el }) {
        const topResizer = document.createElement('div');
        topResizer.classList.add('resizer', 'top');
        const bottomResizer = document.createElement('div');
        bottomResizer.classList.add('resizer', 'bottom');

        el.appendChild(topResizer);
        el.appendChild(bottomResizer);

        addResizeListeners(topResizer, 'top', event);
        addResizeListeners(bottomResizer, 'bottom', event);
      },
    },
    selectedDate: val,
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
      createViewMonthAgenda(),
    ],
    events: calendarEvents.value, // ✅ Use reactive events
  });
});


///////MODAL PARTS//////////////////////////////////////////

// Modal Visibitlity state for Activity Modal
const showActivityModal = ref(false)

// Modal visibility state
const showModal = ref(false)

// Form data
const newActivity = ref({
  title: '',
  description: '',
  location: '',
  date: '',
  startTime: '',
  endTime: '',
})

// Reset form when opening modal
const openModal = () => {
  showModal.value = true
  newActivity.value = {
    title: '',
    description: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
  }
}

const closeModal = () => {
  showModal.value = false
}

const closeActivityModal = () =>{
  showActivityModal.value = false
}

const deleteActivity = async () => {
  if (!newActivity.value.id) {
    console.error("No activity selected to delete.");
    return;
  }

  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", newActivity.value.id); // assuming 'id' is the primary key

  if (error) {
    console.error("Failed to delete activity:", error);
  } else {
    console.log("Activity deleted successfully");
    // Optional: refresh your calendar or event list here
    showActivityModal.value = false; // Close the modal after deletion
  }
}

const saveActivity = async () => {
  const { error } = await supabase
    .from("potential_activities")
    .insert([
      {
        name: newActivity.value.title,
        description: newActivity.value.description,
        location: newActivity.value.location,
        date: newActivity.value.date,
        start_time: newActivity.value.startTime,
        end_time: newActivity.value.endTime,
        itinerary_id: tripId
      },
    ]);

  if (error) {
    console.error("Error saving potential activity:", error);
    return;
  }

  await fetchPotentialActivities(); // Refresh list
  closeModal();
};

const potentialActivities = ref([]);

const fetchPotentialActivities = async () => {
  const { data, error } = await supabase
    .from("potential_activities")
    .select("*") // Optionally filter by user/org
    .eq('itinerary_id', tripId);

  if (error) {
    console.error("Error fetching potential activities:", error);
    return;
  }

  potentialActivities.value = data;
};

// When add button is clicked on the right
const addActivity = async (index) => {
  const selectedActivity = potentialActivities.value[index];  // Access with `.value`
  console.log("Adding activity:", selectedActivity);

  const startTimestamp = `${selectedActivity.date}T${selectedActivity.start_time}:00`;
  const endTimestamp = `${selectedActivity.date}T${selectedActivity.end_time}:00`;


  const { error } = await supabase
    .from("activities")
    .insert([
      {
        itinerary_id: tripId,
        name: selectedActivity.name,
        description: selectedActivity.description,
        location: selectedActivity.location,
        date: selectedActivity.date,
        start_time: startTimestamp,
        end_time: endTimestamp,
      },
    ]);

  if (error) {
    console.error("Failed to insert activity:", error);
  } else {
    console.log("Activity successfully inserted!");
  }

  // Remove from potential_activities
  const { error: deleteError } = await supabase
    .from("potential_activities")
    .delete()
    .eq("id", selectedActivity.id);

  if (deleteError) {
    console.error("Failed to delete from potential_activities:", deleteError);
    return;
  }

  // Refresh potential list & calendar
  await fetchPotentialActivities();
  await fetchActivities();
  calendarApp.value?.setEvents([...calendarEvents.value]);
  // calendarApp.value?.setEvents([...calendarEvents.value]);
}

const activities = ref([
  {
    name: "Hiking Adventure",
    description: "Join us for an exciting and scenic hiking adventure through the lush trails of the mountains.",
    location: "Mt. Pulag, Benguet",
    date: "2025-04-25",
    startTime: "07:00",
    endTime: "15:30"
  },
  {
    name: "Beach Cleanup",
    description: "Help us clean up the beach and protect marine life.",
    location: "Boracay, Aklan",
    date: "2025-04-24",
    startTime: "07:00",
    endTime: "15:30"
  },
  {
    name: "Beach Cleanup",
    description: "Help us clean up the beach and protect marine life.",
    location: "Boracay, Aklan",
    date: "2025-04-26",
    startTime: "07:00",
    endTime: "15:30"
  }
]);

//for getting exisiting activities from supabase, for calendar reflection
const fetchActivities = async () => {
  const { data, error } = await supabase
    .from('activities')
    .select('id, name, date, start_time, end_time')
    .eq('itinerary_id', tripId);

  if (error) {
    console.error('Error fetching activities:', error);
    return;
  }

  calendarEvents.value = data.map((a) => ({
    id: a.id,
    title: a.name,
    start: `${a.date} ${a.start_time.slice(11, 16)}`,
    end: `${a.date} ${a.end_time.slice(11, 16)}`,
  }));
};

const setupRealtime = () => {
  supabase
    .channel('public:activities')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'activities',
        filter: `itinerary_id=eq.${tripId}`,
      },
      async (payload) => {
        console.log('Realtime change:', payload);
        await fetchActivities();
        // Refresh calendar with new data
        // calendarApp.value?.setEvents(calendarEvents.value);
        calendarApp.value?.setEvents([...calendarEvents.value]);
      }
    )
    .subscribe();
};

////////EDIT DETAILS MODAL STUFF
const showEditModal = ref(false)

const editItinerary = ref({
  name: '',
  location: '',
  start_date: '',
  end_date: '',
})

const openEditModal = () => {
  showEditModal.value = true

  editItinerary.value = {
    name: itineraryName.value,
    location: place.value, // If your itinerary has a location field
    start_date: startDate.value,
    end_date: endDate.value, // Add if your table has it
  }
}

const closeEditModal = () => {
  showEditModal.value = false
}

const saveItineraryChanges = async () => {
  const { error } = await supabase
    .from('itineraries')
    .update({
      name: editItinerary.value.name,
      place: editItinerary.value.location,
      start_date: editItinerary.value.start_date,
      end_date: editItinerary.value.end_date,
    })
    .eq('id', tripId)

  if (error) {
    console.error('Failed to update itinerary:', error)
    return
  }

  // Update UI with new values
  itineraryName.value = editItinerary.value.name
  startDate.value = editItinerary.value.start_date

  closeEditModal()
}



</script>



<template>
  <div class="app-container">
    <!-- Top Menu Bar inside a rounded box -->
    <div class="menu-bar">
    
        <div class="menu-item">
            <img src="https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/sign/email-assets/laagain-logo.PNG?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJlbWFpbC1hc3NldHMvbGFhZ2Fpbi1sb2dvLlBORyIsImlhdCI6MTc0MDQ1MDcxMSwiZXhwIjoxNzcxOTg2NzExfQ.jShJl7Z3QdCG-kE9akSg5hIC_Ws6dzu54OCFKMXGkps" 
                alt="File Icon" class="menu-icon" />
            <span class="file-name" contenteditable="false" v-text="itineraryName"></span>
        </div>

      <!-- <div class="menu-item">Edit Details</div> -->
      <div class="menu-item" @click="openEditModal">Edit Details</div>
      <div class="menu-item">Members</div>
      <!-- <div class="menu-item">Help</div> -->
    </div>

    <!-- Main Content (Left & Right sections) -->
    <div class="main-content">
      <!-- Left Section -->
        <div class="left-section">
          <!-- Create Button -->
          <button class="create-btn" @click="openModal">New Activity</button>

          <!-- Divider Line -->
          <hr class="divider" />

          <!-- Search Bar -->
          <div class="search-bar">
              <input type="text" placeholder="Search events..." />
              <button>🔍</button>
          </div>
          
          <!-- potential activities -->
          <div class="activity-list">
            <div v-for="(activity, index) in potentialActivities" :key="index" class="activity-card">
              <div class="activity-header">
                <h2 class="activity-name">{{ activity.name }}</h2>
                <button class="add-btn" @click="addActivity(index)">Add</button>
              </div>
              <p class="activity-description">{{ activity.description }}</p>
              <p class="activity-location">Location: {{ activity.location }}</p>
              <p class="activity-date">Date: {{ activity.date }}</p>
              <p class="activity-time">Time: {{ activity.startTime }}</p>
            </div>
          </div>
        </div>

      <!-- Right Section -->
      <div v-if="calendarApp" class="right-section">
        <!-- Calendar -->
        <ScheduleXCalendar :calendar-app="calendarApp" />
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h2>New Activity</h2>
        <!-- title -->
        <div class="container-bar">
        <input v-model="newActivity.title" placeholder="Activity Title" />
        </div>
        <!-- description -->
        <div class="container-bar">
        <textarea v-model="newActivity.description" placeholder="Description"></textarea>
        </div>  
        <!-- location -->
        <div class="container-bar">
          <input v-model="newActivity.location" placeholder="Location" />
        </div>
        
        <!-- start date -->
        <!-- <div class="start-date">Start</div>
         -->
        <!-- Date -->
        <div class="container-bar">
          <input type="date" v-model="newActivity.date" />
        </div>

        <!-- time -->
        <div class="container-bar">
          <!-- Label -->
          <div class="start-date">Start</div>
          <!-- Time -->
          <div class="datetime-wrapper">
            <input type="time" v-model="newActivity.startTime" />
          </div>
        </div>

        <!-- End Div -->
        <div class="container-bar">
          <!-- text -->
          <div class="start-date">End</div>
          <!-- time -->
          <div class="datetime-wrapper">
            <input type="time" v-model="newActivity.endTime" />
          </div>
        </div>
      
        <div class="modal-actions">
          <button 
            @click="saveActivity" 
            :disabled="!newActivity.title || newActivity.title.trim() === ''">
            Save
          </button>
          <button @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Edit Itinerary Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal">
        <h2>Edit Itinerary Details</h2>
        <div class="container-bar">
        <input v-model="editItinerary.name" placeholder="Itinerary Name" />
        </div>
        <div class="container-bar">
        <input v-model="editItinerary.location" placeholder="Location" />
        </div>
        <div class="container-bar">
        <input type="date" v-model="editItinerary.start_date" />
        </div>
        <div class="container-bar">
        <input type="date" v-model="editItinerary.end_date" />
          </div>
        <div class="modal-actions">
          <button @click="saveItineraryChanges">Save Changes</button>
          <button @click="closeEditModal">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Show Activity Modal -->
    <div v-if="showActivityModal" class="modal-overlay">
      <div class="modal">
        <div> Activity Details </div>
        <!-- title -->
        <div class="container-bar">
          {{ newActivity.title }}
        </div>
        <!-- description -->
        <div class="container-bar">
          {{ newActivity.description }}
        </div>  
        <!-- location -->
        <div class="container-bar">
          {{ newActivity.location }}
        </div>
        
        <!-- start date -->
        <!-- <div class="start-date">Start</div>
         -->
        <!-- Date -->
        <div class="container-bar">
          {{ newActivity.date }}
          <input type="date" v-model="newActivity.date" />
        </div>

        <!-- time -->
        <div class="container-bar">
          <!-- Label -->
          <div class="start-date">Start</div>
          <!-- Time -->
          <div class="datetime-wrapper">
            {{ newActivity.startTime }}
          </div>
        </div>

        <!-- End Div -->
        <div class="container-bar">
          <!-- text -->
          <div class="start-date">End</div>
          <!-- time -->
          <div class="datetime-wrapper">
            {{ newActivity.endTime }}
          </div>
        </div>
      
        <div class="modal-actions">
          <button @click="deleteActivity"> Delete </button>
          <button @click="editActivity">Edit</button>
          <button @click="closeActivityModal">Close</button>
        </div>

      </div>
    </div>


  </div>
</template>

<style scoped>
@import "../assets/styles/edititinerary.css"; /* Import external CSS file */
</style>

