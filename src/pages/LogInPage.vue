<template>
    <!-- <div class="container-fluid d-flex justify-content-center align-items-center" id="maincontainer"> -->
        <div class="card p-4" style="width: 350px;">
            <div class="d-flex justify-content-center align-items-center">   
                <img
                    src="https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//laagain_logo.png"
                    alt="Laagain Logo"
                    />
            </div>
            <h2 class="signup-title">WELCOME BACK!</h2>
            <form @submit.prevent="logIn">
                <div class="mb-5">
                    <label class="form-label custom-label">Email</label>
                    <input type="text" v-model="email" class="form-control" placeholder="Enter your email" required />
                </div>

                <!-- Sign Up Link -->
                <!-- <div class="mt-3 text-start mb-3 ms-4">
                    <span class="mt-3 text-start">Don't have an account? &nbsp;</span>
                    <router-link to="/signup" class="mt-3 text-start text-primary">Sign up here</router-link>
                </div> -->
                <div class="mb-3">
                    <label class="form-label custom-label">Password</label>
                    <input type="password" v-model="password" class="form-control" placeholder="Enter your password" required />
                </div>

                <!-- Forgot Password Link -->
                <div class="mt-5 text-start mb-3 ms-4">
                    <router-link to="/forgot-password" class=" mt-3 text-start text-primary"> Forgot Password? </router-link>
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
            <p v-if="errorMessage" class="text-danger text-center mt-error mt-3">{{ errorMessage }}</p>
        </div>
    <!-- </div> -->
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

            // Check if user profile exists and fetch status
            const { data: existingProfile, error: profileCheckError } = await supabase
                .from("profiles")
                .select("id, status, deactivated_at, deleted") // Include deleted column
                .eq("id", user.id)
                .single();

            if (profileCheckError && profileCheckError.code !== "PGRST116") { // Ignore "No rows found"
                console.error("Error checking profile:", profileCheckError.message);
                return;
            }

            // Prevent login if account is deleted
            if (existingProfile?.deleted) {
                this.errorMessage = "This account has been deleted and cannot be recovered.";
                await supabase.auth.signOut(); // Log out user
                return;
            }

            // If profile doesn't exist, create it
            if (!existingProfile) {
                const { error: profileError } = await supabase.from("profiles").insert([
                    {
                        id: user.id, // Foreign key to Auth user
                        full_name: user.user_metadata.full_name || "",
                        username: user.user_metadata.username || "",
                        email: user.email,
                        status: "active",
                        deleted: false, // Ensure deleted status is false
                        deactivated_at: null, // Ensure it's active
                    },
                ]);

                if (profileError) {
                    console.error("Error inserting profile:", profileError.message);
                } else {
                    console.log("Profile created successfully");
                }
            } else {
                // If the account is deactivated, reactivate it
                if (existingProfile.status === "inactive") {
                    const { error: reactivationError } = await supabase
                        .from("profiles")
                        .update({ status: "active", deactivated_at: null }) // Reactivate account
                        .eq("id", user.id);

                    if (reactivationError) {
                        console.error("Error reactivating account:", reactivationError.message);
                        return;
                    }

                    console.log("Account reactivated successfully.");
                }
            }

            // Redirect user to home page
            // this.$router.push("/profile");
            this.$emit('redirect', '/dashboard');
            console.log("Emitting redirect event")
        },

    },
};

</script>

<style scoped>
@import "../assets/styles/login.css"; /* Import external CSS file */
</style>