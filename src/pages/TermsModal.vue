<template>
    <div v-if="isOpen" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h2>Terms and Conditions</h2>
        <p>
          By using this service, you agree to abide by our terms and policies...
          For full details, visit our
          <a href="https://yourwebsite.com/terms" target="_blank">Terms and Conditions</a>.
        </p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      isOpen: Boolean, // Control visibility from parent component
    },
    methods: {
      closeModal() {
        this.$emit("close");
      },
    },
  };
  </script>
  
  <style scoped>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    width: 400px;
    text-align: center;
  }
  
  .close {
    float: right;
    font-size: 24px;
    cursor: pointer;
  }
  </style>
  