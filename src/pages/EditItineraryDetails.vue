<template>
  <div v-if="show" class="trip-edit-overlay" @click.self="closeEditModal">
    <div class="trip-edit-modal p-3">
      <div class="trip-edit-scroll-wrapper">
        <!-- Title and Edit Icon -->
        <div class="trip-edit-header">
          <template v-if="editNameMode">
            <input
              class="trip-edit-title-input"
              v-model="localItinerary.name"
              @blur="editNameMode = false"
            />
          </template>
          <template v-else>
            <h2 class="trip-edit-title">
              {{
                localItinerary.name.length > 20
                  ? localItinerary.name.substring(0, 20) + "..."
                  : localItinerary.name
              }}
            </h2>

            <button class="trip-edit-icon" @click="editNameMode = true">
              <i class="bi bi-pencil-fill"></i>
            </button>
          </template>
        </div>

        <!-- Creator Info -->
        <div class="trip-edit-created-inline">
          <span class="trip-edit-created-label">Created by</span>
          <img
            :src="ownerProfile.picture"
            alt="User"
            class="trip-edit-avatar-inline"
          />
          <span class="trip-edit-username-inline">
            {{ ownerProfile.username }}
          </span>
        </div>

        <hr class="trip-edit-divider" />

        <!-- Location Input -->
        <div class="trip-edit-input-group">
          <label class="text-start trip-edit-label">Location</label>
          <div class="trip-edit-input-wrapper">
            <span class="trip-edit-icon-inside">
              <i class="bi bi-geo-alt-fill"></i>
            </span>
            <input
              class="trip-edit-input with-icon"
              style="margin-left: 5%"
              v-model="localItinerary.location"
              placeholder="Location"
              maxlength="40"
            />
          </div>
          <p v-if="errors.location" class="trip-edit-error">
            {{ errors.location }}
          </p>
        </div>

        <!-- Duration Dates -->
        <div class="trip-edit-input-group">
          <label class="text-start trip-edit-label">Duration</label>
          <div class="trip-edit-date-row">
            <input
              class="trip-edit-date"
              type="date"
              v-model="localItinerary.start_date"
            />

            <span class="trip-edit-date-separator">—</span>
            <input
              class="trip-edit-date"
              type="date"
              v-model="localItinerary.end_date"
              :min="localItinerary.start_date"
            />
          </div>
          <p
            v-if="errors.start_date || errors.end_date"
            class="trip-edit-error"
          >
            {{ errors.start_date || errors.end_date }}
          </p>
        </div>

        <!-- Trip Picture -->
        <div class="trip-edit-input-group text-center">
          <label class="trip-edit-label mb-2 text-start">Trip Photo</label>
          <div class="trip-edit-center-wrapper">
            <label class="trip-edit-dropzone">
              <div
                v-if="localItinerary.cover_pic_url"
                class="trip-edit-img-wrapper"
              >
                <img
                  :src="localItinerary.cover_pic_url"
                  alt="Trip Cover"
                  class="trip-edit-current-img"
                />
                <button
                  class="trip-edit-remove-img"
                  @click.stop.prevent="removePhoto"
                  aria-label="Remove cover photo"
                >
                  ×
                </button>
              </div>

              <div v-else class="trip-edit-placeholder">
                <img
                  src="https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//default_trip_photo.jpeg"
                  alt="Default"
                  class="trip-edit-default-icon"
                />
                <span class="trip-edit-placeholder-text"
                  >Upload your cover photo</span
                >
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                @change="(e) => handleImageUpload(e)"
                class="trip-edit-file-hidden"
              />
            </label>
          </div>
        </div>
      </div>
      <!-- Action Buttons -->
      <footer class="trip-edit-footer">
        <div
          class="trip-edit-actions d-flex align-items-center justify-content-between"
        >
          <button class="cancel-button" @click="closeEditModal">Cancel</button>

          <div class="flex-grow-1 d-flex justify-content-center">
            <p
              v-if="errors.name"
              class="trip-edit-error text-center m-0"
              style="margin-left: 10px"
            >
              {{ errors.name }}
            </p>
          </div>

          <button
            class="publish-button"
            @click="saveItineraryChanges"
            :disabled="!hasChanges"
          >
            Save Changes
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed, watch } from "vue";
import { onMounted, onUnmounted } from "vue";
// Utility function for deep comparison
function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Props
const props = defineProps({
  show: Boolean,
  itinerary: Object,
  ownerProfile: Object,
  hasChangesItinerary: Boolean,
  editItinerary: {
    type: Object,
    default: () => ({}),
  },
});

// Emits
const emit = defineEmits(["close", "save"]);

