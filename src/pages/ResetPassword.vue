<template>
  <div class="container-fluid d-flex justify-content-center align-items-center min-vh-100" id="maincontainer">
    <div class="card p-4 shadow-lg" style="width: 350px;">
      <h2 class="reset-password-title">Reset Password</h2>
      <form @submit.prevent="submitNewPassword">
        <div class="mb-3">
          <label class="form-label custom-label">New Password</label>
          <input type="password" v-model="newPassword" class="form-control" placeholder="Enter new password" required />
        </div>
        <div class="mb-3">
          <label class="form-label custom-label">Confirm New Password</label>
          <input type="password" v-model="confirmPassword" class="form-control" placeholder="Confirm new password" required />
        </div>
        <button type="submit" class="btn btn-primary w-100 mb-3">Reset Password</button>
      </form>
      
      <p class="mt-3 text-start">
        Remembered your password? &nbsp; <router-link to="/login" class="text-primary">Log In</router-link>
      </p>
      
      <p v-if="successMessage" class="text-success text-center mt-successerror">{{ successMessage }}</p>
      <p v-if="errorMessage" class="text-danger text-center mt-successerror">{{ errorMessage }}</p>
    </div>
  </div>
</template>

  <script>
  import { supabase } from "../supabase";
  
  export default {
    data() {
      return {
        newPassword: "",
        confirmPassword: "",
        errorMessage: "",
        successMessage: "",
      };
    },
    methods: {
      async submitNewPassword() {
        // Ensure passwords match
        if (this.newPassword !== this.confirmPassword) {
          this.errorMessage = "Passwords do not match.";
          return;
        }
  
        try {
          // Update the user's password (user must be already authenticated via reset link)
          const { data, error } = await supabase.auth.updateUser({
            password: this.newPassword,
          });
  
          if (error) {
            this.errorMessage = error.message;
            console.error("Password reset error:", error.message);
          } else {
            this.successMessage = "Password has been reset successfully!";
            setTimeout(() => {
              this.$router.push("/login"); // Redirect to login page
            }, 2000);
          }
        } catch (err) {
          this.errorMessage = "An unexpected error occurred. Please try again.";
          console.error("Unexpected error:", err);
        }
      },
    },
  };
  </script>
  

 
<style scoped>
@import "../assets/styles/resetpassword.css"; /* Import external CSS file */
</style> 