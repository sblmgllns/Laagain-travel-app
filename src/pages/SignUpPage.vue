<template>
    <div class="auth-container">
        <h2>Sign Up</h2>
        <form @submit.prevent="signUp">
            <input type="email" v-model="email" placeholder="Email" required />
            <input type="password" v-model="password" placeholder="Password" required />
            <button type="submit">Sign Up</button>
        </form>
        <p>Already have an account? <router-link to="/login">Log In</router-link></p>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
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
        async signUp() {
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

<style scoped>
.auth-container {
    max-width: 400px;
    margin: auto;
    padding: 20px;
    text-align: center;
}
input, button {
    display: block;
    width: 100%;
    margin: 10px 0;
    padding: 10px;
}
.error {
    color: red;
}
</style>
