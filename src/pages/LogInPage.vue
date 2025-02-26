<template>
    <div class="container-fluid d-flex justify-content-center align-items-center" id="maincontainer">
        <div class="card p-4 shadow-lg" style="width: 350px;">
            <h2 class="signup-title">WELCOME BACK!</h2>
            <form @submit.prevent="logIn">
                <div class="mb-5">
                    <label class="form-label custom-label">Email</label>
                    <input type="text" v-model="email" class="form-control" placeholder="Enter your email" required />
                </div>

                <!-- Sign Up Link -->
                <div class="mt-3 text-start mb-3 ms-4">
                    <span class="mt-3 text-start">Don't have an account? &nbsp;</span>
                    <router-link to="/signup" class="mt-3 text-start text-primary">Sign up here</router-link>
                </div>
                <div class="mb-3">
                    <label class="form-label custom-label">Password</label>
                    <input type="password" v-model="password" class="form-control" placeholder="Enter your password" required />
                </div>

                <!-- Forgot Password Link -->
                <div class="mt-5 text-start mb-3 ms-4">
                    <router-link to="/forgot-password" class="mt-3 text-start"> Forgot Password? </router-link>
                </div>

                <!-- Buttons Section -->
                <!-- <div class="d-flex justify-content-between gap-1 mb-5 mt-4"> 
                    <router-link to="/signup">
                        <button class="btn custom-signup-btn">Sign Up</button>
                    </router-link>
                    <button type="submit" class="btn custom-login-btn">Log In</button>
                </div> -->
                <div class="d-flex justify-content-center">
                    <button type="submit" class="btn custom-login-btn">Log In</button>
                </div>


            </form>
            <p v-if="errorMessage" class="text-danger text-center mt-3">{{ errorMessage }}</p>
        </div>
    </div>
</template>


<script>
import { supabase } from "../supabase";

export default {
    data() {
        return {
            email: "",
            password: "",
            errorMessage: "",
        };
    },
    methods: {
        async logIn() {
            // Attempt login
            const { data, error } = await supabase.auth.signInWithPassword({
                email: this.email,
                password: this.password,
            });

            if (error) {
                this.errorMessage = error.message;
                return;
            }

            console.log("Logged in successfully", data);

            // Ensure session is fully loaded before fetching user data
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
                console.error("Error fetching session:", sessionError.message);
                return;
            }

            const user = sessionData?.session?.user;
            if (!user) {
                console.error("User not found in session.");
                return;
            }

            // Check if user profile exists
            const { data: existingProfile, error: profileCheckError } = await supabase
                .from("profiles")
                .select("id")
                .eq("id", user.id)
                .single();

            if (profileCheckError && profileCheckError.code !== "PGRST116") { // Ignore "No rows found"
                console.error("Error checking profile:", profileCheckError.message);
                return;
            }

            // Insert profile if it doesn't exist
            if (!existingProfile) {
                const { error: profileError } = await supabase.from("profiles").insert([
                    {
                        id: user.id, // Foreign key to Auth user
                        full_name: user.user_metadata.full_name || "",
                        username: user.user_metadata.username || "",
                        email: user.email,
                    },
                ]);

                if (profileError) {
                    console.error("Error inserting profile:", profileError.message);
                } else {
                    console.log("Profile created successfully");
                }
            }

            // Redirect user to home page
            this.$router.push("/profile");
        },
    },
};


</script>

<style>
@import "../assets/styles/login.css"; /* Import external CSS file */
</style>