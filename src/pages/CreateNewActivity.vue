<template>
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content custom-modal rounded">
      <div
        class="modal-header sticky-top bg-white p-3 border-bottom"
        style="z-index: 1; left: 20px"
      >
        <h5>{{ newActivity.id ? "Edit Activity" : "New Activity" }}</h5>
      </div>
      <div class="modal-scrollable">
        <div class="modal-body p-2" style="margin-top: -5px">
          <form
            @submit.prevent="
              newActivity.id ? saveEditedPotentialActivity() : saveActivity()
            "
            class="form-fields"
          >
            <!-- Styled Activity Image Upload -->
            <div class="trip-edit-input-group text-center field">
              <label>Activity Photo</label>
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

                  <!-- Hidden file input -->
                  <input
                    type="file"
                    accept="image/*"
                    @change="onImageChange"
                    class="trip-edit-file-hidden"
                  />
                </label>
              </div>

              <!-- Filename display -->
              <p v-if="activityPicName" class="image-error mt-2">
                Selected Image:
                {{
                  newActivity.activity_pic_url
                    ? activityPicName
                    : "No image selected"
                }}
              </p>
            </div>

            <!-- Activity Title -->
            <div class="field">
              <label>Activity Title</label>
              <input
                v-model="newActivity.title"
                placeholder="Activity Title"
                @blur="checkTitle"
              />
            </div>

            <p
              v-if="
                formSubmitted &&
                (!newActivity.title || newActivity.title.trim() === '')
              "
              class="image-error"
            >
              Title is required.
            </p>

            <!-- Description -->
            <div class="field textarea-field">
              <label>Description</label>
              <div class="textarea-wrapper">
                <textarea
                  v-model="newActivity.description"
                  maxlength="70"
                  placeholder="Description"
                ></textarea>
                <span class="char-counter">
                  {{ newActivity.description.length }}/70
                </span>
              </div>
            </div>

            <!-- Location -->
            <div class="field">
              <label>Location</label>
              <input
                v-model="newActivity.location"
                placeholder="Location"
                @blur="checkLocation"
              />
            </div>
            <p
              v-if="
                formSubmitted &&
                (!newActivity.location || newActivity.location.trim() === '')
              "
              class="image-error"
            >
              Location is required.
            </p>

            <!-- Date -->
            <div class="field">
              <label>Date</label>
              <input
                type="date"
                v-model="newActivity.date"
                :min="startDate"
                :max="endDate"
                required
              />
            </div>
            <p
              v-if="
                formSubmitted &&
                (!newActivity.date || newActivity.date.trim() === '')
              "
              class="image-error"
            >
              Date is required.
            </p>

            <!-- All Day Toggle Switch -->
            <div
              class="field d-flex align-items-center justify-content-between"
            >
              <label>All Day</label>
              <label class="switch">
                <input type="checkbox" v-model="isAllDay" />
                <span class="slider round"></span>
              </label>
            </div>

            <!-- Time Range - Only shows when NOT All Day -->
            <!-- Time Range - Only shows when NOT All Day -->
            <div class="trip-edit-input-group" v-if="!isAllDay">
              <div class="field trip-edit-label-row">
                <label class="trip-edit-label">Start Time</label>
                <label class="trip-edit-label">End Time</label>
              </div>
              <div class="trip-edit-date-row">
                <input
                  class="trip-edit-date"
                  type="time"
                  v-model="newActivity.startTime"
                />
                <span class="trip-edit-date-separator">—</span>
                <input
                  class="trip-edit-date"
                  type="time"
                  v-model="newActivity.endTime"
                />
              </div>
              <p v-if="isTimeInvalid && !isAllDay" class="trip-edit-error">
                End time must be after start time.
              </p>
            </div>

            <!-- Type -->
            <div class="field">
              <label>Type</label>
              <select v-model="newActivity.type" required>
                <option disabled value="">Select type</option>
                <option value="attraction">Attraction</option>
                <option value="accommodation">Accommodation</option>
                <option value="transportation">Transportation</option>
              </select>
            </div>

            <p
              v-if="
                formSubmitted &&
                (!newActivity.type || newActivity.type.trim() === '')
              "
              class="image-error"
            >
              Type is required.
            </p>
            <!--Typ Time Error -->
            <p v-if="formSubmitted && isTimeInvalid" class="image-error">
              End time cannot be earlier than start time.
            </p>

            <!-- Buttons -->
            <div
              class="d-flex justify-content-between gap-5"
              style="margin-top: 16px; gap: 20px; margin-top: 1px; width: 100%"
            >
              <button type="button" @click="closeModal" class="cancel-button">
                Cancel
              </button>
              <button
                @click="
                  newActivity.id
                    ? saveEditedPotentialActivity()
                    : saveActivity()
                "
                class="publish-button"
                :disabled="
                  isSaving ||
                  !newActivity.title ||
                  newActivity.title.trim() === '' ||
                  !newActivity.location ||
                  !newActivity.type ||
                  !newActivity.date ||
                  (!isChecked &&
                    (!newActivity.startTime || !newActivity.endTime)) ||
                  (!isChecked && isTimeInvalid) ||
                  !hasChangesPotential
                "
              >
                {{ newActivity.id ? "Save Changes" : "Create" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
const formErrors = ref([]);
const formSubmitted = ref(false);

const props = defineProps([
  "showModal",
  "newActivity",
  "activityPicName",
  "isChecked",
  "startDate",
  "endDate",
  "isTimeInvalid",
  "isSaving",
  "hasChangesPotential",
]);

// Define emits
const emit = defineEmits([
  "closeModal",
  "saveActivity",
  "saveEditedPotentialActivity",
  "imageUpload", // Add this so the parent can catch the image upload
]);

// Reactive all-day checkbox
const isAllDay = ref(props.isChecked);

watch(isAllDay, (val) => {
  if (val) {
    props.newActivity.startTime = "00:00"; // 12:00 AM
    props.newActivity.endTime = "23:59"; // 11:59 PM
  }
});
// Emit functions
const closeModal = () => {
  formSubmitted.value = false;
  emit("closeModal");
};

// ✅ Image upload handler for file input
const onImageChange = (event) => {
  emit("imageUpload", event);
};

const saveActivity = () => {
  formSubmitted.value = true;
  emit("saveActivity");
};

const saveEditedPotentialActivity = () => {
  formSubmitted.value = true;
  emit("saveEditedPotentialActivity");
};

const removePhoto = (event) => {
  event.cover_pic_url = "";
};
</script>

<style scoped>

html, body {
  overflow: hidden;         /* Prevents scrolling */
  margin: 0;                /* Removes default margin */
  padding: 0;               /* Removes default padding */
  height: 100%;             /* Makes html/body fill the viewport height */
  font-family: "Sarabun", sans-serif !important;  /* Sets the font */
}
.field {
  width: 100%;
}
.modal-overlay {
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh; /* Full screen height */

  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.3); /* Optional: slight backdrop */
  z-index: 1000;
}
.custom-modal {
  width: 80%;
  max-width: 500px;
  max-height: 90vh;
  background: white;
  border-radius: 120px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
  overflow: hidden; /* Prevent inner overflow from breaking corners */
}

.modal-header {
  position: sticky;
  top: 0;
}

@media (max-width: 600px) {
  .modal-overlay {
    position: fixed;
    top: auto;
    bottom: 0;
    width: 100%;
    align-items: flex-end;
    padding: 0;
  }

  .custom-modal {
    width: 100%;
    border-radius: 24px 24px 24px 24px; /* rounded top only */
    overflow: hidden;
  }

  .modal-body {
    max-height: 70vh;
    overflow-y: auto;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0%);
  }
}
.container {
  padding: 0;
  display: flex;
  justify-content: center;
  font-family: Arial, sans-serif;
}

