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
let eventId = null;
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
  fetchUserVote();
  fetchVoteCounts();
  fetchItineraryData();
  fetchPotentialActivities();
  if (tripId) {
    fetchOwnerProfile();  // Fetch the data for the trip
  }
  
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
            description: event.description, // You can fetch or attach this if available
            location: event.location, // same here
            date: event.start.split(' ')[0],
            startTime: event.start.split(' ')[1],
            endTime: event.end.split(' ')[1],   
          };
        eventId = event.id;
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
    minDate: startDate.value,  //  Apply min date
    maxDate: endDate.value,    //  Apply max date
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
const isEditMode = ref(false)
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

const editActivity = async () => {
  isEditMode.value = true
}

const deleteActivity = async () => {
  if (!newActivity.value.id) {
    console.error("No activity selected to delete.");
    return;
  }

  const confirmed = window.confirm("Are you sure you want to delete this activity?");
  if (!confirmed) {
    return; // Exit if the user cancels
  }

  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", newActivity.value.id); // assuming 'id' is the primary key

  if (error) {
    console.error("Failed to delete activity:", error);
  } else {
    console.log("Activity deleted successfully");
    showActivityModal.value = false; // Close the modal after deletion
    window.location.reload();
  }
};


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
  //window.location.reload();
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

  // Set to null if start or end time is missing
  const startTimestamp = selectedActivity.start_time
    ? `${selectedActivity.date}T${selectedActivity.start_time}:00`
    : null;

  const endTimestamp = selectedActivity.end_time
    ? `${selectedActivity.date}T${selectedActivity.end_time}:00`
    : null;

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
  window.location.reload();
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
    .select('id, name, date, start_time, end_time, description, location')
    .eq('itinerary_id', tripId);

  if (error) {
    console.error('Error fetching activities:', error);
    return;
  }

  calendarEvents.value = data.map((a) => {
    if (!a.start_time && !a.end_time) { // if no stat and end time,, automatic all day  
      return {
        id: a.id,
        title: a.name,
        start: `${a.date}`,
        end: `${a.date}`,
        description: a.description,
        location: a.location,
      };
    } else {
      return { // with specific start time and end time 
        id: a.id,
        title: a.name,
        description: a.description,
        location: a.location,
        start: `${a.date} ${a.start_time?.slice(11, 16)}`,
        end: `${a.date} ${a.end_time?.slice(11, 16)}`,
      };
    }
  });

};

//////EDIT ITINERARY NAME PART
const isEditingName = ref(false)
const editableSpan = ref(null)

const startEditingName = () => {
  isEditingName.value = true
  // Optional: auto-select the text
  nextTick(() => {
    const el = editableSpan.value
    if (el) {
      const range = document.createRange()
      const sel = window.getSelection()
      range.selectNodeContents(el)
      sel.removeAllRanges()
      sel.addRange(range)
    }
  })
}

const updateName = (e) => {
  itineraryName.value = e.target.innerText.trim()
}

const saveName = async () => {
  isEditingName.value = false

  const { error } = await supabase
    .from('itineraries')
    .update({ name: itineraryName.value })
    .eq('id', tripId)

  if (error) {
    console.error('Error updating itinerary name:', error)
  } else {
    console.log('Itinerary name updated successfully')
  }
}

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

//////MEMBERS PART 

const ownerProfile = ref({ name: '', username: '', picture: '' });
const members = ref([]);
const showMembersModal = ref(false);

const openMembersModal = async () => {
  showMembersModal.value = true;
  await fetchOwnerProfile();
};

const closeMembersModal = () => {
  showMembersModal.value = false;
};

