<template>
  <div class="container-fluid d-flex justify-content-center align-items-center min-vh-100" id="maincontainer">
    <div class="card p-4 shadow-lg" style="width: 350px;">
      <div class="d-flex justify-content-center">   
        <img
            src="https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//forgot_password_icon.png"
            alt="Laagain Logo"
            />
      </div>
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
      
      <!-- <p class="mt-3 text-start">
        Remembered your password? Go to &nbsp; <router-link to="/landing" class="text-primary">Home</router-link>
      </p> -->
      
      <p v-if="successMessage" class="text-success text-center mt-successerror">{{ successMessage }}</p>
      <p v-if="errorMessage" class="text-danger text-center mt-successerror">{{ errorMessage }}</p>
    </div>
  </div>
</template>

  <!-- <script>
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
  </script> -->

  <script>
import { supabase } from "../supabase";

export default {
  data() {
    return {
      newPassword: "",
      confirmPassword: "",
      errorMessage: "",
      successMessage: "",
      sessionSet: false, // To show form only after session is set
    };
  },
  mounted() {
    // Get tokens from URL hash (after password reset link redirect)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
        if (error) {
          this.errorMessage = "Failed to authenticate session. Please try the reset link again.";
          console.error("Session setup error:", error.message);
        } else {
          this.sessionSet = true; // Session set, show the form
        }
      });
    } else {
      this.errorMessage = "Invalid reset link or tokens missing.";
    }
  },
  methods: {
    async submitNewPassword() {
      if (this.newPassword !== this.confirmPassword) {
        this.errorMessage = "Passwords do not match.";
        return;
      }

      try {
        const { data, error } = await supabase.auth.updateUser({
          password: this.newPassword,
        });

        if (error) {
          this.errorMessage = error.message;
          console.error("Password reset error:", error.message);
        } else {
          this.successMessage = "Password has been reset successfully!";
          setTimeout(() => {
            this.$router.push("/landing"); // Redirect to landing page to login
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