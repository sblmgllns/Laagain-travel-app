<template>
    <div class="container d-flex justify-content-center align-items-center min-vh-100">
        <div class="card p-4 shadow-lg" style="width: 350px;">
            <h2 class="signup-title">SIGN UP</h2>
            <form @submit.prevent="signUp">
                <div class="mb-3">
                    <label class="form-label custom-label">Full Name</label>
                    <input type="text" v-model="fullName" class="form-control" placeholder="Enter your full name" required />
                </div>
                <div class="mb-3">
                    <label class="form-label custom-label">Username</label>
                    <input type="text" v-model="username" class="form-control" placeholder="Enter your username" required />
                </div>
                <div class="mb-3">
                    <label class="form-label custom-label">Email</label>
                    <input type="email" v-model="email" class="form-control" placeholder="Enter your email" required />
                </div>
                <div class="mb-3">
                    <label class="form-label custom-label">Password</label>
                    <input type="password" v-model="password" class="form-control" placeholder="Enter your password" required />
                </div>
                <div class="mb-3">
                    <label class="form-label custom-label">Confirm Password</label>
                    <input type="password" v-model="confirmPassword" class="form-control" placeholder="Confirm your password" required />
                </div>
                <button type="submit" class="btn btn-primary w-100 mb-3">Sign Up</button>
            </form>
            <p class="mt-3 text-start">
                has an account? &nbsp; <router-link to="/login" class="text-primary"> Log In</router-link>
            </p>
            <p v-if="errorMessage" class="text-danger text-start">{{ errorMessage }}</p>
        </div>
    </div>
</template>

<script>
import { supabase } from "../supabase";

export default {
    data() {
        return {
            fullName: "",
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            errorMessage: "",
        };
    },
    methods: {
        async signUp() {
            if (this.password !== this.confirmPassword) {
                this.errorMessage = "Passwords do not match!";
                return;
            }

            const { data, error } = await supabase.auth.signUp({
                email: this.email,
                password: this.password,
            });

            if (error) {
                this.errorMessage = error.message;
            } else {
                console.log("Sign-up successful", data);
                this.$router.push("/login");
            }
        },
    },
};
</script>

<style>
@import "../assets/styles/signup.css"; /* Import external CSS file */
</style>