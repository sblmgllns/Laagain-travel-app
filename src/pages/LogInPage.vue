<template>
    <div class="auth-container">
        <h2>Login</h2>
        <form @submit.prevent="login">
            <input type="email" v-model="email" placeholder="Email" required />
            <input type="password" v-model="password" placeholder="Password" required />
            <button type="submit">Log In</button>
        </form>
        <p>Don't have an account? <router-link to="/signup">Sign Up</router-link></p>
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