const fetchOwnerProfile = async () => {
  try {
    console.log("Fetching owner profile for tripId:", tripId);

    // Step 1: Fetch the owner_id from the itineraries table
    const { data: itineraryData, error: itineraryError } = await supabase
      .from('itineraries')  // Replace 'itineraries' with your actual table name
      .select('owner_id')  // Assuming 'owner_id' is the column for the owner's ID
      .eq('id', tripId)  // Filter by the tripId to get the corresponding itinerary
      .single();  // Ensure you get a single result

    if (itineraryError) {
      console.error('Error fetching itinerary data:', itineraryError);
      return;
    }

    if (!itineraryData) {
      console.error('No itinerary data found for tripId:', tripId);
      return;
    }

    const ownerId = itineraryData.owner_id;
    console.log("Fetched owner_id:", ownerId);

    // Step 2: Fetch the owner's profile using the owner_id
    const { data: ownerData, error: ownerError } = await supabase
      .from('profiles')  // Replace 'profiles' with your actual profiles table name
      .select('full_name, username, profile_pic_url')  // Select the required fields
      .eq('id', ownerId)  // Use the owner_id obtained from the itinerary
      .single();  // Ensure you get a single result

    if (ownerError) {
      console.error('Error fetching owner profile:', ownerError);
      return;
    }

    if (!ownerData) {
      console.error('No owner data found for owner_id:', ownerId);
      return;
    }

    // Store the owner profile data
    ownerProfile.value = {
      picture: ownerData.profile_pic_url,
      name: ownerData.full_name,
      username: ownerData.username,
    };

    console.log("Fetched Owner Profile:", ownerProfile.value);

    // Now fetch members' profiles (if needed)
    const { data: memberIds, error: memberIdsError } = await supabase
      .from('itinerary_members')
      .select('user_id')
      .eq('itinerary_id', tripId);  // Use tripId to fetch the members for this itinerary

    if (memberIdsError) throw memberIdsError;

    const userIds = memberIds.map(member => member.user_id);

    const { data: membersData, error: membersError } = await supabase
      .from('profiles')
      .select('full_name, username, profile_pic_url')
      .in('id', userIds);

    if (membersError) throw membersError;

    members.value = membersData.map(member => ({
      username: member.username,
      full_name: member.full_name,
      profile_pic_url: member.profile_pic_url || 'https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/profile-pictures/default_profpic.jpg',  // Default if no profile pic
    }));

    console.log("Fetched Members Info:", members.value);

  } catch (error) {
    console.error('Error:', error);
  }
};

//////VOTING PART
const yesVotes = ref(0);  // Current "Yes" vote count
const noVotes = ref(0);   // Current "No" vote count
const userVoted = ref(false);  // Track if user has voted
const userVote = ref('');  // Track user's vote ("yes" or "no")

// Function to check if the user has already voted for this event
const checkUserVote = async () => {
  const { data: itineraryData, error: itineraryError } = await supabase
    .from('itineraries')  // Replace 'itineraries' with your actual table name
    .select('owner_id')  // Assuming 'owner_id' is the column for the owner's ID
    .eq('id', tripId)  // Filter by the tripId to get the corresponding itinerary
    .single();  // Ensure you get a single result

  if (itineraryError) {
    console.error('Error fetching itinerary data:', itineraryError);
    return;
  }

  if (!itineraryData) {
    console.error('No itinerary data found for tripId:', tripId);
    return;
  }

  const ownerId = itineraryData.owner_id;
  console.log(tripId, eventId, ownerId);
  const { data, error } = await supabase
    .from('votes')
    .select('vote')
    .eq('itinerary_id', tripId)
    .eq('activity_id', eventId)
    .eq('user_id', ownerId) // Get the current user's ID
    .single(); // Fetch a single result if it exists

  if (error) {
    console.error('Error checking user vote:', error);
    return null;
  }

  if (data) {
    userVoted.value = true;
    userVote.value = data.vote;  // Set the user's vote (either 'yes' or 'no')
    return data.vote;  // Return the existing vote of the user
  }

  return null;  // Return null if no vote is found
};

// Function to fetch user's existing vote for the event
const fetchUserVote = async () => {
  const { data: itineraryData, error: itineraryError } = await supabase
    .from('itineraries')  // Replace 'itineraries' with your actual table name
    .select('owner_id')  // Assuming 'owner_id' is the column for the owner's ID
    .eq('id', tripId)  // Filter by the tripId to get the corresponding itinerary
    .single();  // Ensure you get a single result

  if (itineraryError) {
    console.error('Error fetching itinerary data:', itineraryError);
    return;
  }

  if (!itineraryData) {
    console.error('No itinerary data found for tripId:', tripId);
    return;
  }

  const ownerId = itineraryData.owner_id;

  const { data, error } = await supabase
    .from('votes')
    .select('vote')
    .eq('itinerary_id', tripId)
    .eq('activity_id', eventId)
    .eq('user_id', ownerId) // Get the current user's ID
    .single(); // Since the user can only have one vote per event

  if (error) {
    console.error('Error fetching user vote:', error);
    return;
  }

  if (data) {
    userVoted.value = true;
    userVote.value = data.vote;
  }
};

