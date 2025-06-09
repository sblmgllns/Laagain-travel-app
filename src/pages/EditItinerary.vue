<script setup>
import { supabase } from "../supabase";
import { useRoute } from "vue-router";
import NewActivity from "./CreateNewActivity.vue"; // Adjust the path if needed
import EditItineraryDetails from "./EditItineraryDetails.vue";
import InviteModal from "./InviteModal.vue";
import {
  ref,
  shallowRef,
  watch,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import { useRouter } from "vue-router";
import { calendars } from "./calendar.ts";

import { ScheduleXCalendar } from "@schedule-x/vue";
import {
  createCalendar,
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import { createDragAndDropPlugin } from "@schedule-x/drag-and-drop";
//import "@schedule-x/theme-default/dist/index.css";
import "../assets/styles/schedule-x-theme.css";
import VueToggles from "vue-toggles";
import { formatDistanceToNow, format } from "date-fns";
import { createResizePlugin } from "@schedule-x/resize";
import { createCurrentTimePlugin } from "@schedule-x/current-time";
import Explore from "./Explore.vue";

////CONST
const selectedActivityTab = ref("details");
const activityPicName = ref("");
const isSaving = ref(false);
const isMobile = ref(window.innerWidth < 768);
const route = useRoute();
const tripId = route.query.id;
const router = useRouter();
const isCollapsed = ref(false);
const itineraryName = ref("");
const place = ref("");
const startDate = ref("");
const endDate = ref("");
const coverPicUrl = ref("");
const modalContent = ref(null);
const calendarApp = shallowRef(null); // ✅ Use shallowRef!
const calendarEvents = ref([]);
let eventId = null;
const currentUser = ref(null);
const totalMembers = ref(1);
const originalActivity = ref({});
const isEditingActivity = ref(false);
const activeTab = ref("trips"); // default tab
const drafts = ref(true); // true when 'Drafts' tab is active

////ON MOUNTED

////HANDLE RESIZE
function handleResize() {
  isMobile.value = window.innerWidth < 768;
}

onMounted(async () => {
  window.addEventListener("resize", handleResize);
  fetchItineraryData();
  fetchPotentialActivities();
  fetchOwnerProfile(); // Fetch the data for the trip

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Failed to get user:", error.message);
  } else {
    currentUser.value = user;
    console.log("User:", user); // confirm it's working
    //console.log("User ID:", user?.id); // check ID here
  }
});

///// Watch for startDate and create calendar once ready
watch(startDate, async (val) => {
  if (!val) return;

  await fetchActivities(); // Initial load
  // setupRealtime(); // Setup real-time syncing
  await nextTick();

  calendarApp.value = createCalendar({
    plugins: [
      createDragAndDropPlugin(),
      createResizePlugin(15), // 15 minute intervals when resizing
      createCurrentTimePlugin(),
    ],
    callbacks: {
      onEventUpdate(event) {
        // Optionally update Supabase when an event is moved/changed
        console.log("Event updated:", event);
        // Example Supabase update
        supabase
          .from("activities")
          .update({
            start_time: event.start,
            end_time: event.end,
            date: event.start.split(" ")[0],
          })
          .eq("id", event.id)
          .then(({ error }) => {
            if (error) {
              console.error("Error updating event:", error);
            } else {
              console.log("Successfully updated event:", event.id);
            }
          });
      },
      // < -- to show event details when clicked,, we can change the modal  -->
      onEventClick(event) {
        console.log("Clicked event:", event);
        // Optional: pre-fill modal with event data
        const baseData = {
          id: event.id,
          title: event.title,
          description: event.description || "",
          location: event.location || "",
          date: event.start.split(" ")[0],
          startTime: event.start.split(" ")[1],
          endTime: event.end.split(" ")[1],
          activity_pic_url: event.activity_pic_url || "",
          type: event.type || "",
        };

        newActivity.value = { ...baseData };
        originalActivity.value = { ...baseData };
        newActivity.value = {
          id: event.id,
          title: event.title,
          description: event.description, // You can fetch or attach this if available
          location: event.location, // same here
          date: event.start.split(" ")[0],
          startTime: event.start.split(" ")[1],
          endTime: event.end.split(" ")[1],
          activity_pic_url: event.activity_pic_url,
          type: event.type,
        };
        eventId = event.id;
        fetchUserVote(eventId);
        fetchVoteCounts(eventId);
        fetchComments(eventId);
        fetchCurrentUserProfilePic();
        showActivityModal.value = true;
      },
      // < -- resizing events by dragging their top or bottom edges   -->
      onEventDidMount({ event, el }) {
        const topResizer = document.createElement("div");
        topResizer.classList.add("resizer", "top");
        const bottomResizer = document.createElement("div");
        bottomResizer.classList.add("resizer", "bottom");

        el.appendChild(topResizer);
        el.appendChild(bottomResizer);

        addResizeListeners(topResizer, "top", event);
        addResizeListeners(bottomResizer, "bottom", event);
      },
    },
    calendars,
    selectedDate: val,
    minDate: startDate.value, //  Apply min date
    maxDate: endDate.value, //  Apply max date
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
      createViewMonthAgenda(),
    ],
    events: calendarEvents.value, // ✅ Use reactive events
  });
});

/////ONBEFOREUNMOUNT
onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

createCurrentTimePlugin({
  // Whether the indicator should be displayed in the full width of the week. Defaults to false
  fullWeekWidth: true,

  // Time zone offset in minutes. Can be any offset valid according to UTC (-720 to 840)
  timeZoneOffset: 120,
});

const setupRealtime = () => {
  supabase
    .channel("public:activities")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "activities",
        filter: `itinerary_id=eq.${tripId}`,
      },
      async (payload) => {
        console.log("Realtime change:", payload);
        await fetchActivities();
        // Refresh calendar with new data
        // calendarApp.value?.setEvents(calendarEvents.value);
        calendarApp.value?.setEvents([...calendarEvents.value]);
      }
    )
    .subscribe();
};

////DATE FORMAT
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formatted = new Date(dateString).toLocaleDateString("en-US", options);
  return formatted.replace(",", ""); // returns e.g. "APRIL 14 2025"
}

const goToExplore = () => {
  router.push("/explore");
};

///TIME FORMAT
function formatPotentialTime(timeStr) {
  // Assume timeStr is in "HH:mm" format (e.g., "01:00", "13:45")
  if (!timeStr) return "";
  const [hourStr, minute] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;
  if (hour === 0) hour = 12; // 12 AM or 12 PM

  return `${hour}:${minute} ${ampm}`;
}

////// Fetch itinerary data including start_date
const fetchItineraryData = async () => {
  try {
    const { data, error } = await supabase
      .from("itineraries")
      .select("name, place, start_date, end_date, cover_pic_url")
      .eq("id", tripId);

    if (error) {
      console.error("Error fetching itinerary data:", error);
      return;
    }

    if (data && data.length > 0) {
      itineraryName.value = data[0].name;
      startDate.value = data[0].start_date || "2023-11-30";
      place.value = data[0].place;
      endDate.value = data[0].end_date;
      coverPicUrl.value = data[0].cover_pic_url || "";
    }
  } catch (err) {
    console.error("Error during fetch:", err);
  }
};

// mode can be either 'edit' or 'new'
async function handleImageUpload(event, mode = "new") {
  isSaving.value = true;

  // 🧹 Handle null event — remove image
  if (!event) {
    if (mode === "edit") {
      editItinerary.value.cover_pic_url = "";
    } else if (mode === "new") {
      newActivity.value.activity_pic_url = "";
    }
    isSaving.value = false;
    console.log("🗑️ Image removed.");
    return;
  }

  const file = event.target?.files?.[0];
  if (!file) {
    isSaving.value = false;
    return;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    console.error("Invalid file type. Please upload a JPG or PNG.");
    isSaving.value = false;
    return;
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `itinerary-assets/${
    currentUser.value.id
  }-${Date.now()}.${fileExt}`;

  // Upload the file
  const { error: uploadError } = await supabase.storage
    .from("itinerary-assets")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("❌ Error uploading image:", uploadError.message);
    isSaving.value = false;
    return;
  }

  // Get Public URL
  const { data } = supabase.storage
    .from("itinerary-assets")
    .getPublicUrl(filePath);

  const publicUrl = data?.publicUrl;

  if (!publicUrl) {
    console.error("❌ Failed to retrieve public URL.");
    isSaving.value = false;
    return;
  }

  // Set image URL based on mode
  if (mode === "edit") {
    editItinerary.value.cover_pic_url = publicUrl;
  } else if (mode === "new") {
    newActivity.value.activity_pic_url = publicUrl;
  } else {
    console.warn("⚠️ Unknown mode passed to handleImageUpload");
  }

  console.log("✅ Image uploaded successfully!", publicUrl);
}

///////MODAL PARTS//////////////////////////////////////////

// Modal Visibitlity state for Activity Modal
const showActivityModal = ref(false);
const isEditMode = ref(false);
// Modal visibility state
const showModal = ref(false);
const originalPotentialActivity = ref(null);

// Form data
const newActivity = ref({
  title: "",
  description: "",
  location: "",
  date: "",
  startTime: "",
  endTime: "",
  type: "",
  activity_pic_url: "",
});

// Reset form when opening modal
const openModal = () => {
  showModal.value = true;
  newActivity.value = {
    title: "",
    description: "",
    location: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "",
    activity_pic_url: "",
  };
};

function handleOutsideClick(event) {
  // Check if click was outside the modal content
  if (modalContent.value && !modalContent.value.contains(event.target)) {
    closeModal();
  }
}

const closeModal = () => {
  showModal.value = false;
  isEditingActivity.value = false;
  isEditMode.value = false;
};