// Local state
const localItinerary = reactive(JSON.parse(JSON.stringify(props.itinerary)));
const editNameMode = ref(false);

// Change detection
const hasChanges = computed(() => {
  const fieldsToCompare = [
    "name",
    "location",
    "start_date",
    "end_date",
    "cover_pic_url",
  ];
  return fieldsToCompare.some(
    (field) => !deepEqual(localItinerary[field], props.itinerary[field])
  );
});

const isValid = computed(() => {
  return (
    localItinerary.name?.trim() &&
    localItinerary.location?.trim() &&
    localItinerary.start_date &&
    localItinerary.end_date
  );
});

// Add to your script setup
onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});

const handleKeydown = (e) => {
  if (e.key === "Escape" && show.value) {
    closeEditModal();
  }
};

// Watchers
watch(
  () => props.itinerary,
  (newVal) => {
    Object.assign(localItinerary, JSON.parse(JSON.stringify(newVal)));
  },
  { deep: true }
);

// Methods
const closeEditModal = () => {
  emit("close");
};
const errors = reactive({
  name: "",
  location: "",
  start_date: "",
  end_date: "",
});

const saveItineraryChanges = () => {
  // Reset errors
  errors.name = "";
  errors.location = "";
  errors.start_date = "";
  errors.end_date = "";

  let valid = true;

  if (!localItinerary.name?.trim()) {
    errors.name = "Trip name is required.";
    valid = false;
  }

  if (!localItinerary.location?.trim()) {
    errors.location = "Location is required.";
    valid = false;
  }

  if (!localItinerary.start_date) {
    errors.start_date = "Start date is required.";
    valid = false;
  }

  if (!localItinerary.end_date) {
    errors.end_date = "End date is required.";
    valid = false;
  }

  if (
    localItinerary.start_date &&
    localItinerary.end_date &&
    localItinerary.end_date < localItinerary.start_date
  ) {
    errors.end_date = "End date cannot be before start date.";
    valid = false;
  }

  if (!valid) return;

  emit("save", localItinerary);
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    localItinerary.cover_pic_url = reader.result;
  };
  reader.readAsDataURL(file);
};

const removePhoto = () => {
  localItinerary.cover_pic_url = "";
};
</script>

<style scoped>
/* ========== BASE STYLES ========== */
html,
body {
  overflow: hidden; /* Prevents scrolling */
  margin: 0; /* Removes default margin */
  padding: 0; /* Removes default padding */
  height: 100%; /* Makes html/body fill the viewport height */
  font-family: "Sarabun", sans-serif !important; /* Sets the font */
}
/* Modal Overlay */
.trip-edit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  transition: opacity 0.2s ease;
}

.trip-edit-modal {
  background: #fff;
  padding: 0;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  font-family: "Segoe UI", sans-serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.trip-edit-scroll-wrapper {
  padding: 24px;
  overflow-y: auto;
}

.v-leave-active .trip-edit-overlay {
  opacity: 0;
}

.v-leave-active .trip-edit-modal {
  transform: scale(0.95);
  opacity: 0;
}

/* Header */
.trip-edit-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.trip-edit-title,
.trip-edit-title-input {
  font-size: 27px;
  font-weight: 600;
  color: #444;
  margin: 0;
}

.trip-edit-title-input {
  border: none;
  border-bottom: 2px solid #444;
  outline: none;
  background: transparent;
  width: 100%;
}

/* Edit Icon Button */
.trip-edit-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  font-size: 18px;
  color: #555;
  display: flex;
  align-items: center;
}

/* Form Labels & Groups */
.trip-edit-input-group {
  margin: 1rem 0 1.5rem;
  font-family: "Sarabun", sans-serif;
}

.trip-edit-label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #03aed2;
  font-size: 16px;
}

/* Input With Inside Icon */
.trip-edit-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #03aed2;
  border-radius: 10px;
  transition: all 0.3s;
  background-color: #fff;
  color: #333;
}

.trip-edit-icon-inside {
  position: absolute;
  left: 10px;
  color: #888;
  font-size: 1rem;
  pointer-events: none;
  transition: color 0.3s;
}

.trip-edit-input.with-icon {
  padding-left: 36px;
  border: none;
  outline: none;
  width: 100%;
  padding: 10px 12px;
  font-size: 16px;
  background: transparent;
  color: #333;
  font-family: "Sarabun", sans-serif;
}

.trip-edit-input-wrapper:hover {
  border-color: #03aed2;
}

/* Regular Inputs */
.trip-edit-input {
  width: 100%;
  color: #333;
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 16px;
}