.create-pin {
  display: flex;
}

.image-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-preview {
  border-radius: 16px;
  border: 1px solid #ccc;
  width: 400px; /* fixed width */
  height: 200px; /* fixed height, adjust as needed */
  object-fit: cover; /* cover to fill area, cropping if needed */
  display: block; /* removes inline gap below image */
}
.form-section {
  flex: 1.5;
  display: flex;
  width: 100%;
  flex-direction: column;
  width: 100%;
}

.modal-scrollable {
  max-height: 70vh; /* adjust as needed */
  overflow-y: auto;
  padding: 0 1rem;
}

.form-title {
  position: absolute;
  margin-bottom: 1rem;
  font-size: 24px;
  font-weight: bold;
}

.form-fields {
  display: flex;
  width: 100%;
  padding: 2.1rem;
  flex-direction: column;
  gap: 1.2rem;
}

.field label {
  font-weight: bold;
  margin-bottom: 0.25rem;
  display: block;
  font-family: "Sarabun", sans-serif;
  text-align: left;
  color: #03aed2;
}

.field input,
.field textarea,
.field select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #03aed2;
  border-radius: 10px;
  font-size: 16px;
  background: #fff;
  color: #333;
  font-family: "Sarabun", sans-serif;
}

.field textarea {
  resize: vertical;
  min-height: 70px;
}

.field small {
  color: #03aed2;
  font-size: 12px;
}

