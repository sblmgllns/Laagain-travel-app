<template>
  <!-- View Members Modal -->
  <div
    v-if="showMembersModal"
    class="modal fade show d-block"
    tabindex="-1"
    aria-labelledby="inviteModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <i class="bi bi-three-dots" @click.stop="toggleMenu"></i>

          <div v-if="showMenu" class="menu-options">
            <template
              v-if="
                ownerProfile?.id?.trim &&
                currentUser?.id?.trim &&
                ownerProfile.id.trim() === currentUser.id.trim()
              "
            >
              <a href="#" @click.stop="deletePost">Delete</a>
            </template>
            <template v-else>
              <a href="#" @click.stop="leaveTrip">Leave</a>
            </template>
          </div>

          <h5 class="modal-title custom-modal-title">
            Invite your friends to
            {{
              itineraryName.length > 15
                ? itineraryName.substring(0, 15) + "..."
                : itineraryName
            }}.
          </h5>

          <button
            type="button"
            class="btn-close"
            @click="closeMembersModal"
          ></button>
        </div>
        <div class="modal-body" style="overflow-y: auto">
          <!-- Colored Circles -->
          <div class="circle-container">
            <!-- First Circle (left circle closer to center) -->
            <div class="circle circle1"></div>

            <!-- Second Circle (center circle) -->
            <div class="circle circle2"></div>

            <!-- Third Circle (right circle moved closer to the left) -->
            <div class="circle circle3"></div>
          </div>

          <!-- Orange Rectangular Element -->
          <div class="orange-rectangle">
            <i class="bi bi-link rotated-link-icon"></i>

            <!-- Link Text centered with Sarabun font -->
            <a
              href="https://join.laagain.travel/nameofitinerary"
              target="_blank"
              class="itinerary-link"
            >
              https://join.laagain/itineraryname
            </a>

            <!-- Clipboard Icon -->
            <div class="clipboard-icon-wrapper">
              <i class="bi bi-files"></i>
            </div>
          </div>

          <!-- Gray Rectangular Element Below -->
          <div class="gray-rect">
            <!-- Person Icon on the Left -->
            <i class="bi bi-person small-icon"></i>
            <!-- Input Field -->
            <input
              type="text"
              v-model="tripMembers"
              class="trip-members-input"
              placeholder="Allow your friends and family to plan your trip"
            />
          </div>

          <!-- Slider/Tab for Email/Username Switch -->
          <div class="invite-tab-toggle">
            <!-- Slider background -->
            <div
              class="slider-background"
              :style="{ left: isEmailSelected ? '5%' : '50%', width: '46%' }"
            ></div>

            <!-- Email Tab -->
            <div @click="switchInviteTab('email')" class="tab-option">
              <span>email</span>
            </div>

            <!-- Username Tab -->
            <div @click="switchInviteTab('username')" class="tab-option">
              <span>username</span>
            </div>
          </div>

          <div class="fixed-edit-wrapper">
            <i
              v-if="
                ownerProfile?.id?.trim &&
                currentUser?.id?.trim &&
                ownerProfile.id.trim() === currentUser.id.trim()
              "
              class="bi bi-pencil edit-icon"
              @click="editField"
              title="Edit"
            />
          </div>

          <div v-if="!loading" class="modal-body" style="overflow-y: auto">
            <!-- Owner Info -->
            <div
              style="
                display: flex;
                align-items: left;
                justify-content: space-between;
                margin-top: 10px;
                padding: 0 20px;
              "
            >
              <div
                style="
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  min-width: 0;
                "
              >
                <img
                  :src="ownerProfile.picture"
                  alt="Owner's Profile Picture"
                  style="
                    flex-shrink: 0;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    justify-content: flex-start;
                    align-items: flex-start;
                  "
                />
                <div
                  style="
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  "
                >
                  <span
                    style="
                      font-family: 'Sarabun', sans-serif;
                      font-weight: 800;
                      font-size: 12px;
                      color: #000;
                      display: block;
                    "
                  >
                    {{ ownerProfile.name }}
                  </span>
                  <span
                    style="
                      font-family: 'Sarabun', sans-serif;
                      font-size: 12px;
                      color: #a8a6a6;
                      display: block;
                    "
                  >
                    @{{ ownerProfile.username }}
                  </span>
                </div>
              </div>
              <span
                style="
                  font-family: 'Sarabun', sans-serif;
                  font-size: 14px;
                  color: #03aed2;
                  font-weight: 800;
                  justify-content: flex-end;
                "
              >
                Owner
              </span>
            </div>
            <!-- Members -->
            <div
              v-for="member in members"
              :key="member.username"
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 10px;
                padding: 0 20px;
              "
            >
              <!-- Left side (Profile + Name + Username) -->
              <div
                style="
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  min-width: 0;
                "
              >
                <img
                  :src="member.profile_pic_url"
                  alt="Member's Profile Picture"
                  style="
                    flex-shrink: 0;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                  "
                />
                <div
                  style="
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  "
                >
                  <span
                    style="
                      font-family: 'Sarabun', sans-serif;
                      font-weight: 800;
                      font-size: 12px;
                      color: #000;
                      display: block;
                    "
                  >
                    {{ member.full_name }}
                  </span>
                  <span
                    style="
                      font-family: 'Sarabun', sans-serif;
                      font-size: 12px;
                      color: #a8a6a6;
                      display: block;
                    "
                  >
                    @{{ member.username }}
                  </span>
                </div>
              </div>

              <!-- Right side (x icon only if in edit mode) -->
              <div style="display: flex; align-items: center; gap: 8px">
                <span
                  style="
                    font-family: 'Sarabun', sans-serif;
                    font-size: 14px;
                    color: #a8a6a6;
                  "
                >
                  Member
                </span>
                <span
                  v-if="isEditMemberMode"
                  @click="removeMember(member.username)"
                  style="color: red; font-size: 16px; cursor: pointer"
                  title="Remove Member"
                >
                  ×
                </span>
              </div>
            </div>
          </div>

          <!-- Show Loading Spinner while loading -->
          <div v-if="loading" class="modal-body">
            <p>Loading...</p>
            <!-- Add your loading spinner here -->
          </div>
        </div>
        <!-- Sticky Footer with Yellow Button -->
        <div
          class="modal-footer"
          style="
            padding-top: 10px;
            background-color: white;
            position: sticky;
            bottom: 0;
            z-index: 10;
          "
        >
          <button
            type="button"
            class="btn"
            @click="sendInvite"
            style="
              width: 90%;
              height: 34px;
              border-radius: 30px;
              background-color: #ffd90c;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: 'Sarabun', sans-serif;
              font-weight: 800;
              padding: 12px 0;
              margin: 0 auto 5px;
            "
          >
            <i
              class="bi bi-person-plus"
              style="font-size: 18px; margin-right: 10px; color: white"
            ></i>
            <span style="font-size: 16px">Invite trip members</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