/* Creator Info */
.trip-edit-created-inline {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.trip-edit-created-label,
.trip-edit-username-inline {
  font-size: 14px;
  font-style: italic;
  font-weight: 500;
  color: #555;
}

.trip-edit-avatar-inline {
  width: 29px;
  height: 29px;
  border-radius: 50%;
  object-fit: cover;
}

/* Divider */
.trip-edit-divider {
  border: none;
  border-top: 1px solid #555;
}

/* Date Section */
.trip-edit-date-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.trip-edit-date {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #03aed2;
  background-color: #fff;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
  outline: none;
  color: #333;
}

.trip-edit-date:hover,
.trip-edit-date:focus {
  border-color: #03aed2;
  box-shadow: 0 0 0 0.2rem rgba(3, 174, 210, 0.25);
}

.trip-edit-date-separator {
  font-weight: bold;
  color: #03aed2;
}

/* Buttons and Actions */
.trip-edit-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 15px;
  width: 100%;
  box-sizing: border-box;
  padding: 0 18px;
}

.publish-button,
.cancel-button {
  padding: 0.5rem 1rem;
  font-size: 16px;
  border-radius: 30px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: -15px;
}

.publish-button {
  background-color: #03aed2;
  color: white;
}

.publish-button:hover {
  background-color: #019dbc;
}

.publish-button:disabled {
  background-color: #b5ecf7;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #ccc;
  color: #333;
  margin-right: auto;
}

.cancel-button:hover {
  background-color: #bbb;
}

.trip-edit-footer {
  position: sticky;
  bottom: 0;
  background-color: #fff;
  padding: 1rem;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: flex-end;
  z-index: 10;
}

.trip-edit-error {
  color: red;
  font-size: 13px;
  margin-top: 4px;
  margin-left: 4px;
  text-align: left;
}

/* Dropzone */
.trip-edit-center-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.trip-edit-dropzone {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 2px dashed #ccc;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  width: 100%;
  max-width: 430px;
  min-height: 240px;
  max-height: 60vh;
  min-height: 240px;
  text-align: center;
  background-color: #f9f9f9;
}

.trip-edit-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: "Sarabun", sans-serif;
}

.trip-edit-default-icon {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 10px;
  opacity: 0.6;
}

.trip-edit-placeholder-text {
  font-size: 14px;
  color: #888;
}

.trip-edit-file-hidden {
  display: none;
}

.trip-edit-img-wrapper {
  position: relative;
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  height: 100%;
  max-height: 200px;
}

.trip-edit-current-img {
  display: block;
  max-width: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.trip-edit-remove-img {
  position: absolute;
  top: 6px;
  right: 6px;
  background: none;
  border: none;
  color: #f9f9f9;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  font-weight: bold;
}

.trip-edit-remove-img:hover {
  color: #d6d6d6;
}

/* ========== RESPONSIVENESS ========== */

@media (max-width: 600px) {
  .trip-edit-modal {
    width: 90%;
    max-width: 100%;
    border-radius: 12px;
    max-height: 70vh;
  }

  .trip-edit-title,
  .trip-edit-title-input {
    font-size: 22px;
  }

  .trip-edit-label {
    font-size: 15px;
  }

  .trip-edit-input,
  .trip-edit-input.with-icon {
    font-size: 15px;
  }

  .trip-edit-dropzone {
    max-width: 100%;
    min-height: 170px;
    padding: 12px;
  }

  .trip-edit-date {
    max-width: 44%;
  }

  .trip-edit-default-icon {
    width: 60px;
    height: 60px;
  }
}

@media (max-width: 1366px) {
  .trip-edit-modal {
    width: 100%;
    max-width: 60%;
    border-radius: 10px;
    max-height: 70vh;
  }
}
@media (max-width: 480px) {
  /* Form Labels & Groups */
  .trip-edit-icon {
    margin-bottom: 10px;
  }
  .trip-edit-avatar-inline {
    width: 23px;
    height: 23px;
    border-radius: 50%;
    object-fit: cover;
  }
  .trip-edit-modal {
    width: 90%;
    max-width: 100%;
    border-radius: 10px;
    max-height: 65vh;
  }

  .trip-edit-title,
  .trip-edit-title-input {
    font-size: 23px;
    margin-bottom: 10px;
  }

  .trip-edit-label {
    font-size: 14px;
  }

  .trip-edit-input,
  .trip-edit-input.with-icon {
    font-size: 14px;
  }

  .trip-edit-icon-inside {
    left: 10px;
    margin-right: 20px;
  }

  .trip-edit-dropzone {
    max-width: 100%;
    min-height: 150px;
    padding: 10px;
  }

  .trip-edit-date {
    max-width: 43%;
  }

  .trip-edit-default-icon {
    width: 50px;
    height: 50px;
  }
  .trip-edit-input-group {
    margin: 0rem 0 0.7rem;
  }
}
</style>