const closeActivityModal = () => {
  showActivityModal.value = false;
  isEditMode.value = false;
  isEditingActivity.value = false;
};

const removePhoto = () => {
  newActivity.value.activity_pic_url = "";
};

///////EDIT ITINERARY DETAILS//////////////////////////////////////////
const showEditModal = ref(false);
const editItinerary = ref({
  name: "",
  location: "",
  start_date: "",
  end_date: "",
  cover_pic_url: "",
});

const originalItineraryDetails = ref({
  name: "",
  location: "",
  start_date: "",
  end_date: "",
  cover_pic_url: "",
});

const openEditModal = () => {
  fetchItineraryData();
  fetchOwnerProfile();
  showEditModal.value = true;

  editItinerary.value = {
    name: itineraryName.value,
    location: place.value, // If your itinerary has a location field
    start_date: startDate.value,
    end_date: endDate.value, // Add if your table has it
    cover_pic_url: coverPicUrl.value || "",
  };
  originalItineraryDetails.value = {
    name: itineraryName.value,
    location: place.value, // If your itinerary has a location field
    start_date: startDate.value,
    end_date: endDate.value, // Add if your table has it
    cover_pic_url: coverPicUrl.value || "", //
  };
};
// Parent component
const hasChangesItinerary = computed(() => {
  return !deepEqual(editItinerary.value, originalItineraryDetails.value);
});

// Add this deep comparison function
function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const closeEditModal = () => {
  showEditModal.value = false;
};
const saveItineraryChanges = async (updatedItinerary) => {
  try {
    console.log("Saving itinerary:", updatedItinerary);

    // 1. Update local state immediately for responsive UI
    editItinerary.value = { ...updatedItinerary };

    // 2. Handle date changes and activity cleanup if needed
    const originalStart = new Date(originalItineraryDetails.value.start_date);
    const originalEnd = new Date(originalItineraryDetails.value.end_date);
    const newStart = new Date(updatedItinerary.start_date);
    const newEnd = new Date(updatedItinerary.end_date);

    // Only check if dates were narrowed (not expanded)
    if (newStart > originalStart || newEnd < originalEnd) {
      const { data: activities, error: activityError } = await supabase
        .from("activities")
        .select("id, date")
        .eq("itinerary_id", tripId);

      if (activityError) throw activityError;

      const outOfRangeActivities = activities.filter((activity) => {
        const activityDate = new Date(activity.date);
        return activityDate > newEnd || activityDate < newStart;
      });

      if (outOfRangeActivities.length > 0) {
        const confirmed = confirm(
          `Changing dates will delete ${outOfRangeActivities.length} activities. Continue?`
        );
        if (!confirmed) return;

        // Delete in transaction
        const { error: deleteError } = await supabase.rpc(
          "delete_activities_and_votes",
          {
            activity_ids: outOfRangeActivities.map((a) => a.id),
          }
        );

        if (deleteError) throw deleteError;
      }
    }

    // 3. Update database
    const { error: updateError } = await supabase
      .from("itineraries")
      .update({
        name: updatedItinerary.name,
        place: updatedItinerary.location,
        start_date: updatedItinerary.start_date,
        end_date: updatedItinerary.end_date,
        cover_pic_url: updatedItinerary.cover_pic_url || "",
      })
      .eq("id", tripId);

    if (updateError) throw updateError;

    // 4. Update local state and close modal
    originalItineraryDetails.value = { ...updatedItinerary };
    showEditModal.value = false;
    showAlert("Itinerary successfully updated!");
    // 5. Refresh any dependent data
    await fetchPotentialActivities(); // Your existing data fetching function
    await fetchActivities();
    fetchItineraryData();
    showAlert("Itinerary successfully updated!");
    //console.log("Successfully saved itinerary");
  } catch (error) {
    showErrorAlert("Something went wrong. Please try again later.");
    console.error("Error saving itinerary:", error);
    // Revert local changes if save failed
    editItinerary.value = { ...originalItineraryDetails.value };
    showErrorAlert("Failed to save changes. Please try again.");
  }
};
///////NEW ACTIVITY//////////////////////////////////////////
// Use this to apply a calendar theme based on activity type
function applyThemeByType(type) {
  const calendarArray = Object.entries(calendars).map(([id, data]) => ({
    id,
    ...data,
  }));

  const calendarExists = calendarArray.find((c) => c.id === type.toLowerCase());
  if (!calendarExists) {
    console.warn(`Unknown activity type: ${type}. Cannot apply theme.`);
    return;
  }

  // You no longer need addCalendar() if you've passed all calendars to createCalendar.
  // Just assign calendarId when creating the event instead.
}

const addActivity = async (index) => {
  const selectedActivity = potentialActivities.value[index];
  console.log("Adding activity:", selectedActivity);

  if (!selectedActivity.date || selectedActivity.date.trim() === "") {
    showErrorAlert("Date is required to add this activity.");
    return;
  }

  const activityDate = new Date(selectedActivity.date);
  const itineraryStart = new Date(originalItineraryDetails.value.start_date);
  const itineraryEnd = new Date(originalItineraryDetails.value.end_date);

  if (
    activityDate.getTime() < itineraryStart.getTime() ||
    activityDate.getTime() > itineraryEnd.getTime()
  ) {
    showErrorAlert("Something went wrong. Please try again later.");
    return;
  }

  if (
    !selectedActivity.start_time ||
    selectedActivity.start_time.trim() === ""
  ) {
    showErrorAlert("Start time is required.");
    return;
  }

  if (!selectedActivity.end_time || selectedActivity.end_time.trim() === "") {
    showErrorAlert("End time is required.");
    return;
  }

  const startTimestamp = `${selectedActivity.date} ${selectedActivity.start_time}:00`;
  const endTimestamp = `${selectedActivity.date} ${selectedActivity.end_time}:00`;

  const { error } = await supabase.from("activities").insert([
    {
      itinerary_id: tripId,
      name: selectedActivity.name,
      description: selectedActivity.description,
      location: selectedActivity.location,
      date: selectedActivity.date,
      start_time: startTimestamp,
      end_time: endTimestamp,
      activity_pic_url: selectedActivity.activity_pic_url,
      type: selectedActivity.type,
    },
  ]);

  if (error) {
    showErrorAlert("Something went wrong. Please try again later.");
    console.error("Failed to insert activity:", error);
    return;
  }

  const { error: deleteError } = await supabase
    .from("potential_activities")
    .delete()
    .eq("id", selectedActivity.id);

  if (deleteError) {
    console.error("Failed to delete from potential_activities:", deleteError);
    return;
  }

  showAlert("Potential activity successfully added!");
  applyThemeByType(selectedActivity.type);

  await fetchPotentialActivities();
  await fetchActivities();
  window.location.reload();
};

//for getting exisiting activities from supabase, for calendar reflection
const fetchActivities = async () => {
  const { data, error } = await supabase
    .from("activities")
    .select(
      "id, name, date, start_time, end_time, description, location, activity_pic_url, type"
    )
    .eq("itinerary_id", tripId);

  if (error) {
    console.error("Error fetching activities:", error);
    return;
  }

  calendarEvents.value = data.map((a) => {
    if (!a.start_time && !a.end_time) {
      // if no stat and end time,, automatic all day
      return {
        id: a.id,
        title: a.name,
        start: `${a.date} 00:00`,
        end: `${a.date} 23:59`,
        description: a.description,
        location: a.location,
        activity_pic_url: a.activity_pic_url,
        type: a.type,
      };
    } else {
      return {
        // with specific start time and end time
        id: a.id,
        title: a.name,
        description: a.description,
        location: a.location,
        start: `${a.date} ${a.start_time?.slice(11, 16)}`,
        end: `${a.date} ${a.end_time?.slice(11, 16)}`,
        activity_pic_url: a.activity_pic_url,
        type: a.type,
      };
    }
  });
};

const hasActivityChanged = computed(() => {
  console.log(
    "New Activity:",
    newActivity.value,
    "Original Activity:",
    originalActivity.value
  );
  const newA = newActivity.value;
  const origA = originalActivity.value;

  return (
    newA.title !== origA.title ||
    newA.location !== origA.location ||
    newA.type !== origA.type ||
    newA.activity_pic_url !== origA.activity_pic_url ||
    newA.description !== origA.description ||
    newA.date !== origA.date ||
    (!isChecked.value &&
      (newA.startTime !== origA.startTime || newA.endTime !== origA.endTime))
  );
});

const saveEditedActivity = async () => {
  // Combine date and time to make valid timestamp strings
  console.log("Saving edited activity:", newActivity.value);
  const startTimestamp = `${newActivity.value.date}T${newActivity.value.startTime}:00`;
  const endTimestamp = `${newActivity.value.date}T${newActivity.value.endTime}:00`;

  const { error } = await supabase
    .from("activities")
    .update({
      name: newActivity.value.title,
      description: newActivity.value.description,
      location: newActivity.value.location,
      date: newActivity.value.date,
      start_time: startTimestamp,
      end_time: endTimestamp,
      type: newActivity.value.type,
      activity_pic_url: newActivity.value.activity_pic_url,
    })
    .eq("id", newActivity.value.id);

  if (error) {
    showAlert("Something went wrong. Please try again later.");
    console.error("Error saving activity:", error);
  } else {
    showAlert("Activity updated successfully!");
    //console.log("Activity updated successfully!", newActivity);
    showActivityModal.value = false;
    await fetchActivities(); // Refresh the calendar
    router.push("/edit-itinerary");
  }
};

const isTimeInvalid = computed(() => {
  if (!newActivity.value.startTime || !newActivity.value.endTime) return false;
  return newActivity.value.endTime <= newActivity.value.startTime;
});