// Voting function that handles both inserting and updating the vote
const vote = async (voteType) => {
  // Step 1: Fetch the owner_id from the itineraries table
  const { data: itineraryData, error: itineraryError } = await supabase
    .from('itineraries')  // Replace 'itineraries' with your actual table name
    .select('owner_id')  // Assuming 'owner_id' is the column for the owner's ID
    .eq('id', tripId)  // Filter by the tripId to get the corresponding itinerary
    .single();  // Ensure you get a single result

  if (itineraryError) {
    console.error('Error fetching itinerary data:', itineraryError);
    return;
  }

  if (!itineraryData) {
    console.error('No itinerary data found for tripId:', tripId);
    return;
  }

  const ownerId = itineraryData.owner_id;

  const existingVote = await checkUserVote();

  if (existingVote) {
    // If the user is changing their vote, update the existing vote
    if (userVote.value !== voteType) {
      // Update the existing vote in the database
      const { error: updateError } = await supabase
        .from('votes')
        .update({ vote: voteType }) // Update the existing vote
        .eq('itinerary_id', tripId)
        .eq('activity_id', eventId)
        .eq('user_id', ownerId); // Update the vote based on the user ID

      if (updateError) {
        console.error("Error updating vote:", updateError);
        return;
      }

      // Update the UI state after successful vote update
      userVote.value = voteType;

      // Adjust the vote counts locally for the UI
      if (voteType === 'yes') {
        yesVotes.value++;  // Increase the "Yes" vote count
        noVotes.value--;   // Decrease the "No" vote count if changing from "No" to "Yes"
      } else if (voteType === 'no') {
        noVotes.value++;   // Increase the "No" vote count
        yesVotes.value--;  // Decrease the "Yes" vote count if changing from "Yes" to "No"
      }
      yesVotes.value = Math.max(yesVotes.value, 0);
      noVotes.value = Math.max(noVotes.value, 0);
    } else {
      alert(`You already voted '${userVote.value}'`);
      return;
    }
  } else {
    // If the user hasn't voted yet, submit their vote
    const { error: insertError } = await supabase
      .from('votes')
      .insert([{
        itinerary_id: tripId,
        activity_id: eventId,
        user_id: ownerId,
        vote: voteType,
      }]);

    if (insertError) {
      console.error("Error submitting vote:", insertError);
      return;
    }

    // Update the UI state after successful vote submission
    userVoted.value = true;
    userVote.value = voteType;

    // Adjust the vote counts locally for the UI
    if (voteType === 'yes') {
      yesVotes.value++;  // Increase the "Yes" vote count
    } else if (voteType === 'no') {
      noVotes.value++;   // Increase the "No" vote count
    }
    yesVotes.value = Math.max(yesVotes.value, 0);
    noVotes.value = Math.max(noVotes.value, 0);
  }
};

const fetchVoteCounts = async () => {
  const { data, error } = await supabase
    .from('votes')
    .select('vote')  // Select only the 'vote' column
    .eq('itinerary_id', tripId)  // Filter by tripId
    .eq('activity_id', eventId);  // Filter by eventId

  if (error) {
    console.error("Error fetching vote counts:", error);
    return;
  }

  // Initialize counters for "yes" and "no" votes
  let yesVotesCount = 0;
  let noVotesCount = 0;

  // Loop through the data to manually count "yes" and "no" votes
  if (data) {
    data.forEach(vote => {
      if (vote.vote === 'yes') {
        yesVotesCount++;
      } else if (vote.vote === 'no') {
        noVotesCount++;
      }
    });
  }

  // Update the UI state with the fetched vote counts
  yesVotes.value = yesVotesCount;
  noVotes.value = noVotesCount;
};




