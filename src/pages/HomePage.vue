<template>
    <div>
        <h1>Welcome to My App</h1>
        <p v-if="user">Logged in as: {{ user.email }}</p>
        <button v-if="user" @click="logout">Logout</button>
        <router-link v-else to="/login">Login</router-link>
    </div>
</template>

<script>
import { supabase } from "../supabase";

export default {
    data() {
        return {
            user: null,
        };
    },
    async mounted() {
        const { data: { user } } = await supabase.auth.getUser();
        this.user = user;
    },
    methods: {
        async logout() {
            await supabase.auth.signOut();
            this.user = null;
            this.$router.push("/login");
        },
    },
};
</script>