///////VIEW ACTIVITY//////////////////////////////////////////
const editActivity = async () => {
  isEditMode.value = true;
};

const deleteActivity = async () => {
  if (!newActivity.value.id) {
    console.error("No activity selected to delete.");
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to delete this activity?"
  );
  if (!confirmed) return;

  const activityId = newActivity.value.id;
  console.log("Deleting activity with ID:", newActivity.value.id);
  // 1. Delete related votes
  const { error: voteError } = await supabase
    .from("votes")
    .delete()
    .eq("activity_id", activityId);

  if (voteError) {
    console.error("Failed to delete votes:", voteError);
    return;
  }

  // 2. Delete related comments
  const { error: commentError } = await supabase
    .from("comments")
    .delete()
    .eq("activity_id", activityId);

  if (commentError) {
    console.error("Failed to delete comments:", commentError);
    return;
  }

  // 3. Now delete the activity
  const { error: activityError } = await supabase
    .from("activities")
    .delete()
    .eq("id", activityId);

  if (activityError) {
    console.error("Failed to delete activity:", activityError);
    showErrorAlert("Something went wrong. Please try again later.");
  } else {
    //console.log("Activity, votes, and comments deleted successfully");
    showAlert("Activity sucessfully deleted!");
    showActivityModal.value = false;
    showAlert("Activity successfully deleted!");
    window.location.reload();
  }
};

///////POTENTIAL ACTIVITY//////////////////////////////////////////
const potentialActivities = ref([]);
const saveActivity = async () => {
  if (isSaving.value) return; // prevent double submission
  isSaving.value = true;
  const startTime = newActivity.value.startTime;
  const endTime = newActivity.value.endTime;

  console.log("NEW:", newActivity);
  const isAllDay =
    !startTime || startTime === "None" || !endTime || endTime === "None";

  const start_time = isAllDay ? "00:00" : startTime;
  const end_time = isAllDay ? "23:59" : endTime;

  console.log("start_time", start_time);
  console.log("end_time", end_time);

  const { data: profileData, error: profilePicError } = await supabase
    .from("profiles")
    .select("profile_pic_url, username") // Fetch both fields
    .eq("id", currentUser.value.id)
    .single();

  if (profilePicError) {
    console.error("Error fetching profile picture:", profilePicError);
    isSaving.value = false;
    return;
  }

  // Print the fetched data to console
  console.log("Fetched profile data:", {
    profilePicUrl: profileData.profile_pic_url,
    username: profileData.username,
  });

  const profilePicUrl =
    profileData.profile_pic_url ??
    "https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/profile-pictures/default_profpic.jpg";

  const username = profileData.username; // Could add ?? "Anonymous" for fallback
  // Fallback if username is null
  //console.log("TYPE:", newActivity.value.type);
  //console.log("ACTIVITY PIC:", newActivity.value.activity_pic_url);
  //console.log("PROFILE PIC:", profilePicUrl);

  const { error } = await supabase.from("potential_activities").insert([
    {
      name: newActivity.value.title,
      description: newActivity.value.description,
      location: newActivity.value.location,
      date: newActivity.value.date,
      start_time,
      end_time,
      itinerary_id: tripId,
      username: username,
      profile_pic_url: profilePicUrl,
      type: newActivity.value.type,
      user_id: currentUser.value.id,
      activity_pic_url: newActivity.value.activity_pic_url,
    },
  ]);

  if (error) {
    console.error("Error saving potential activity:", error);
    showErrorAlert("Failed to save activity. Please try again.");
    isSaving.value = false;
    return;
  }
  showAlert("New potential activity successfully added!");
  isSaving.value = false;
  closeModal();
  await fetchPotentialActivities();
};
const fetchPotentialActivities = async () => {
  try {
    // 1. Fetch potential activities
    const { data: activities, error } = await supabase
      .from("potential_activities")
      .select("*")
      .eq("itinerary_id", tripId);

    if (error) throw error;
    if (!activities?.length) {
      potentialActivities.value = [];
      return;
    }

    // 2. Filter valid user IDs and remove duplicates
    const userIds = activities
      .map((activity) => activity.user_id)
      .filter(Boolean) // Remove null/undefined
      .filter((id, index, self) => self.indexOf(id) === index); // Unique values

    // 3. Only fetch profiles if we have valid user IDs
    let userMap = {};
    if (userIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", userIds);

      if (profileError) throw profileError;

      profiles.forEach((profile) => {
        userMap[profile.id] = profile.username || "Anonymous";
      });
    }

    // 4. Map usernames to activities
    potentialActivities.value = activities.map((activity) => ({
      ...activity,
      username: activity.user_id
        ? userMap[activity.user_id] || "Anonymous"
        : "System",
    }));

    console.log("Fetched activities:", potentialActivities.value);
  } catch (error) {
    console.error("Fetch error:", error);
    potentialActivities.value = []; // Fallback empty array
  }
};

const removeActivity = async (index) => {
  const selectedActivity = potentialActivities.value[index]; // Access with `.value`
  console.log("Removing activity:", selectedActivity.id);
  try {
    const { error: deleteError } = await supabase
      .from("potential_activities")
      .delete()
      .eq("id", selectedActivity.id);

    if (deleteError) {
      console.error("Failed to delete from potential_activities:", deleteError);
      showErrorAlert("Something went wrong. Please try again later.");
      return;
    } else {
      showAlert("Potential activity sucessfully removed!");
      //console.log("Successfully removed");
      await fetchPotentialActivities();
      await fetchActivities();
    }

    // calendarApp.value?.setEvents([...calendarEvents.value]);
  } catch (err) {
    console.error("Unexpected error during deletion:", err);
  }
};

///////EDIT POTENTIAL ACTIVITY//////////////////////////////////////////
const editPotentialActivity = (activityId) => {
  // Find the activity by ID (works even if filtered)
  const activity = potentialActivities.value.find((a) => a.id === activityId);

  if (!activity) return; // Exit if not found

  // Update the editable activity data
  newActivity.value = {
    id: activity.id,
    title: activity.name || "",
    description: activity.description || "",
    location: activity.location || "",
    date: activity.date || "",
    startTime: activity.start_time || "",
    endTime: activity.end_time || "",
    type: activity.type || "",
    activity_pic_url: activity.activity_pic_url || "",
  };

  // Save the original for comparison
  originalPotentialActivity.value = { ...newActivity.value };

  // Check if it's an all-day event
  isChecked.value =
    (activity.start_time === "00:00" || activity.start_time === "00:00:00") &&
    (activity.end_time === "23:59" || activity.end_time === "23:59:00");

  showModal.value = true;
};

const hasChangesPotential = computed(() => {
  console.log(
    "New Activity:",
    newActivity.value,
    "Original Potential Activity:",
    originalPotentialActivity.value
  );
  console.log(
    "Has Changes:",
    JSON.stringify(newActivity.value) !==
      JSON.stringify(originalPotentialActivity.value)
  );
  return (
    JSON.stringify(newActivity.value) !==
    JSON.stringify(originalPotentialActivity.value)
  );
});

const saveEditedPotentialActivity = async () => {
  //console.log("HERE");
  isSaving.value = true;
  const startTime = newActivity.value.startTime;
  const endTime = newActivity.value.endTime;

  const isAllDay =
    !startTime || startTime === "None" || !endTime || endTime === "None";

  const start_time = isAllDay ? "00:00" : startTime;
  const end_time = isAllDay ? "23:59" : endTime;

  console.log("start_time", start_time);
  console.log("end_time", end_time);

  const { error } = await supabase
    .from("potential_activities")
    .update({
      name: newActivity.value.title,
      description: newActivity.value.description,
      location: newActivity.value.location,
      date: newActivity.value.date,
      start_time,
      end_time,
      type: newActivity.value.type,
      activity_pic_url: newActivity.value.activity_pic_url,
    })
    .eq("id", newActivity.value.id);

  if (error) {
    showErrorAlert("Something went wrong. Please try again later.");
    console.error("Error editing activity:", error);
  } else {
    //console.log("Activity updated!");
    showAlert("Potential activity updated successfully!");
    isSaving.value = false;
    showModal.value = false;
    await fetchPotentialActivities();
  }
};

////////////EDIT ITINERARY NAME PART//////////////////
const tripName = ref("My Itinerary");

const isEditingName = ref(false);
const editableSpan = ref(null);

const startEditingName = () => {
  isEditingName.value = true;
  nextTick(() => {
    const el = editableSpan.value;
    if (el) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  });
};

const updateName = (event) => {
  tripName.value = event.target.innerText;
};

const saveName = async () => {
  isEditingName.value = false;
  console.log("editing name", tripName.value);
  const { error } = await supabase
    .from("itineraries")
    .update({ name: tripName.value })
    .eq("id", tripId);

  if (error) {
    console.error("Error updating itinerary name:", error);
  } else {
    console.log("Itinerary name updated successfully");
  }
  fetchItineraryData();
};

//////////////MEMBERS PART//////////////////
const showMenu = ref({});
const tripMembersInput = ref(""); // Stores the current input email
const tripMembers = ref([]);
const isEmailSelected = ref(true);
const isEditMemberMode = ref(false);
const loading = ref(false);
const ownerProfile = ref({ name: "", username: "", picture: "", id: "" });
const members = ref([]);
const showMembersModal = ref(false);

const openMembersModal = async () => {
  showMembersModal.value = true;
  showMenu.value = false;
  await fetchOwnerProfile();
};

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

const closeMembersModal = () => {
  showMembersModal.value = false;
  showMenu.value = false;
};

const editField = () => {
  isEditMemberMode.value = !isEditMemberMode.value;
};