</script>



<template>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">

  <div class="app-container">
    <!-- Top Menu Bar inside a rounded box -->
    <div class="menu-bar">
    
        <div class="menu-item">
            <img src="https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/sign/email-assets/laagain-logo.PNG?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJlbWFpbC1hc3NldHMvbGFhZ2Fpbi1sb2dvLlBORyIsImlhdCI6MTc0MDQ1MDcxMSwiZXhwIjoxNzcxOTg2NzExfQ.jShJl7Z3QdCG-kE9akSg5hIC_Ws6dzu54OCFKMXGkps" 
                alt="File Icon" class="menu-icon" />
                <span
                    class="file-name"
                    :contenteditable="isEditingName"
                    @click="startEditingName"
                    @blur="saveName"
                    @input="updateName"
                    ref="editableSpan"
                  >{{ itineraryName }}</span>

        </div>

      <!-- <div class="menu-item">Edit Details</div> -->
      <div class="menu-item" @click="openEditModal">Edit Details</div>
      <div class="menu-item" @click="openMembersModal">Members</div>
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

    <!-- Modal  -->
    <!-- create activity modal -->
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
          <input 
            type="date" 
            v-model="newActivity.date" 
            :min="startDate" 
            :max="endDate" 
          />
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
            :disabled="!newActivity.title || newActivity.title.trim() === '' || !newActivity.location || !newActivity.date || !newActivity.startTime || !newActivity.endTime">
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
          <input
            type="date"
            v-model="editItinerary.start_date"
          />
        </div>
        <div class="container-bar">
            <input
              type="date"
              v-model="editItinerary.end_date"
              :min="editItinerary.start_date"
            />
        </div>
        <div class="modal-actions">
          <button @click="saveItineraryChanges" >Save Changes</button>
          <button @click="closeEditModal">Cancel</button>
        </div>``
      </div>
    </div>

    <!-- View Members Modal -->
    <div v-if="showMembersModal" class="modal-overlay">
      <div class="modal">
        <h2>Members</h2>
        
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

        <!-- Members List -->
        <div v-for="member in members" :key="member.username"
            style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding: 0 20px;">
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
          <span style="font-family: 'Sarabun', sans-serif; font-size: 14px; color: #A8A6A6;">
            Member
          </span>
        </div>

        <div class="modal-actions">
          <button @click="closeMembersModal">Close</button>
        </div>
      </div>
    </div>

  </div>
  
<!-- Show Activity Modal -->
<div v-if="showActivityModal" class="activity-modal-overlay" @click="fetchVoteCounts">
  <div class="activity-modal" style="max-height: 90vh; padding: 1rem;">
    <!-- Modal Header: Activity Name centered -->
    <div class="modal-header">
      <h3 class="modal-title text-center">{{ newActivity.title }}</h3>
    </div>
    
    <!-- Modal Body: Activity Details displayed vertically -->
    <div class="modal-body" style="overflow-y: auto; padding: 20px;" >
      <!-- Details Header -->
      <div class="details-header">
        <strong>Details</strong>
      </div>
      
      <div class="detail-item" style="text-align: left;margin-left: 10px;">
        <strong style="color: #3f3e3e;font-size: 1rem;">Description:</strong> {{ newActivity.description || '-' }}
      </div>
      <div class="detail-item" style="text-align: left;margin-left: 10px;">
        <strong style="color: #3f3e3e;font-size: 1rem;">Location:</strong> {{ newActivity.location}}
      </div>
      <div class="detail-item" style="text-align: left;margin-left: 10px;">
        <strong style="color: #3f3e3e;font-size: 1rem;">Date:</strong> {{ newActivity.date }}
      </div>
      <div class="detail-item" style="text-align: left;margin-left: 10px;">
        <strong style="color: #3f3e3e;font-size: 1rem;">Start Time:</strong> {{ newActivity.startTime }}
      </div>
      <div class="detail-item" style="text-align: left;margin-left: 10px;">
        <strong style="color: #3f3e3e;font-size: 1rem;">End Time:</strong> {{ newActivity.endTime }}
      </div>

      <!-- Votes Header -->
