<script setup>
import { ScheduleXCalendar } from '@schedule-x/vue'
import {
  createCalendar,
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import '@schedule-x/theme-default/dist/index.css'

// Calendar instance
const calendarApp = createCalendar({
    plugins: [
        createDragAndDropPlugin(),
    ],
    callbacks:{
      onEventUpdate(events){
        // update supabase
      },  
    },
  selectedDate: '2023-12-19',
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
})
</script>

<template>
  <div class="app-container">
    <!-- Top Menu Bar inside a rounded box -->
    <div class="menu-bar">
    
        <div class="menu-item">
            <img src="https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/sign/email-assets/laagain-logo.PNG?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJlbWFpbC1hc3NldHMvbGFhZ2Fpbi1sb2dvLlBORyIsImlhdCI6MTc0MDQ1MDcxMSwiZXhwIjoxNzcxOTg2NzExfQ.jShJl7Z3QdCG-kE9akSg5hIC_Ws6dzu54OCFKMXGkps" 
                alt="File Icon" class="menu-icon" />
            <span class="file-name" contenteditable="true">File Name</span>
        </div>

      <div class="menu-item">File</div>
      <div class="menu-item">Edit</div>
      <div class="menu-item">View</div>
      <div class="menu-item">Insert</div>
      <div class="menu-item">Format</div>
      <div class="menu-item">Help</div>
    </div>

    <!-- Main Content (Left & Right sections) -->
    <div class="main-content">
      <!-- Left Section -->
        <div class="left-section">
        <!-- Create Button -->
        <button class="create-btn">Create</button>

        <!-- Divider Line -->
        <hr class="divider" />

        <!-- Search Bar -->
        <div class="search-bar">
            <input type="text" placeholder="Search events..." />
            <button>🔍</button>
        </div>

        <h2>Additional Content</h2>
        <p>Place your buttons, forms, or any other content here.</p>
        </div>

      <!-- Right Section -->
      <div class="right-section">
        <!-- Calendar -->
        <ScheduleXCalendar :calendar-app="calendarApp" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* App container */
.app-container {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
  padding: 10px;
}

/* Menu Bar */
/* Menu Bar */
.menu-bar {
  display: flex;
  align-items: center;
  background-color: white;
  padding: 10px 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  gap: 15px;
}

/* Menu Items (text) */
.menu-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background 0.2s;
}

/* Hover Effect */
.menu-item:hover {
  background-color: #e8f0fe;
}

/* Active Item */
.menu-item.active {
  background-color: #d2e3fc;
}

/* Icons */
.menu-item img, 
.menu-item svg {
  width: 18px;
  height: 18px;
  margin-right: 5px;
}

.menu-icon {
  width: 18px;
  height: 18px;
  margin-right: 5px;
  object-fit: contain; /* Ensures it doesn't stretch */
}

.file-name {
    display: inline-block;
    min-width: 100px;
    border-bottom: 1px dashed #ccc; /* Visual cue */
}

.file-name:focus {
    outline: none;
    border-bottom: 1px solid #007bff; /* Highlight on focus */
}


/* Main content layout */
.main-content {
  display: flex;
  flex: 1;
  gap: 10px;
  flex-wrap: wrap; /* Allows wrapping when needed */
  padding-top: 10px; /* Adds space below the menu bar */
}

/* Left Section */
.left-section {
  flex: 1;
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Right Section */
.right-section {
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.create-btn {
    display: block;
    width: 100%;
    padding: 10px;
    font-size: 16px;
    background: #03AED2 !important;
    border: 2px solid #03AED2 !important; /* Border same as background */
    border-radius: 5px;
    cursor: pointer;
    margin-bottom: 10px;
  }

  .create-btn:hover {
    background: #FDDE55 !important; /* Changes background on hover */
    border-color: #FDDE55 !important; /* Ensures border also changes */
    color: #FFF  !important; /* Optional: Adjust text color for contrast */
  }

  .divider {
    border: none;
    height: 1px;
    background-color: #ccc;
    margin: 10px 0;
  }

/* Search Bar */
.search-bar {
  display: flex;
  align-items: center;
  width: 100%;
  background-color: #f0f2f5;
  padding: 8px;
  border-radius: 10px;
  margin-bottom: 15px;
}

/* Input Field */
.search-bar input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  color: gray; /* Set input text color to gray */
}

/* Placeholder Text */
.search-bar input::placeholder {
  color: lightgray; /* Lighter gray for placeholder */
}



.search-bar button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
}

/* Calendar */
.sx-vue-calendar-wrapper {
  width: 100%;
  height: 80vh;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column; /* Stack sections vertically */
  }

  .left-section,
  .right-section {
    width: 100%;
  }
}

</style>