const fetchOwnerProfile = async () => {
  try {
    console.log("owner", currentUser.value.id);
    console.log("Fetching owner profile for tripId:", tripId);

    // Step 1: Fetch the owner_id from the itineraries table
    const { data: itineraryData, error: itineraryError } = await supabase
      .from("itineraries") // Replace 'itineraries' with your actual table name
      .select("owner_id") // Assuming 'owner_id' is the column for the owner's ID
      .eq("id", tripId) // Filter by the tripId to get the corresponding itinerary
      .single(); // Ensure you get a single result

    if (itineraryError) {
      console.error("Error fetching itinerary data:", itineraryError);
      return;
    }

    if (!itineraryData) {
      console.error("No itinerary data found for tripId:", tripId);
      return;
    }

    const ownerId = itineraryData.owner_id;
    console.log("Fetched owner_id:", ownerId);

    // Step 2: Fetch the owner's profile using the owner_id
    const { data: ownerData, error: ownerError } = await supabase
      .from("profiles") // Replace 'profiles' with your actual profiles table name
      .select("full_name, username, profile_pic_url") // Select the required fields
      .eq("id", ownerId) // Use the owner_id obtained from the itinerary
      .single(); // Ensure you get a single result

    if (ownerError) {
      console.error("Error fetching owner profile:", ownerError);
      return;
    }

    if (!ownerData) {
      console.error("No owner data found for owner_id:", ownerId);
      return;
    }

    // Store the owner profile data
    ownerProfile.value = {
      id: ownerId,
      picture: ownerData.profile_pic_url,
      name: ownerData.full_name,
      username: ownerData.username,
    };

    console.log("Fetched Owner Profile:", ownerProfile.value);

    // Now fetch members' profiles (if needed)
    const { data: memberIds, error: memberIdsError } = await supabase
      .from("itinerary_members")
      .select("user_id")
      .eq("itinerary_id", tripId); // Use tripId to fetch the members for this itinerary

    if (memberIdsError) throw memberIdsError;

    const userIds = memberIds.map((member) => member.user_id);

    const { data: membersData, error: membersError } = await supabase
      .from("profiles")
      .select("full_name, username, profile_pic_url, id")
      .in("id", userIds);

    if (membersError) throw membersError;

    if (membersData) {
      totalMembers.value = membersData.length;
    }

    members.value = membersData.map((member) => ({
      id: member.id,
      username: member.username,
      full_name: member.full_name,
      profile_pic_url:
        member.profile_pic_url ||
        "https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/profile-pictures/default_profpic.jpg", // Default if no profile pic
    }));

    console.log("SUCCESFULLY GOT OWNER", ownerProfile.value);
  } catch (error) {
    console.error("Error:", error);
  }
};

const removeMember = async (username) => {
  try {
    const memberToRemove = members.value.find(
      (member) => member.username === username
    );
    if (!memberToRemove) {
      console.warn("Member not found");
      showErrorAlert("Member not found");
      return;
    }

    // Use tripId from the setup context
    // Use itineraryName as tripName fallback
    const tripName = itineraryName.value || "a trip";

    console.log("Removing from trip:", tripId, memberToRemove.id);

    // Delete the member from the itinerary_members table
    const { error: deleteError } = await supabase
      .from("itinerary_members")
      .delete()
      .eq("user_id", memberToRemove.id)
      .eq("itinerary_id", tripId);

    if (deleteError) throw deleteError;

    // Insert a notification to the removed member
    const { error: notifyError } = await supabase.from("notifications").insert([
      {
        user_id: memberToRemove.id,
        type: "removed",
        message: `${ownerProfile.value.username} removed you from the itinerary "${tripName}"`,
        itinerary_id: tripId,
        sender_id: ownerProfile.value.id,
        image_url: ownerProfile.value.picture,
        itinerary_name: tripName,
        created_at: new Date().toISOString(),
        is_read: false,
      },
    ]);

    if (notifyError) {
      console.warn(
        "Member removed, but notification insert failed:",
        notifyError.message
      );
    }

    // Update frontend
    members.value = members.value.filter(
      (member) => member.username !== username
    );
    isEditMemberMode.value = false;
    showAlert("Member successfully removed!");
  } catch (err) {
    isEditMemberMode.value = false;
    console.error("Error removing member:", err.message);
    showErrorAlert("Something went wrong. Please try again later.");
  }
};

function switchInviteTab(type) {
  if (type === "email") {
    console.log("Switched to email");
    isEmailSelected.value = true;
    // Optionally, set a selectedTab ref if needed
  } else {
    console.log("Switched to username");
    isEmailSelected.value = false;
    // Optionally, set a selectedTab ref if needed
  }
}

const showAlert = (message) => {
  const alertBox = document.createElement("div");
  alertBox.textContent = message;
  alertBox.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #fff; /* Tailwind blue-500, change if you use another theme */
    color: #03aed2;
    padding: 12px 24px;
    border-radius: 7px;
    font-family: 'Sarabun', sans-serif;
    font-size: 16px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000000;
    opacity: 1;
    transition: opacity 0.5s ease, transform 0.5s ease;
  `;

  document.body.appendChild(alertBox);

  // Trigger fade-out and slide-up after 2.5s
  setTimeout(() => {
    alertBox.style.opacity = "0";
    alertBox.style.transform = "translateX(-50%) translateY(-10px)";
    setTimeout(() => document.body.removeChild(alertBox), 500);
  }, 2500);
};

const showErrorAlert = (message) => {
  const alertBox = document.createElement("div");
  alertBox.textContent = message;
  alertBox.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #fff;
    color: #dc2626; /* Tailwind red-600 */
    padding: 12px 24px;
    border-radius: 7px;
    font-family: 'Sarabun', sans-serif;
    font-size: 16px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 100000;
    opacity: 1;
    transition: opacity 0.5s ease, transform 0.5s ease;
  `;

  document.body.appendChild(alertBox);

  setTimeout(() => {
    alertBox.style.opacity = "0";
    alertBox.style.transform = "translateX(-50%) translateY(-10px)";
    setTimeout(() => document.body.removeChild(alertBox), 500);
  }, 2500);
};

const sendInvite = async (tripMembers) => {
  console.log("Sending invite with members:", tripMembers);
  console.log("tripMembers:", tripMembers);
  console.log("type of tripMembers:", typeof tripMembers);

  if (!tripMembers) return;

  const membersArray = tripMembers
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");

  const membersMap = new Map(membersArray.map((m) => [m, true]));

  console.log("✅ Final membersMap:", membersMap);
  // You can now send `membersMap` to your backend or use it as needed.
  if (!tripMembers) return;
  let allInvitesValid = true; // Flag to check if all invites are valid
  let validInvites = []; // To store valid invite data that will be sent later
  let invalidItems = []; // To track invalid items for the alert message

  for (const item of membersArray) {
    if (!item) continue;

    // Email mode
    if (isEmailSelected.value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(item)) {
        invalidItems.push(`"${item}" is not a valid email address.`);
        allInvitesValid = false;
        continue;
      }

      if (
        currentUser.value &&
        (item === currentUser.value.email ||
          item === currentUser.value.username)
      ) {
        invalidItems.push("You cannot invite yourself.");
        allInvitesValid = false;
        continue;
      }

      // Check if the user has already been invited (this is the double check part)
      const { data: existingInviteData, error: inviteError } = await supabase
        .from("trip_invites")
        .select("invited_email")
        .eq("invited_email", item)
        .eq("trip_id", tripId);

      if (inviteError) {
        console.error("Error checking if invite exists:", inviteError.message);
        invalidItems.push(
          `There was an error while checking if "${item}" has already been invited. Please try again later.`
        );
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
        trip_id: tripId,
        invited_email: item,
        inviter_id: currentUser.value.id,
        status: "pending",
        time_stamp: new Date().toISOString(),
      });
    }

    // Username mode
    else {
      if (currentUser.value && item === currentUser.value.username) {
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
        .eq("trip_id", tripId);

      if (inviteError) {
        console.error("Error checking if invite exists:", inviteError.message);
        invalidItems.push(
          `There was an error while checking if "${item}" has already been invited. Please try again later.`
        );
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
        trip_id: tripId,
        invited_email: invitedEmail, // use their email for the invite
        inviter_id: currentUser.value.id,
        status: "pending",
        time_stamp: new Date().toISOString(),
      });
    }
  }

  if (allInvitesValid) {
    // Send all valid invites together
    const { error: inviteInsertError } = await supabase
      .from("trip_invites")
      .insert(validInvites);

    if (inviteInsertError) {
      console.error("Error sending invites:", inviteInsertError.message);
      showErrorAlert(
        "There was an error sending the invites. Please try again."
      );
    } else {
      // Fetch sender's profile for username and profile picture
      const { data: senderProfile, error: senderError } = await supabase
        .from("profiles")
        .select("username, profile_pic_url")
        .eq("id", currentUser.value.id)
        .single();

      if (senderError || !senderProfile) {
        console.error(
          "Failed to fetch sender's profile data:",
          senderError?.message
        );
        showErrorAlert(
          "Invites were sent, but notifications may not have been fully created."
        );
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
          console.warn(
            `Could not find user ID for ${invite.invited_email}, skipping notification.`
          );
          continue;
        }

        notificationsPayload.push({
          user_id: invitedUser.id, // The invited user
          type: "invite",
          message: `${senderProfile.username} invited you to join the itinerary "${itineraryName.value}"`,
          itinerary_id: invite.trip_id,
          sender_id: currentUser.value.id,
          image_url: senderProfile.profile_pic_url, // Include sender's profile pic
          itinerary_name: itineraryName.value, // Include itinerary title
          created_at: new Date().toISOString(),
          is_read: false,
        });
      }

      if (notificationsPayload.length > 0) {
        const { error: notificationError } = await supabase
          .from("notifications")
          .insert(notificationsPayload);

        if (notificationError) {
          console.error(
            "Error inserting notifications:",
            notificationError.message
          );
        } else {
          console.log("send succ");
        }
      }
      console.log("Invites sent successfully:", validInvites);
      showMenu.value = false;
      showMembersModal.value = false;
      showAlert("Invites sent!");
      // Optionally reset modal state here
    }
  } else {
    // Show all invalid items with appropriate alerts
    showErrorAlert(
      `Some invitations could not be sent:\n\n${invalidItems.join("\n")}`
    );
  }
};