<div class="details-header" style="margin-top: 1.5rem;">
  <strong>Votes</strong>
</div>

<!-- Voting UI Container -->
<div class="d-flex justify-content-center mt-3">
  <div style="width: 100%; max-width: 600px; padding: 1rem; border: 1px solid #ddd; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); background-color: #fff;">
    
    <!-- Vote Bars -->
    <div class="mb-3">
      <div class="d-flex align-items-center mb-2">
        <span style="width: 50px;" class="text-end pe-2">Yes</span>
        <div class="flex-grow-1 bg-light rounded-pill shadow-sm" style="height: 12px; position: relative;">
          <div class="bg-success rounded-pill shadow-sm" 
           :style="{
             height: '100%',
             width: yesPercentage + '%',
             transition: 'width 0.3s'
           }"></div>
        </div>
        <span class="ms-2 text-muted small">{{ yesVotes }} votes</span>
      </div>
      <div class="d-flex align-items-center">
        <span style="width: 50px;" class="text-end pe-2">No</span>
        <div class="flex-grow-1 bg-light rounded-pill shadow-sm" style="height: 12px; position: relative;">
          <div class="bg-danger rounded-pill shadow-sm" 
           :style="{
             height: '100%',
             width: noPercentage + '%',
             transition: 'width 0.3s'
           }"></div>
        </div>
        <span class="ms-2 text-muted small">{{ noVotes }} votes</span>
      </div>
    </div>

    <!-- Smaller Voting Buttons -->
    <div class="d-flex justify-content-center gap-2">
      <button class="btn btn-outline-success btn-sm px-3" @click="vote('yes')">Yes</button>
      <button class="btn btn-outline-danger btn-sm px-3" @click="vote('no')">No</button>
    </div>

    <!-- Not Voted Message -->
    <div class="text-center mt-2 text-muted small" v-if="!userVoted">
      You haven't voted yet.
    </div>
    <div class="text-center mt-2 text-muted small" v-else>
      You voted: {{ userVote }}.
    </div>
  </div>
</div>

      <!-- Annotation Header -->
      <div class="details-header mt-4">
        <strong>Notes</strong>
      </div>

     <!-- Input for Adding Notes -->
    <div class="mt-3 d-flex" style="width: 100%; max-width: 600px;">
      <input type="text" id="noteInput" placeholder="Add a note..." 
            style="flex-grow: 1; height: 40px; padding: 10px; border: 1px solid #ccc; border-radius: 15px; font-size: 14px; margin-left: 25px; width: calc(100% - 60px); box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);"/>
      <button class="btn btn-outline-primary ms-2" type="submit">
        <i class="fas fa-pencil-alt"></i> <!-- Pencil Icon -->
      </button>
    </div>

    <!-- Notes List (Scrollable) -->
    <div class="mt-3 d-flex justify-content-center">
      <div class="note-card shadow-sm" style="width: 80%; max-width: 800px; padding: 15px; border-radius:20px; background-color: #f0f0f0 ; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
        <!-- Flexbox container for profile and text, aligned to the left -->
        <div class="d-flex align-items-start">
          <!-- Profile Picture (Placeholder) -->
          <div class="profile-pic" style="width: 40px; height: 40px; border-radius: 50%; background-color: #ddd; margin-right: 10px;"></div>

          <!-- User Name in the same line as profile pic -->
          <div>
            <small class="text-muted">User A</small>
          </div>
        </div>

        <!-- Note (directly below the username) -->
        <div style="margin-top: -18px;margin-left: -70px;">
          Bring extra water for this activity.
        </div>
      </div>
    </div>
    </div>

    <!-- Modal Footer: Buttons for Delete, Edit, Close -->
    <div class="modal-footer">
      <button v-if="isEditMode" class="btn btn-danger" @click="deleteActivity">Delete</button>
      <button class="btn btn-primary" @click="editActivity">Edit</button>
      <button class="btn btn-secondary" @click="closeActivityModal">Close</button>
    </div>
  </div>
</div>


</template>

<style scoped>
@import "../assets/styles/edititinerary.css"; /* Import external CSS file */
</style>