// Props
const props = defineProps({
  showMembersModal: Boolean,
  ownerProfile: Object,
  currentUser: Object,
  itineraryName: String,
  members: Array,
  loading: Boolean,
});

// Emits
const emit = defineEmits([
  "closeMembersModal",
  "toggleMenu",
  "deletePost",
  "leaveTrip",
  "sendInvite",
  "removeMember",
  "editField",
  "switchInviteTab",
]);

// Local state
const showMenu = ref(false);
const tripMembers = ref([]);
const inviteError = ref("");
const isEmailSelected = ref(true);
const isEditMemberMode = ref(false);

// Computed
const isOwner = computed(() => {
  return (
    props.ownerProfile?.id?.trim &&
    props.currentUser?.id?.trim &&
    props.ownerProfile.id.trim() === props.currentUser.id.trim()
  );
});

// Detect click outside
const handleClickOutside = (event) => {
  const icon = document.querySelector(".bi-three-dots");
  const menu = document.querySelector(".menu-options");

  if (!icon?.contains(event.target) && !menu?.contains(event.target)) {
    showMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

// Methods
const closeMembersModal = () => {
  emit("closeMembersModal");
};

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const deletePost = () => {
  emit("deletePost");
  showMenu.value = false;
};

const leaveTrip = () => {
  emit("leaveTrip");
  showMenu.value = false;
};

const sendInvite = () => {
  console.log("Sending invite with members:", tripMembers.value);
  emit("sendInvite", tripMembers.value);
  tripMembers.value = [];
};

const removeMember = (username) => {
  emit("removeMember", username);
};

const editField = () => {
  isEditMemberMode.value = !isEditMemberMode.value;
  emit("editField", isEditMemberMode.value);
};

const switchInviteTab = (tab) => {
  isEmailSelected.value = tab === "email";
  emit("switchInviteTab", tab);
};
</script>

<style scoped>
.gray-rect {
  width: 90%;
  height: 50px;
  background-color: #ede9e9;
  opacity: 1;
  border-radius: 5px;
  margin: 20px auto 0 auto;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

/* Icon Style */
.gray-rect i {
  font-size: 24px;
  color: gray;
}

.custom-modal-title {
  font-family: "Sarabun", sans-serif;
  font-weight: 800;
  color: #03aed2;
  line-height: 1.04;
  letter-spacing: 0.04em;
  margin-left: 10px;
}

/* Placeholder styling */
.trip-members-input::placeholder {
  color: #a8a6a6;
  font-size: 13px;
  opacity: 1;
  transition: font-size 0.3s ease;
  font-family: "Sarabun", sans-serif;
}

.orange-rectangle {
  width: 90%;
  height: 40px;
  background-color: #feefad;
  opacity: 0.39;
  border-radius: 7px;
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  z-index: 1;
  position: relative; /* Ensures z-index applies */
}

.clipboard-icon-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* Icon Style */
.clipboard-icon-wrapper i {
  font-size: 24px;
  color: black;
}

.rotated-link-icon {
  font-size: 27px;
  color: black;
  transform: rotate(-45deg);
  transition: font-size 0.2s ease;
}

.modal-body {
  padding: 10px; /* less padding around the form */
  overflow-y: auto;
}

/* Smaller spacing between boxes */
.field-box {
  position: relative;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px 10px; /* reduced padding */
  margin-bottom: 12px; /* tighter spacing */
  background-color: white;
}

/* Label sits neatly in the border */
.field-label {
  position: absolute;
  top: -8px;
  left: 10px;
  background-color: white;
  padding: 0 4px;
  font-size: 12px; /* smaller label font */
  color: #333;
  font-weight: 500;
}

/* Compact inputs */
.field-input {
  width: 100%;
  padding: 6px 8px; /* less padding inside inputs */
  font-size: 0.75rem; /* smaller text */
  border: none;
  outline: none;
  background: transparent;
  box-sizing: border-box;
}

.circle-container {
  display: flex;
  justify-content: center;
  gap: 0px;
  align-items: center;
  margin-top: -10px;
}

.circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.circle1 {
  background-image: url('https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//avatar1.png');
  background-size: cover;
  background-position: center;
  background-color: #ffc7e0; /* light pink */
  margin-right: -15px;
  z-index: 1;
  position: relative;
  transform: rotate(-10deg); /* Slant to the left */
}


.circle2 {
  background-image: url('https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//avatar2.png');
  background-size: cover;
  background-position: center;
  background-color: #c8f1ff; /* light blue */
  margin-top: 30px;
}

.circle3 {
  transform: rotate(10deg); /* Slant to the right */
  background-image: url('https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//avatar3.png');
  background-size: cover;
  background-position: center;
  background-color: #ffc0b8; /* peach */
  margin-left: -15px;
}

.fixed-edit-wrapper {
  position: absolute; /* Adjust horizontally */
  z-index: 1000;
  right: 140px;
  justify-content: flex-end; /* Make sure it stays on top */
}

/* Textarea match input size */
textarea.field-input {
  height: 60px; /* fixed, smaller height */
  resize: vertical;
}

.menu-options {
  position: absolute;
  left: -61px;
  top: 24px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
  padding: 5px;
  z-index: 10;
}

.menu-options a {
  display: block;
  padding: 5px 10px;
  color: red;
  text-decoration: none;
}

.menu-options:hover {
  background: rgb(247, 243, 243);
}

.itinerary-link {
  font-family: "Sarabun", sans-serif;
  font-weight: 800;
  color: black;
  text-decoration: none;
  font-size: 13px;
  word-break: break-all; /* allows long URLs to wrap */
}

.edit-icon {
  position: relative;
  font-size: 12px;
  cursor: pointer;
  z-index: 2;
  right: -100px;
  margin-top: 200px;
  padding-bottom: 10px;
}

.trip-members-input {
  border: none;
  background: transparent;
  font-family: "Sarabun", sans-serif;
  font-weight: 800;
  color: #a8a6a6;
  font-size: 13px;
  margin-left: 20px;
  outline: none;
  flex: 1;
  min-width: 0; /* Helps prevent overflow in flex containers */
}

.invite-tab-toggle {
  width: 30%;
  height: 25px;
  background-color: #ede9e9;
  border-radius: 5px;
  margin: 15px auto 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  position: relative;
  min-width: 200px;
}

.slider-background {
  position: absolute;
  top: 4px;
  height: 70%;
  background-color: white;
  border-radius: 3px;
  transition: all 0.3s ease;
  pointer-events: none;
}

.tab-option {
  cursor: pointer;
  padding: 3px 0;
  width: 48%;
  text-align: center;
  z-index: 1;
}

.modal-content {
  width: 100% !important; /* Full width of parent/modal-dialog */
  max-width: 1000px !important; /* ✅ Increase this to control actual width */
  height: 80vh !important;
  background-color: #fff;
  border-radius: 10px;
  margin: 0 auto; /* Center it horizontally */
}

.modal-dialog {
  width: 80%;
  max-width: 80vh; /* or 90vw if you want it relative to screen */
  margin: 1.75rem auto;
}

.tab-option span {
  font-family: "Sarabun", sans-serif;
  font-weight: 800;
  color: black;
  font-size: 12px;
}

.circle-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin-top: 20px;
  position: relative;
  z-index: 2;
}

.circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.circle1 {
  background-color: #ffc7e0;
  margin-right: -15px;
  z-index: 1;
}

.circle2 {
  background-color: #c8f1ff;
  margin-top: 30px;
  z-index: 2;
}

.circle3 {
  background-color: #ffc0b8;
  margin-left: -15px;
  z-index: 1;
}

/* Tablet styles (768px and below) */
@media (max-width: 768px) {
  .gray-rect {
    height: 38px;
    width: 95%;
  }

  .modal-title {
    font-size: 20px;
  }

  .modal-body {
    gap: 8px;
  }

  .orange-rectangle {
    width: 95%;
    height: 35px;
  }

  /* Icon Style */
  .clipboard-icon-wrapper i {
    font-size: 15px;
  }
  .rotated-link-icon {
    font-size: 15px;
  }

  .menu-options {
    left: -42px;
    top: 35px;
  }

  .trip-members-input::placeholder {
    font-size: 12px;
    margin-left: -20px;
  }

  .invite-tab-toggle {
    width: 50%;
    min-width: 90px;
  }

  .circle-container {
    margin-top: 0px;
  }
  .circle1,
  .circle2,
  .circle3 {
    width: 70px;
    height: 70px;
    padding: -10px;
  }

  .itinerary-link {
    font-size: 13px;
  }

  .modal-footer {
    flex-direction: column;
    gap: 16px;
  }

  .modal-footer button {
    width: 90%;
  }

  .modal-content {
    width: 90%; /* or try 100%, 95%, or a fixed value like 600px */
    max-width: none; /* remove Bootstrap's max-width limit if needed */
    padding: 12px;
    gap: 8px;
    font-size: 13px;
    height: 70vh !important;
  }

  .modal-dialog {
    width: 70%;
    max-width: 90vh; /* or 90vw if you want it relative to screen */
    margin: 1.75rem auto;
  }

  .modal-text {
    font-size: 11px;
  }

  .modal-input {
    font-size: 11px;
    padding: 7px;
  }
  .small-icon {
    font-size: 12px !important;
    line-height: 1;
    padding-right: -10px !important;
  }

  .small-icon::before {
    font-size: 12px !important;
  }
}

/* Mobile styles (480px and below) */
@media (max-width: 480px) {
  .gray-rect {
    height: 38px;
    width: 95%;
  }

  .modal-title {
    font-size: 15px;
  }

  .modal-body {
    gap: 8px;
  }

  .orange-rectangle {
    width: 95%;
    height: 35px;
  }

  /* Icon Style */
  .clipboard-icon-wrapper i {
    font-size: 15px;
    margin-right: -10px;
  }
  .rotated-link-icon {
    font-size: 15px;
    margin-left: -10px;
  }

  .menu-options {
    left: 39px;
    top: 2px;
  }

  .trip-members-input::placeholder {
    font-size: 9px;
  }

  .invite-tab-toggle {
    width: 50%;
    min-width: 90px;
  }

  .circle-container {
    margin-top: 0px;
  }
  .circle1,
  .circle2,
  .circle3 {
    width: 70px;
    height: 70px;
    padding: -10px;
  }

  .itinerary-link {
    font-size: 10px;
  }

  .modal-title {
    font-size: 0.95rem;
  }

  .modal-footer {
    flex-direction: column;
    gap: 16px;
  }

  .modal-footer button {
    width: 90%;
  }

  .modal-content {
    width: 90%; /* or try 100%, 95%, or a fixed value like 600px */
    max-width: none; /* remove Bootstrap's max-width limit if needed */
    padding: 12px;
    gap: 8px;
    height: 80%;
    font-size: 13px;
    height: 70vh !important;
  }

  .modal-dialog {
    width: 90%;
    max-width: 90vh; /* or 90vw if you want it relative to screen */
    margin: 1.75rem auto;
  }

  .modal-title {
    font-size: 14px;
  }

  .modal-text {
    font-size: 11px;
  }

  .modal-input {
    font-size: 11px;
    padding: 7px;
  }
  .small-icon {
    font-size: 12px !important;
    line-height: 1;
    padding-right: -10px !important;
  }

  .small-icon::before {
    font-size: 12px !important;
  }
}

/* Small mobile styles (360px and below) */
@media (max-width: 375px) {
  .gray-rect {
    height: 38px;
    width: 95%;
  }

  .modal-title {
    font-size: 15px;
  }

  .modal-body {
    gap: 8px;
  }

  .orange-rectangle {
    width: 95%;
    height: 35px;
  }

  /* Icon Style */
  .clipboard-icon-wrapper i {
    font-size: 15px;
    margin-right: -10px;
  }
  .rotated-link-icon {
    font-size: 15px;
    margin-left: -10px;
  }

  .menu-options {
    left: 39px;
    top: 2px;
  }

  .trip-members-input::placeholder {
    font-size: 8px;
    margin-left: -20px;
  }

  .invite-tab-toggle {
    width: 50%;
    min-width: 90px;
  }

  .circle-container {
    margin-top: 0px;
  }
  .circle1,
  .circle2,
  .circle3 {
    width: 70px;
    height: 70px;
    padding: -10px;
  }

  .itinerary-link {
    font-size: 8px;
  }

  .modal-title {
    font-size: 0.95rem;
  }

  .modal-footer {
    flex-direction: column;
    gap: 16px;
  }

  .modal-footer button {
    width: 90%;
  }

  .modal-content {
    width: 90%; /* or try 100%, 95%, or a fixed value like 600px */
    max-width: none; /* remove Bootstrap's max-width limit if needed */
    padding: 12px;
    gap: 8px;
    font-size: 13px;
  }

  .modal-dialog {
    width: 90%;
    max-width: 90vh; /* or 90vw if you want it relative to screen */
    margin: 1.75rem auto;
  }

  .modal-title {
    font-size: 14px;
  }

  .modal-text {
    font-size: 11px;
  }

  .modal-input {
    font-size: 11px;
    padding: 7px;
  }
  .small-icon {
    font-size: 12px !important;
    line-height: 1;
    padding-right: -10px !important;
  }

  .small-icon::before {
    font-size: 12px !important;
  }
}
</style>