.trip-edit-center-wrapper {
  max-height: 80vh;
  max-width: 80vmax; /* or any height you want */
  overflow-y: auto;
}
.publish-button {
  background-color: #03aed2;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem; /* only keep one */
  font-size: 16px !important; /* only keep one */
  border-radius: 30px;
  cursor: pointer;
  align-self: flex-end;
  font-family: "Sarabun", sans-serif;
}

.publish-button:hover {
  background-color: #019dbc;
}

.cancel-button {
  background-color: #ccc;
  color: black;
  border: none;
  padding: 0.5rem 1.5rem; /* reduce top/bottom and left/right padding */
  font-size: 16px !important; /* smaller text */
  border-radius: 20px; /* optional: make less round */
  cursor: pointer;
  align-self: flex-end;
  font-family: "Sarabun", sans-serif;
}

.cancel-button:hover {
  background-color: #bbb;
}

.date-range {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
}

.date-range .date-input {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.image-error {
  color: red;
  margin-top: -0.6rem;
  margin-bottom: -0.6rem;
  text-align: left;
}

.textarea-wrapper {
  position: relative;
}

.char-counter {
  bottom: 8px;
  position: absolute;
  right: 12px;
  font-size: 12px;
  color: #888;
}
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  margin-left: 10px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
/* Toggle slider base style */
.slider {
  position: absolute;
  cursor: pointer;
  background-color: #ccc;
  border-radius: 34px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: 0.4s;
}

/* Circle inside the toggle */
.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

/* Dropzone */
.trip-edit-center-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}.trip-edit-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100px;
  justify-content: center; /* This ensures vertical centering */
  border: 2px dashed #ccc;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  width: 100%;
  max-width: 400px;
  min-height: 240px;
  max-height: 60vh;
  background-color: #f9f9f9;
  text-align: center;
  margin: 0 auto; /* centers the box horizontally if needed */
  box-sizing: border-box;
}


.trip-edit-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1; /* helps in pushing content to center vertically */
  width: 100%;
  height: 100%;
}
.trip-edit-default-icon {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 12px;
  opacity: 0.6;
}

.trip-edit-placeholder-text {
  font-size: 14px;
  color: #888;
  font-family: "Sarabun", sans-serif;
}

.trip-edit-file-hidden {
  display: none;
}

.trip-edit-img-wrapper {
  position: relative;
  display: inline-block;
  border-radius: 8px;
  width: 100%;
  height: 100%;
  max-height: 200px;
  overflow: hidden;
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

/* When checkbox is checked, move circle and make background blue */
input:checked + .slider {
  background-color: #03aed2;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

/* Rounded toggle style */
.slider.round {
  border-radius: 34px;
}

.form-error-list {
  color: red;
  margin-bottom: 1rem;
  list-style-type: none;
  padding-left: 0;
}
.form-error {
  margin-bottom: 0.25rem;
}

.trip-edit-label-row {
  display: flex;
  margin-bottom: 4px;
  gap: 12px;
}

.trip-edit-label-row .trip-edit-label {
  flex: 1;
  font-size: 16px;
  text-align: left;
}

.trip-edit-label-row .trip-edit-label:last-child {
  text-align: left;
  margin-left: 30px;
}

.trip-edit-date-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trip-edit-date {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #03aed2;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
  outline: none;
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
/* Responsive tweaks */
@media (max-width: 758px) {
  .create-pin {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1rem;
  }

  .image-preview {
    width: 100%;
    max-width: 100%;
    height: auto;
  }

  .form-fields {
    padding: 1rem;
  }

  .form-section {
    width: 100%;
  }

  .date-range {
    flex-direction: column;
    gap: 0.75rem;
  }

  .publish-button,
  .cancel-button {
    align-self: stretch;
    width: 100%;
  }

  .form-title {
    position: relative;
    font-size: 20px;
    margin-bottom: 1rem;
  }
}

@media (max-width: 758px) {
  .field input,
  .field textarea,
  .field select {
    font-size: 14px;
  }

  .publish-button,
  .cancel-button {
    font-size: 14px;
    padding: 0.65rem 1rem;
  }
}

@media (max-width: 480px) {
  .custom-modal {
    width: 100%;
    max-width: 90%;
    border-radius: 16px 16px 0 0; /* mobile-friendly rounded top */
    padding: 1rem;
  }

  .form-fields {
    padding: 1rem;
  }

  .image-preview {
    width: 100%;
    height: auto;
    max-width: 100%;
  }

  .field input,
  .field textarea,
  .field select {
    font-size: 14px;
  }

  .publish-button,
  .cancel-button {
    font-size: 14px;
    padding: 0.65rem 1rem;
    width: 100%;
    align-self: center;
  }

  .form-title {
    font-size: 18px;
    text-align: center;
    margin-bottom: 1rem;
  }
}
</style>