const deletePost = async () => {
  try {
    // Ask for confirmation before deleting
    if (!confirm("Are you sure you want to delete this itinerary?")) {
      showMenu.value = false;
      return;
    }

    // 1️⃣ Fetch all activity IDs under this itinerary
    const { data: activities, error: fetchActivitiesError } = await supabase
      .from("activities")
      .select("id")
      .eq("itinerary_id", tripId);
    if (fetchActivitiesError) {
      console.error("Error fetching activities:", fetchActivitiesError);
      return;
    }
    const activityIds = activities.map((a) => a.id);

    // 2️⃣ Delete comments on those activities
    if (activityIds.length) {
      const { error: commentsDeleteError } = await supabase
        .from("comments")
        .delete()
        .in("activity_id", activityIds);
      if (commentsDeleteError) {
        console.error("Error deleting comments:", commentsDeleteError);
        return;
      }

      // 3️⃣ **Delete votes on those same activities** ← NEW
      const { error: activityVotesDeleteError } = await supabase
        .from("votes")
        .delete()
        .in("activity_id", activityIds);
      if (activityVotesDeleteError) {
        console.error(
          "Error deleting votes for activities:",
          activityVotesDeleteError
        );
        return;
      }
    }

    // 4️⃣ Delete the activities themselves
    const { error: activitiesDeleteError } = await supabase
      .from("activities")
      .delete()
      .eq("itinerary_id", tripId);
    if (activitiesDeleteError) {
      console.error("Error deleting activities:", activitiesDeleteError);
      return;
    }

    // 5️⃣ Delete votes that are directly on the itinerary
    const { error: votesDeleteError } = await supabase
      .from("votes")
      .delete()
      .eq("itinerary_id", tripId);
    if (votesDeleteError) {
      console.error("Error deleting itinerary-level votes:", votesDeleteError);
      return;
    }

    // 6️⃣ Delete any potential_activities for this trip
    const { error: potentialDeleteError } = await supabase
      .from("potential_activities")
      .delete()
      .eq("itinerary_id", tripId);
    if (potentialDeleteError) {
      console.error(
        "Error deleting potential activities:",
        potentialDeleteError
      );
      return;
    }

    // 7️⃣ Finally delete the itinerary itself
    const { error: deleteError } = await supabase
      .from("itineraries")
      .delete()
      .eq("id", tripId);
    if (deleteError) {
      console.error("Error deleting itinerary:", deleteError);
      showMenu.value = false;
      showErrorAlert("Failed to delete itinerary. Try again.");
      return;
    }

    showMenu.value = false;
    showAlert("Itinerary deleted successfully!");
    router.push("/dashboard");
  } catch (err) {
    console.error("Unexpected error:", err);
    showMenu.value = false;
    showErrorAlert("Something went wrong. Please try again later.");
  }
};

const leaveTrip = async () => {
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
      showErrorAlert("Something went wrong. Please try again later.");
      return;
    }

    if (trip.owner_id === currentUser.value.id) {
      showErrorAlert("You can't leave this trip because you are the owner.");
      return;
    }

    // Proceed to delete membership
    const { error } = await supabase
      .from("itinerary_members")
      .delete()
      .eq("user_id", currentUser.value.id)
      .eq("itinerary_id", tripId);

    if (error) {
      console.error("Error leaving trip:", error.message);
      showErrorAlert("There was an issue leaving the trip. Please try again.");
      return;
    }

    // Fetch user profile to get username and profile_pic_url
    const { data: senderProfile, error: profileError } = await supabase
      .from("profiles")
      .select("username, profile_pic_url")
      .eq("id", currentUser.value.id)
      .single();

    if (profileError) {
      console.error("Failed to fetch sender profile:", profileError.message);
    }

    // Send notification to the owner
    const { error: notifError } = await supabase.from("notifications").insert([
      {
        user_id: trip.owner_id,
        sender_id: currentUser.value.id,
        type: "left",
        message: `${
          senderProfile?.username || "Someone"
        } left your itinerary "${trip.name}"`,
        itinerary_id: tripId,
        image_url:
          senderProfile?.profile_pic_url ||
          "https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/profile-pictures/default_profpic.jpg",
        itinerary_name: trip.name,
        created_at: new Date().toISOString(),
        is_read: false,
      },
    ]);

    if (notifError) {
      console.error("Failed to send notification:", notifError.message);
    }

    showAlert("You have successfully left the trip!");
    router.push("/dashboard");
  } catch (err) {
    console.error("Unexpected error while leaving trip:", err);
    showErrorAlert("Something went wrong. Please try again later.");
  }
};

//////VOTING PART//////////////////////////////
const yesVotes = ref(0); // Current "Yes" vote count
const noVotes = ref(0); // Current "No" vote count
const userVoted = ref(false); // Track if user has voted
const userVote = ref(""); // Track user's vote ("yes" or "no")

// Function to check if the user has already voted for this event
const checkUserVote = async () => {
  if (!currentUser.value?.id) {
    console.error("User is not logged in.");
    return null;
  }

  const userId = currentUser.value.id;

  console.log("Checking vote for:", userId, tripId, eventId);

  const { data, error } = await supabase
    .from("votes")
    .select("vote")
    .eq("itinerary_id", tripId)
    .eq("activity_id", eventId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      // PGRST116 = no rows found (handled case)
      console.error("Error checking user vote:", error);
    }
    return null;
  }

  if (data) {
    userVoted.value = true;
    userVote.value = data.vote;
    return data.vote;
  }

  return null;
};
// Function to fetch user's existing vote for the event
const fetchUserVote = async (eventId) => {
  if (!currentUser.value?.id) {
    console.error("User is not logged in.");
    return;
  }

  const userId = currentUser.value.id;

  const { data, error } = await supabase
    .from("votes")
    .select("vote")
    .eq("itinerary_id", tripId)
    .eq("activity_id", eventId)
    .eq("user_id", userId)
    .single(); // Since the user can only have one vote per event

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("Error fetching user vote:", error);
    }
    return;
  }

  if (data) {
    userVoted.value = true;
    userVote.value = data.vote;
  }
};

const vote = async (voteType) => {
  if (!currentUser.value?.id) {
    console.error("User is not logged in.");
    return;
  }

  const userId = currentUser.value.id;

  const existingVote = await checkUserVote();

  if (existingVote) {
    // If the user is changing their vote, update the existing vote
    if (userVote.value !== voteType) {
      const { error: updateError } = await supabase
        .from("votes")
        .update({ vote: voteType })
        .eq("itinerary_id", tripId)
        .eq("activity_id", eventId)
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating vote:", updateError);
        return;
      }

      userVote.value = voteType;

      // Adjust the vote counts locally
      if (voteType === "yes") {
        yesVotes.value++;
        noVotes.value--;
      } else if (voteType === "no") {
        noVotes.value++;
        yesVotes.value--;
      }

      // Prevent negative values
      yesVotes.value = Math.max(yesVotes.value, 0);
      noVotes.value = Math.max(noVotes.value, 0);
    } else {
      showErrorAlert(`You already voted '${userVote.value}'`);
      return;
    }
  } else {
    // Insert a new vote
    const { error: insertError } = await supabase.from("votes").insert([
      {
        itinerary_id: tripId,
        activity_id: eventId,
        user_id: userId,
        vote: voteType,
      },
    ]);

    if (insertError) {
      console.error("Error submitting vote:", insertError);
      return;
    }

    userVoted.value = true;
    userVote.value = voteType;

    if (voteType === "yes") {
      yesVotes.value++;
    } else if (voteType === "no") {
      noVotes.value++;
    }

    // Prevent negative values
    yesVotes.value = Math.max(yesVotes.value, 0);
    noVotes.value = Math.max(noVotes.value, 0);
  }
};

const fetchVoteCounts = async (eventId) => {
  const { data, error } = await supabase
    .from("votes")
    .select("vote") // Select only the 'vote' column
    .eq("itinerary_id", tripId) // Filter by tripId
    .eq("activity_id", eventId); // Filter by eventId

  if (error) {
    console.error("Error fetching vote counts:", error);
    return;
  }

  // Initialize counters for "yes" and "no" votes
  let yesVotesCount = 0;
  let noVotesCount = 0;

  // Loop through the data to manually count "yes" and "no" votes
  if (data) {
    data.forEach((vote) => {
      if (vote.vote === "yes") {
        yesVotesCount++;
      } else if (vote.vote === "no") {
        noVotesCount++;
      }
    });
  }

  // Update the UI state with the fetched vote counts
  yesVotes.value = yesVotesCount;
  noVotes.value = noVotesCount;

  console.log("COUNTS:", yesVotes.value, noVotes.value);
};

const yesPercentage = computed(() => {
  const total = totalMembers.value + 1; // Include owner
  const percentage = (yesVotes.value / total) * 100;
  return Math.min(100, Math.round(percentage * 10) / 10); // Rounded to 1 decimal
});

