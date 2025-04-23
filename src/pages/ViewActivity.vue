<!-- src/components/ViewActivity.vue -->
<template>
    <div v-if="show" class="modal-overlay">
      <div class="modal">
        <h2>Activity Details</h2>
  
        <!-- Title -->
        <div class="container-bar">{{ activity.title }}</div>
  
        <!-- Description -->
        <div class="container-bar">{{ activity.description }}</div>
  
        <!-- Location -->
        <div class="container-bar">{{ activity.location }}</div>
  
        <!-- Date -->
        <div class="container-bar">
          {{ activity.date }}
          <!-- optional input, remove if read-only -->
          <!-- <input type="date" v-model="activity.date" /> -->
        </div>
  
        <!-- Start Time -->
        <div class="container-bar">
          <div class="start-date">Start</div>
          <div class="datetime-wrapper">{{ activity.startTime }}</div>
        </div>
  
        <!-- End Time -->
        <div class="container-bar">
          <div class="start-date">End</div>
          <div class="datetime-wrapper">{{ activity.endTime }}</div>
        </div>
  
        <div class="modal-actions">
          <button @click="$emit('delete')">Delete</button>
          <button @click="$emit('edit')">Edit</button>
          <button @click="$emit('close')">Close</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    activity: Object,
    show: Boolean
  });
  </script>
  