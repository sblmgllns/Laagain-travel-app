<template>
  <div class="container-fluid d-flex justify-content-center align-items-center min-vh-100" id="maincontainer">
    <div class="card p-4 shadow-lg" style="width: 350px;">
      <h2 class="forgot-password-title">Forgot Password</h2>
      <form @submit.prevent="submitEmail">
        <div class="mb-3">
          <label class="form-label custom-label">Email</label>
          <input type="email" v-model="email" class="form-control" placeholder="Enter your email" required />
        </div>

        <button type="submit" class="btn btn-primary w-100 mb-6">Send Password Reset Link</button>

      </form>

      <p class="mt-3 text-start">
        Remembered your password? &nbsp; <router-link to="/login" class="text-primary">Log In</router-link>
      </p>
      <p class="mt-3 text-start">
        Don't have an account? &nbsp; <router-link to="/signup" class="text-primary">Sign Up</router-link>
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
      email: "",
      errorMessage: "",
      successMessage: "",
    };
  },
  methods: {
    async submitEmail() {
      this.errorMessage = "";
      this.successMessage = "";

      // Validate email format
      if (!this.email || !/\S+@\S+\.\S+/.test(this.email)) {
        this.errorMessage = "Please enter a valid email address.";
        return;
      }

      try {
        // Check if the email exists in Supabase Auth
        const { data: existingUser, error: userCheckError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", this.email)
          .single({
            headers: {
              "Accept": "application/json"
            }
          });


        if (userCheckError && userCheckError.code !== "PGRST116") {
          console.error("Error checking email existence:", userCheckError.message);
          this.errorMessage = "An error occurred while checking your email. Please try again.";
          return;
        }

        // If no user is found, show an error
        if (!existingUser) {
          this.errorMessage = "This email is not registered. Please check and try again.";
          return;
        }

        // If email exists, proceed with sending password reset link
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(this.email);

        if (resetError) {
          this.errorMessage = resetError.message;
          console.error("Password reset error:", resetError.message);
        } else {
          console.log("Password reset email sent!");
          this.successMessage = "A password reset link has been sent to your email.";
          this.email = ""; // Clear input field after sending
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
@import "../assets/styles/forgotpassword.css"; /* Import external CSS file */
</style>