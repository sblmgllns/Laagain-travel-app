<template>
    <div class="container-fluid d-flex justify-content-center align-items-center min-vh-100" id="maincontainer">
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
                <div class="d-flex justify-content-center">
                    <button type="submit" class="btn btn-primary">Sign Up</button>
                </div>
            </form>
            <p class="mt-3 text-start">
                Already Have an Account? &nbsp; <router-link to="/login" class="text-primary"> Log In</router-link>
            </p>
            <p v-if="errorMessage" class="text-danger text-center mt-error mt-3">{{ errorMessage }}</p>
        </div>
    </div>
</template>

// import { supabase } from "../supabase";

// export default {
//     data() {
//         return {
//             fullName: "",
//             username: "",
//             email: "",
//             password: "",
//             confirmPassword: "",
//             errorMessage: "",
//         };
//     },
//     methods: {
//         async signUp() {
//             if (this.password !== this.confirmPassword) {
//                 this.errorMessage = "Passwords do not match!";
//                 return;
//             }

//             const { data, error } = await supabase.auth.signUp({
//                 email: this.email,
//                 password: this.password,
//             });

//             if (error) {
//                 this.errorMessage = error.message;
//             } else {
//                 console.log("Sign-up successful", data);
//                 this.$router.push("/login");
//             }
//         },
//     },
// };
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
            //does email/account already exist?
            const { data: existingUser, error: fetchError } = await supabase
                .from("profiles")
                .select("id")
                .eq("email", this.email)
                .single();

            if (existingUser) {
                console.log("duplicate!");
                this.errorMessage = "This email is already registered.";
                return;
            }

            if (this.password !== this.confirmPassword) {
                this.errorMessage = "Passwords do not match!";
                return;
            }

            const { error } = await supabase.auth.signUp({
                email: this.email,
                password: this.password,
                options: {
                    data: {  // Store metadata
                        full_name: this.fullName,
                        username: this.username,
                    },
                },
            });

            if (error) {
                this.errorMessage = error.message;
                console.error("Signup error:", error.message);
            } else {
                console.log("Sign-up successful! Check Email to Confirm Account");
                this.$router.push("/login"); // Redirect to login page
            }
        },
    },
};
</script>


<style scoped>
@import "../assets/styles/signup.css"; /* Import external CSS file */
</style>