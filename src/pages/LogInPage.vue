<template>
    <div class="container d-flex justify-content-center align-items-center min-vh-100">
        <div class="card p-4 shadow-lg" style="width: 350px;">
            <h2 class="signup-title">WELCOME BACK!</h2>
            <form @submit.prevent="logIn">
                <div class="mb-3">
                    <label class="form-label custom-label">Username</label>
                    <input type="text" v-model="username" class="form-control" placeholder="Enter your username" required />
                </div>

                <!-- Sign Up Link -->
                <div class="mt-3 text-start mb-3 ms-4">
                    <span class="mt-3 text-start">Don't have an account? &nbsp;</span>
                    <router-link to="/signup" class="mt-3 text-start">Sign up here</router-link>
                </div>
                <div class="mb-3">
                    <label class="form-label custom-label">Password</label>
                    <input type="password" v-model="password" class="form-control" placeholder="Enter your password" required />
                </div>

                <!-- Forgot Password Link -->
                <div class="mt-3 text-start mb-3 ms-4">
                    <router-link to="/forgot-password" class="mt-3 text-start"> Forgot Password? </router-link>

                </div>

                <!-- Buttons Section -->
                <!-- Buttons Section -->
                <div class="d-flex justify-content-between gap-1 mb-5 mt-4"> 
                    <router-link to="/signup">
                        <button class="btn custom-signup-btn">Sign Up</button>
                    </router-link>
                    <button type="submit" class="btn custom-login-btn">Log In</button>
                </div>


            </form>
            <p v-if="errorMessage" class="text-danger text-start mt-3">{{ errorMessage }}</p>
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
        async login() {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: this.email,
                password: this.password,
            });

            if (error) {
                this.errorMessage = error.message;
            } else {
                console.log("Logged in successfully", data);
                this.$router.push("/");
            }
        },
    },
};
</script>

<style>
@import "../assets/styles/login.css"; /* Import external CSS file */
</style>