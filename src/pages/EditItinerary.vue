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
const startDate = ref('');
const calendarApp = shallowRef(null); // ✅ Use shallowRef!

// Fetch itinerary data including start_date
const fetchItineraryData = async () => {
  try {
    const { data, error } = await supabase
      .from('itineraries')
      .select('name, start_date')
      .eq('id', tripId);

    if (error) {
      console.error('Error fetching itinerary data:', error);
      return;
    }

    if (data && data.length > 0) {
      itineraryName.value = data[0].name;
      startDate.value = data[0].start_date || '2023-11-30';
    }
  } catch (err) {
    console.error('Error during fetch:', err);
  }
};

onMounted(() => {
  fetchItineraryData();
});

// Watch for startDate and create calendar once ready
watch(startDate, async (val) => {
  if (!val) return;

  await nextTick();

  calendarApp.value = createCalendar({
    plugins: [createDragAndDropPlugin()],
    callbacks: {
      onEventUpdate(events) {
        // update Supabase with new events if needed
      },
    },
    selectedDate: val, // ✅ Dynamically set from Supabase
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
      createViewMonthAgenda(),
    ],
    events: [
      {
        id: 1,
        title: 'Meeting with Team',
        start: '2023-12-19',
        end: '2023-12-19',
      },
      {
        id: 2,
        title: 'Project Deadline',
        start: '2023-12-20 12:00',
        end: '2023-12-20 13:00',
      },
    ],
  });
});

///////MODAL PARTS//////////////////////////////////////////

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

const saveActivity = () => {
  // Combine date and times into full datetime for Schedule X
  const start = `${newActivity.value.date} ${newActivity.value.startTime}`
  const end = `${newActivity.value.date} ${newActivity.value.endTime}`

  // Add event to calendar
  calendarApp.value.addEvent({
    id: Date.now(), // or use UUID
    title: newActivity.value.title,
    start,
    end,
    // description: newActivity.value.description,
    // location: newActivity.value.location,
  })

  closeModal()
}

const activities = [
  {
    name: "Hiking Adventure",
    description: "Join us for an exciting and scenic hiking adventure through the lush trails of the mountains.",
    location: "Mt. Pulag, Benguet",
    date: "April 15, 2025",
    time: "7:00 AM"
  },
  {
    name: "Beach Cleanup",
    description: "Help us clean up the beach and protect marine life.",
    location: "Boracay, Aklan",
    date: "April 22, 2025",
    time: "9:00 AM"
  },
  {
    name: "Beach Cleanup",
    description: "Help us clean up the beach and protect marine life.",
    location: "Boracay, Aklan",
    date: "April 22, 2025",
    time: "9:00 AM"
  }
  // Add more activities as needed
];
</script>



<template>
  <div class="app-container">
    <!-- Top Menu Bar inside a rounded box -->
    <div class="menu-bar">
    
        <div class="menu-item">
            <img src="https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/sign/email-assets/laagain-logo.PNG?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJlbWFpbC1hc3NldHMvbGFhZ2Fpbi1sb2dvLlBORyIsImlhdCI6MTc0MDQ1MDcxMSwiZXhwIjoxNzcxOTg2NzExfQ.jShJl7Z3QdCG-kE9akSg5hIC_Ws6dzu54OCFKMXGkps" 
                alt="File Icon" class="menu-icon" />
            <span class="file-name" contenteditable="true" v-text="itineraryName"></span>
        </div>

      <div class="menu-item">File</div>
      <div class="menu-item">Edit</div>
      <div class="menu-item">View</div>
      <div class="menu-item">Insert</div>
      <div class="menu-item">Format</div>
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

          <div class="activity-list">
            <div v-for="(activity, index) in activities" :key="index" class="activity-card">
              <div class="activity-header">
                <h2 class="activity-name">{{ activity.name }}</h2>
                <button class="add-btn" @click="addActivity(index)">Add</button>
              </div>
              <p class="activity-description">{{ activity.description }}</p>
              <p class="activity-location">Location: {{ activity.location }}</p>
              <p class="activity-date">Date: {{ activity.date }}</p>
              <p class="activity-time">Time: {{ activity.time }}</p>
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

        <input v-model="newActivity.title" placeholder="Activity Title" />
        <textarea v-model="newActivity.description" placeholder="Description"></textarea>
        <input v-model="newActivity.location" placeholder="Location" />
        <input type="date" v-model="newActivity.date" />
        <input type="time" v-model="newActivity.startTime" />
        <input type="time" v-model="newActivity.endTime" />

        <div class="modal-actions">
          <button @click="saveActivity">Save</button>
          <button @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import "../assets/styles/edititinerary.css"; /* Import external CSS file */
</style>

