<template>
    <div class="container-fluid d-flex justify-content-center align-items-center min-vh-100" id="maincontainer">
        <div class="card p-4 shadow-lg" style="width: 350px;">
            <h2 class="signup-title">Deactivate Account</h2>
                <!-- Confirmation Checkbox -->
                <div class="mb-3 d-flex flex-column align-items-center text-center">
                    <div class="d-flex align-items-center">
                        <input type="checkbox" id="confirmCheckbox" v-model="confirmed" class="custom-checkbox" required />
                        <label for="confirmCheckbox" class="ms-2">
                            I understand that this action is irreversible
                        </label>
                    </div>
                </div>
                
                <div class="d-flex justify-content-center">
                    <button 
                        type="submit" 
                        class="btn btn-danger" 
                        :disabled="!confirmed"
                        @click="inactivateAccount"
                    >
                        Deactivate
                    </button>
                </div>

            <p v-if="errorMessage" class="text-danger text-center mt-3">{{ errorMessage }}</p>
        </div>
    </div>
</template>

<script>
import { supabase } from "../supabase";

export default {
    data() {
        return {
            user: null,
            confirmed: false,
            errorMessage: ""
        };
    },
    async mounted() {
        const { data: { user } } = await supabase.auth.getUser();
        this.user = user;
    },
    methods: {
        async inactivateAccount() {
            try {
                if (!this.user) {
                    throw new Error("User not found. Please log in again.");
                }

                const { error } = await supabase
                    .from("profiles")
                    .update({ 
                        status: "inactive",
                        deactivated_at: new Date().toISOString() // Store timestamp
                    })
                    .eq("id", this.user.id);

                if (error) throw error;

                alert("Your account has been deactivated. Log in within 30 days to reactivate.");
                await supabase.auth.signOut();
                this.$router.replace("/Landing");
            } catch (error) {
                console.error("Error inactivating account:", error);
                this.errorMessage = "Failed to inactivate account. Please try again.";
            }
        }
    }
};
</script>

<style scoped>
@import "../assets/styles/signup.css";
</style>