const noPercentage = computed(() => {
  const total = totalMembers.value + 1;
  const percentage = (noVotes.value / total) * 100;
  return Math.min(100, Math.round(percentage * 10) / 10);
});

const isChecked = ref(false); // Starts unchecked

// Reactive all-day checkbox
const isAllDay = ref(isChecked);

watch(isAllDay, (val) => {
  if (val) {
    newActivity.startTime = "00:00"; // 12:00 AM
    newActivity.endTime = "23:59"; // 11:59 PM
  }
});

//////COMMENTS PART//////////////////////////////
const comments = ref([]);
const newComment = ref(""); // Reactive variable to bind the input

const fetchComments = async (activityId) => {
  // Step 1: Fetch comments
  const { data: commentsData, error: commentsError } = await supabase
    .from("comments")
    .select("*")
    .eq("activity_id", activityId)
    .order("created_at", { ascending: true });

  if (commentsError) {
    console.error("Error fetching comments:", commentsError.message);
    return [];
  }

  // Step 2: Extract unique commenter IDs
  const commenterIds = [
    ...new Set(commentsData.map((comment) => comment.commenter_id)),
  ];

  // Step 3: Fetch profiles manually
  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username, profile_pic_url")
    .in("id", commenterIds);

  if (profilesError) {
    console.error("Error fetching commenter profiles:", profilesError.message);
    return [];
  }

  // Step 4: Create a map of profiles
  const profileMap = Object.fromEntries(
    profilesData.map((profile) => [profile.id, profile])
  );

  // Step 5: Merge comments with corresponding profile
  const enrichedComments = commentsData.map((comment) => ({
    ...comment,
    commenter: profileMap[comment.commenter_id] || null,
  }));

  // Step 6: Assign to reactive variable or return
  comments.value = enrichedComments;
  console.log("Here are the comments:");
  console.log(comments.value);
};

// Function to add comment to Supabase
const addComment = async () => {
  if (!newComment.value.trim()) return; // Prevent submitting empty comments

  const commentText = newComment.value.trim();

  const { data, error } = await supabase.from("comments").insert([
    {
      activity_id: eventId,
      commenter_id: currentUser.value.id,
      comment: commentText,
    },
  ]);

  if (error) {
    console.error("Error adding comment:", error.message);
  } else {
    console.log("Comment added:", data);
    newComment.value = ""; // Clear the input after success
  }

  fetchComments(eventId);
};

const currentUserProfilePic = ref("");

const fetchCurrentUserProfilePic = async () => {
  if (!currentUser.value?.id) return;

  const { data, error } = await supabase
    .from("profiles") // your actual table name
    .select("profile_pic_url") // this must match the column name in Supabase
    .eq("id", currentUser.value.id)
    .single();

  if (error) {
    console.error("Error fetching profile pic:", error.message);
  } else {
    currentUserProfilePic.value = data.profile_pic_url;
    console.log("PIC:", currentUserProfilePic.value);
  }
};

const formatTime = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
};

function switchTab(tab) {
  activeTab.value = tab;
  drafts.value = tab === "trips";
}
</script>

<template>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
  />

  <div class="app-container">
    <!-- Top Menu Bar inside a rounded box -->
    <div
      class="menu-bar d-flex justify-content-between align-items-center px-3 py-2 text-white"
    >
      <!-- LEFT SIDE -->
      <div class="d-flex align-items-center">
        <!-- Logo -->
        <router-link to="/dashboard" class="mx-">
          <img
            src="https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/sign/email-assets/laagain-logo.PNG?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJlbWFpbC1hc3NldHMvbGFhZ2Fpbi1sb2dvLlBORyIsImlhdCI6MTc0MDQ1MDcxMSwiZXhwIjoxNzcxOTg2NzExfQ.jShJl7Z3QdCG-kE9akSg5hIC_Ws6dzu54OCFKMXGkps"
            alt="File Icon"
            class="menu-icon"
          />
        </router-link>

        <!-- File Text -->
        <span
          class="mx-2 fw-medium text-white file-hover"
          @click="openEditModal"
          >Edit File</span
        >

        <!-- Divider -->
        <div class="vr-white mx-1"></div>

        <!-- Undo / Redo Icons -->
        <i
          class="bi bi-arrow-counterclockwise text-white menu-icon hide-mobile"
        ></i>
        <i class="bi bi-arrow-clockwise text-white menu-icon hide-mobile"></i>

        <!-- Divider -->
        <div class="vr-white mx-1"></div>

        <!-- Cloud Check Icon -->
        <i
          class="bi bi-cloud-check-fill text-white mx-1 menu-icon hide-mobile"
        ></i>
      </div>

      <!-- RIGHT SIDE -->
      <div class="d-flex align-items-center">
        <!-- Itinerary Name -->
        <span
          class="file-name itinerary-editable-name ellipsis"
          :contenteditable="isEditingName"
          @click="startEditingName"
          @blur="saveName"
          @input="updateName"
          ref="editableSpan"
          aria-label="File name"
          style="font-weight: 500; font-size: 16px"
        >
          {{ itineraryName }}
        </span>

        <!-- Divider -->
        <div class="vr-white mx-2"></div>

        <!-- History Icon with 1px white border, centered -->
        <div
          class="menu-icon-container rounded px-2 mx-1 justify-content-center"
          style="border: 1px solid white; width: 28px"
        >
          <i class="bi bi-clock-history text-white menu-icon-right"></i>
        </div>

        <div
          class="menu-icon-container rounded px-2 mx-1 d-flex align-items-center justify-content-center"
          style="
            border: 1px solid white;
            width: 28px;
            margin-left: 12px;
            height: 26px;
            cursor: pointer;
          "
          @click="goToExplore"
        >
          <i class="bi bi-search text-white menu-icon-right"></i>
        </div>

        <!-- Divider -->
        <div class="vr-white mx-2"></div>

        <!-- Share Button -->
        <div
          class="menu-item share-btn text-white mx-1"
          @click="openMembersModal"
        >
          Share
        </div>
      </div>
    </div>

    <!-- Main Content (Left & Right sections) -->
    <div class="main-content" :class="{ collapsed: isCollapsed }">
      <!-- Left Section -->
      <div class="left-section">
        <button
          class="create-btn d-flex justify-content-center align-items-center gap-1"
          @click="openModal"
        >
          <i class="bi bi-plus-lg"></i>
          <span v-if="!isCollapsed">New Activity</span>
        </button>

        <div modal-header>
          <div class="tab-section full-width">
            <ul class="underline-tabs">
              <li
                class="underline-tab"
                :class="{ active: activeTab === 'trips' }"
                @click="switchTab('trips')"
              >
                <i class="me-1"></i> Activities
              </li>
            </ul>
          </div>
        </div>
        <div style="margin-bottom: 15px; margin-left: 5px; margin-right: 5px">
          <div v-if="drafts">
            <!-- Divider Line -->
            <div class="divider-wrapper"></div>

            <!-- Accommodation Section -->
            <template
              v-if="
                potentialActivities.filter((a) => a.type === 'accommodation')
                  .length > 0
              "
            >
              <h5 class="activity-category-title text-start">Accommodation</h5>
              <div class="activity-list">
                <div
                  v-for="(activity, index) in potentialActivities.filter(
                    (a) => a.type === 'accommodation'
                  )"
                  :key="activity.id"
                  class="activity-card accommodation"
                  @click="editPotentialActivity(activity.id)"
                >
                  <div class="activity-content-columns">
                    <!-- Left Column -->
                    <button
                      class="remove-btn"
                      @click.stop="removeActivity(index)"
                    >
                      ×
                    </button>
                    <div class="activity-column-left">
                      <div class="activity-image-wrapper">
                        <img
                          :src="
                            activity.activity_pic_url ||
                            'https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//default_trip_photo.jpeg'
                          "
                          alt="Activity Image"
                          class="activity-image"
                        />
                      </div>
                    </div>

                    <!-- Right Column -->
                    <div class="activity-column-right">
                      <div class="activity-header">
                        <h2 class="activity-name">
                          {{ activity.name.slice(0, 10)
                          }}{{ activity.name.length > 10 ? "" : "" }}
                        </h2>
                        <span class="circle-separator">•</span>
                        <span class="activity-date">
                          {{ formatDate(activity.date) }}
                        </span>
                      </div>

                      <div class="suggested-by">
                        <img
                          :src="activity.profile_pic_url"
                          alt="Profile"
                          class="profile-pic"
                        />
                        <span class="suggested-name">{{
                          activity.username
                        }}</span>
                      </div>

                      <p class="activity-description">
                        {{
                          activity.description.length > 35
                            ? activity.description.substring(0, 35) + "..."
                            : activity.description
                        }}
                      </p>

                      <div class="activity-meta">
                        <div class="time-container">
                          <i class="bi bi-clock icon"></i>
                          <span class="activity-time">
                            {{ formatPotentialTime(activity.start_time) }}
                          </span>
                        </div>

                        <div class="location-container">
                          <i class="bi bi-geo-alt icon"></i>
                          <span class="activity-location">
                            {{
                              activity.location.length > 27
                                ? activity.location.slice(0, 27) + "..."
                                : activity.location
                            }}
                          </span>
                        </div>
                      </div>
                      <button class="add-btn" @click.stop="addActivity(index)">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Attraction Section -->
            <template
              v-if="
                potentialActivities.filter((a) => a.type === 'attraction')
                  .length > 0
              "
            >
              <h5 class="activity-category-title text-start">Attraction</h5>
              <div class="activity-list">
                <div
                  v-for="(activity, index) in potentialActivities.filter(
                    (a) => a.type === 'attraction'
                  )"
                  :key="activity.id"
                  class="activity-card attraction"
                  @click="editPotentialActivity(activity.id)"
                >
                  <div class="activity-content-columns">
                    <!-- Left Column -->
                    <button
                      class="remove-btn"
                      @click.stop="removeActivity(index)"
                    >
                      ×
                    </button>
                    <div class="activity-column-left">
                      <div class="activity-image-wrapper">
                        <img
                          :src="
                            activity.activity_pic_url ||
                            'https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//default_trip_photo.jpeg'
                          "
                          alt="Activity Image"
                          class="activity-image"
                        />
                      </div>
                    </div>

                    <!-- Right Column -->
                    <div class="activity-column-right">
                      <div class="activity-header">
                        <h2 class="activity-name">
                          {{ activity.name.slice(0, 10)
                          }}{{ activity.name.length > 10 ? "" : "" }}
                        </h2>
                        <span class="circle-separator">•</span>
                        <span class="activity-date">
                          {{ formatDate(activity.date) }}
                        </span>
                      </div>

                      <div class="suggested-by">
                        <img
                          :src="activity.profile_pic_url"
                          alt="Profile"
                          class="profile-pic"
                        />
                        <span class="suggested-name">{{
                          activity.username
                        }}</span>
                      </div>

                      <p class="activity-description">
                        {{
                          activity.description.length > 35
                            ? activity.description.substring(0, 35) + "..."
                            : activity.description
                        }}
                      </p>

                      <div class="activity-meta">
                        <div class="time-container">
                          <i class="bi bi-clock icon"></i>
                          <span class="activity-time">
                            {{ formatPotentialTime(activity.start_time) }}
                          </span>
                        </div>

                        <div class="location-container">
                          <i class="bi bi-geo-alt icon"></i>
                          <span class="activity-location">
                            {{
                              activity.location.length > 27
                                ? activity.location.slice(0, 27) + "..."
                                : activity.location
                            }}
                          </span>
                        </div>
                      </div>
                      <button class="add-btn" @click.stop="addActivity(index)">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <template
              v-if="
                potentialActivities.filter((a) => a.type === 'food').length > 0
              "
            >
              <!-- Food Section -->
              <h5 class="activity-category-title text-start">Food</h5>
              <div class="activity-list">
                <div
                  v-for="(activity, index) in potentialActivities.filter(
                    (a) => a.type === 'food'
                  )"
                  :key="activity.id"
                  class="activity-card food"
                  @click="editPotentialActivity(activity.id)"
                >
                  <div class="activity-content-columns">
                    <!-- Left Column -->
                    <button
                      class="remove-btn"
                      @click.stop="removeActivity(index)"
                    >
                      ×
                    </button>
                    <div class="activity-column-left">
                      <div class="activity-image-wrapper">
                        <img
                          :src="
                            activity.activity_pic_url ||
                            'https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//default_trip_photo.jpeg'
                          "
                          alt="Activity Image"
                          class="activity-image"
                        />
                      </div>
                    </div>

                    <!-- Right Column -->
                    <div class="activity-column-right">
                      <div class="activity-header">
                        <h2 class="activity-name">
                          {{ activity.name.slice(0, 10)
                          }}{{ activity.name.length > 10 ? "" : "" }}
                        </h2>
                        <span class="circle-separator">•</span>
                        <span class="activity-date">
                          {{ formatDate(activity.date) }}
                        </span>
                      </div>

                      <div class="suggested-by">
                        <img
                          :src="activity.profile_pic_url"
                          alt="Profile"
                          class="profile-pic"
                        />
                        <span class="suggested-name">{{
                          activity.username
                        }}</span>
                      </div>

                      <p class="activity-description">
                        {{
                          activity.description.length > 35
                            ? activity.description.substring(0, 35) + "..."
                            : activity.description
                        }}
                      </p>
                      <div class="activity-meta">
                        <div class="time-container">
                          <i class="bi bi-clock icon"></i>
                          <span class="activity-time">
                            {{ formatPotentialTime(activity.start_time) }}
                          </span>
                        </div>

                        <div class="location-container">
                          <i class="bi bi-geo-alt icon"></i>
                          <span class="activity-location">
                            {{
                              activity.location.length > 27
                                ? activity.location.slice(0, 27) + "..."
                                : activity.location
                            }}
                          </span>
                        </div>
                      </div>
                      <button class="add-btn" @click.stop="addActivity(index)">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <template
              v-if="
                potentialActivities.filter((a) => a.type === 'transportation')
                  .length > 0
              "
            >
              <!-- Transportation Section -->
              <h5 class="activity-category-title text-start">Transportation</h5>
              <div class="activity-list">
                <div
                  v-for="(activity, index) in potentialActivities.filter(
                    (a) => a.type === 'transportation'
                  )"
                  :key="activity.id"
                  class="activity-card transportation"
                  @click="editPotentialActivity(activity.id)"
                >
                  <div class="activity-content-columns">
                    <!-- Left Column -->
                    <button
                      class="remove-btn"
                      @click.stop="removeActivity(index)"
                    >
                      ×
                    </button>
                    <div class="activity-column-left">
                      <div class="activity-image-wrapper">
                        <img
                          :src="
                            activity.activity_pic_url ||
                            'https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//default_trip_photo.jpeg'
                          "
                          alt="Activity Image"
                          class="activity-image"
                        />
                      </div>
                    </div>

                    <!-- Right Column -->
                    <div class="activity-column-right">
                      <div class="activity-header">
                        <h2 class="activity-name">
                          {{ activity.name.slice(0, 10)
                          }}{{ activity.name.length > 10 ? "" : "" }}
                        </h2>
                        <span class="circle-separator">•</span>
                        <span class="activity-date">
                          {{ formatDate(activity.date) }}
                        </span>
                      </div>

                      <div class="suggested-by">
                        <img
                          :src="activity.profile_pic_url"
                          alt="Profile"
                          class="profile-pic"
                        />
                        <span class="suggested-name">{{
                          activity.username
                        }}</span>
                      </div>

                      <p class="activity-description">
                        {{
                          activity.description.length > 35
                            ? activity.description.substring(0, 35) + "..."
                            : activity.description
                        }}
                      </p>

                      <div class="activity-meta">
                        <div class="time-container">
                          <i class="bi bi-clock icon"></i>
                          <span class="activity-time">
                            {{ formatPotentialTime(activity.start_time) }}
                          </span>
                        </div>

                        <div class="location-container">
                          <i class="bi bi-geo-alt icon"></i>
                          <span class="activity-location">
                            {{
                              activity.location.length > 27
                                ? activity.location.slice(0, 27) + "..."
                                : activity.location
                            }}
                          </span>
                        </div>
                      </div>
                      <button class="add-btn" @click.stop="addActivity(index)">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div class="left-section" v-else>
            <!-- Explore content -->
            <Explore></Explore>
          </div>
        </div>
      </div>
      <!-- Collapse Button -->
      <button class="collapse-btn" @click="isCollapsed = !isCollapsed">
        <span class="collapse-arrow">
          {{ isCollapsed ? (isMobile ? "↓" : "→") : isMobile ? "↑" : "←" }}
        </span>
      </button>

      <!-- Right Section -->
      <div v-if="calendarApp" class="right-section">
        <!-- Calendar -->
        <ScheduleXCalendar :calendar-app="calendarApp" />
      </div>
    </div>

    <!-- Modal  -->
    <NewActivity
      v-if="showModal"
      :showModal="showModal"
      :newActivity="newActivity"
      :activityPicName="activityPicName"
      :isChecked="isChecked"
      :startDate="startDate"
      :endDate="endDate"
      :isTimeInvalid="isTimeInvalid"
      :isSaving="isSaving"
      :hasChangesPotential="hasChangesPotential"
      @closeModal="closeModal"
      @saveActivity="saveActivity"
      @imageUpload="handleImageUpload"
      @saveEditedPotentialActivity="saveEditedPotentialActivity"
    />
    <EditItineraryDetails
      :show="showEditModal"
      :itinerary="editItinerary"
      :originalItinerary="originalItineraryDetails"
      :ownerProfile="ownerProfile"
      :hasChangesItinerary="hasChangesItinerary"
      @close="closeEditModal"
      @save="saveItineraryChanges"
    />
  </div>

  <!-- Show Activity Modal -->
  <div
    v-if="showActivityModal"
    class="activity-modal-overlay"
    @click.self="closeActivityModal"
  >
    <div
      class="activity-modal"
      ref="modalContent"
      style="max-height: 90vh; padding: 1rem"
    >
      <div class="modal-header activity-modal-header px-3">
        <!-- Title on the left -->
        <h5 class="modal-title mb-0">{{ newActivity.title.slice(0, 13) }}</h5>

        <!-- Centered Tabs -->
        <div class="tab-buttons d-flex justify-content-center flex-grow-1">
          <button
            class="btn custom-tab"
            :class="{ 'active-tab': selectedActivityTab === 'details' }"
            @click="selectedActivityTab = 'details'"
          >
            Details
          </button>
          <button
            class="btn custom-tab"
            :class="{ 'active-tab': selectedActivityTab === 'votes' }"
            @click="selectedActivityTab = 'votes'"
          >
            Votes
          </button>
          <button
            class="btn custom-tab"
            :class="{ 'active-tab': selectedActivityTab === 'notes' }"
            @click="selectedActivityTab = 'notes'"
          >
            Notes
          </button>
        </div>
        <button
          type="button"
          class="btn-close"
          @click="closeActivityModal"
        ></button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body" style="overflow-y: auto; padding: 20px">
        <div v-if="selectedActivityTab === 'details'">
          <!-- your details fields like title, description, date, etc. -->
          <div class="activity-form-wrapper">
            <!-- TOP ROW: Photo | Title + Location -->
            <div class="activity-top-row">
              <!-- Activity Photo -->
              <!-- Title and Location on the left -->
              <div class="activity-text-info">
                <!-- Title -->
                <div class="field-box">
                  <label class="field-label">Activity Title</label>
                  <input
                    v-model="newActivity.title"
                    type="text"
                    class="field-input"
                    placeholder="Enter activity title"
                    maxlength="45"
                  />
                </div>

                <!-- Location -->
                <div class="field-box">
                  <label class="field-label">Location</label>
                  <input
                    v-model="newActivity.location"
                    type="text"
                    class="field-input"
                    placeholder="Enter location"
                    maxlength="45"
                  />
                  <i
                    class="bi bi-geo-alt-fill"
                    style="
                      position: absolute;
                      right: 0.5rem;
                      top: 50%;
                      transform: translateY(-50%);
                      color: gray;
                    "
                  ></i>
                </div>

                <div class="field-box">
                  <label class="field-label">Description</label>
                  <div class="textarea-wrapper">
                    <textarea
                      v-model="newActivity.description"
                      maxlength="70"
                      class="field-input description-textarea"
                      rows="2"
                      placeholder="Enter description"
                    ></textarea>
                    <span class="char-counter"
                      >{{ newActivity.description.length }}/70</span
                    >
                  </div>
                </div>
              </div>

              <!-- Activity Photo on the right -->
              <div class="activity-photo-wrapper">
                <div class="trip-edit-center-wrapper">
                  <label class="trip-edit-dropzone">
                    <!-- If image is uploaded -->
                    <div
                      v-if="newActivity.activity_pic_url"
                      class="trip-edit-img-wrapper"
                    >
                      <img
                        :src="newActivity.activity_pic_url"
                        alt="Activity Image"
                        class="trip-edit-current-img"
                      />
                      <button
                        class="trip-edit-remove-img"
                        @click.stop.prevent="removePhoto"
                        aria-label="Remove activity image"
                      >
                        ×
                      </button>
                    </div>

                    <!-- If no image yet -->
                    <div v-else class="trip-edit-placeholder">
                      <img
                        src="https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets/default_trip_photo.jpeg"
                        alt="Default Placeholder"
                        class="trip-edit-default-icon"
                      />
                      <span class="trip-edit-placeholder-text">
                        Upload your activity image
                      </span>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      @change="handleImageUpload"
                      class="trip-edit-file-hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <!-- The rest below (Description, Date, Time, Type) -->
            <!-- Description -->

            <!-- Date -->
            <div class="field-box">
              <label class="field-label">Date</label>
              <input
                v-model="newActivity.date"
                type="date"
                :min="startDate"
                :max="endDate"
                class="field-input"
              />
            </div>

            <div
              class="field d-flex align-items-center justify-content-between"
            >
              <label class="allday">All Day</label>
              <label class="switch">
                <input type="checkbox" v-model="isAllDay" />
                <span class="slider round"></span>
              </label>
            </div>

            <!-- Start and End Time -->
            <div class="time-row" v-if="!isAllDay">
              <div class="field-box">
                <label class="field-label">Start Time</label>
                <input
                  v-model="newActivity.startTime"
                  type="time"
                  class="field-input"
                />
              </div>

              <div class="field-box">
                <label class="field-label">End Time</label>
                <input
                  v-model="newActivity.endTime"
                  type="time"
                  class="field-input"
                />
              </div>
            </div>

            <!-- Time error -->
            <p v-if="isTimeInvalid" class="time-error">
              End time cannot be earlier than start time.
            </p>

            <div class="field-box">
              <label class="field-label">Type</label>
              <select v-model="newActivity.type" required class="field-input">
                <option disabled value="">Select type</option>
                <option value="accommodation">Accommodation</option>
                <option value="attraction">Attraction</option>
                <option value="food">Food</option>
                <option value="transportation">Transportation</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="selectedActivityTab === 'votes'">
          <!-- Votes -->
          <div class="details-header">
            <strong>Votes</strong>
          </div>

          <div class="d-flex justify-content-center mt-3">
            <div
              style="
                width: 100%;
                max-width: 600px;
                padding: 1rem;
                border: 1px solid #ddd;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                background-color: #fff;
              "
            >
              <!-- Vote Bars -->
              <div class="mb-3">
                <div class="d-flex align-items-center mb-2">
                  <span style="width: 50px" class="text-end pe-2">Yes</span>
                  <div
                    class="flex-grow-1 bg-light rounded-pill shadow-sm"
                    style="height: 12px; position: relative"
                  >
                    <div
                      class="bg-success rounded-pill shadow-sm"
                      :style="{
                        height: '100%',
                        width: yesPercentage + '%',
                        transition: 'width 0.3s',
                      }"
                    ></div>
                  </div>
                  <span class="ms-2 text-muted small"
                    >{{ yesVotes }} votes</span
                  >
                </div>
                <div class="d-flex align-items-center">
                  <span style="width: 50px" class="text-end pe-2">No</span>
                  <div
                    class="flex-grow-1 bg-light rounded-pill shadow-sm"
                    style="height: 12px; position: relative"
                  >
                    <div
                      class="bg-danger rounded-pill shadow-sm"
                      :style="{
                        height: '100%',
                        width: noPercentage + '%',
                        transition: 'width 0.3s',
                      }"
                    ></div>
                  </div>
                  <span class="ms-2 text-muted small">{{ noVotes }} votes</span>
                </div>
              </div>

              <!-- Voting Buttons -->
              <div class="d-flex justify-content-center gap-2">
                <button
                  class="btn btn-outline-success btn-sm px-3"
                  @click="vote('yes')"
                >
                  Yes
                </button>
                <button
                  class="btn btn-outline-danger btn-sm px-3"
                  @click="vote('no')"
                >
                  No
                </button>
              </div>

              <!-- Vote Status -->
              <div class="text-center mt-2 text-muted small" v-if="!userVoted">
                You haven't voted yet.
              </div>
              <div class="text-center mt-2 text-muted small" v-else>
                You voted: {{ userVote }}.
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedActivityTab === 'notes'">
          <!-- Comments -->
          <div class="details-header">
            <strong>Notes</strong>
          </div>

          <div
            class="mt-3 d-flex align-items-center"
            style="width: 100%; max-width: 600px"
          >
            <!-- User Profile Picture -->
            <img
              :src="
                currentUserProfilePic ||
                'https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/profile-pictures/default_profpic.jpg'
              "
              alt="User DP"
              style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                object-fit: cover;
                margin-right: 0px;
                margin-left: 10px;
              "
            />

            <!-- Input Field -->
            <input
              v-model="newComment"
              type="text"
              id="noteInput"
              class="comment-input"
              placeholder="Add a comment..."
              maxlength="40"
              style="flex: 1"
            />

            <!-- Submit Button -->
            <button
              class="btn custom-comment-btn ms-2"
              @click="addComment"
              type="submit"
            >
              <i class="fas fa-pencil-alt"></i>
            </button>
          </div>

          <!-- Comment List -->
          <div
            class="mt-3 d-flex flex-column align-items-center"
            v-if="comments.length"
          >
            <div
              v-for="comment in [...comments].reverse()"
              :key="comment.id"
              class="note-card shadow-sm mb-3"
            >
              <div class="d-flex align-items-center">
                <img
                  :src="
                    comment.commenter?.profile_pic_url || 'default-avatar.png'
                  "
                  alt="Profile Picture"
                  class="profile-avatar"
                />
                <div class="ms-2 flex-grow-1">
                  <div
                    class="d-flex justify-content-between align-items-center mb-1"
                  >
                    <small class="text-muted commenter-name">
                      {{ comment.commenter?.username || "Anonymous" }}
                    </small>
                    <small class="comment-timestamp text-muted">
                      {{ formatTime(comment.created_at) }}
                    </small>
                  </div>
                  <div class="comment-text">
                    {{ comment.comment }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="mt-5 mb-5 text-muted"
            v-else
            style="text-align: center; font-style: italic"
          >
            No notes here.
          </div>
        </div>
      </div>
      <!-- end modal-body -->

      <div class="modal-footer-act justify-content-between border-top">
        <button class="btn custom-delete" @click="deleteActivity">
          <i class="bi bi-trash-fill me-1 delete-icon"></i> Delete
        </button>

        <button
          v-if="selectedActivityTab === 'details'"
          class="btn custom-save"
          :disabled="
            !newActivity.title ||
            newActivity.title.trim() === '' ||
            !newActivity.location ||
            !newActivity.description ||
            !newActivity.date ||
            (!isChecked && (!newActivity.startTime || !newActivity.endTime)) ||
            (!isChecked && isTimeInvalid) ||
            !hasActivityChanged
          "
          @click="saveEditedActivity"
        >
          <i class="bi bi-check-circle-fill me-1 save-icon"></i> Save
        </button>
      </div>
    </div>
    <!-- end .activity-modal -->
  </div>
  <!-- end .activity-modal-overlay -->

  <!-- View Members Modal -->
  <InviteModal
    :show-members-modal="showMembersModal"
    :owner-profile="ownerProfile"
    :current-user="currentUser"
    :itinerary-name="itineraryName"
    :members="members"
    :loading="loading"
    @closeMembersModal="closeMembersModal"
    @toggleMenu="toggleMenu"
    @deletePost="deletePost"
    @leaveTrip="leaveTrip"
    @sendInvite="sendInvite"
    @removeMember="removeMember"
    @editField="editField"
    @switchInviteTab="switchInviteTab"
  />
</template>

<style scoped>
@import "../assets/styles/edititinerary.css"; /* Import external CSS file */
</style>
