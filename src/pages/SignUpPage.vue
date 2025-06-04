<template>
    <!-- Signup Form -->
    <div class="card p-4" style="width: 350px;">
        <div class="d-flex justify-content-center">   
            <img
                src="https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//laagain_logo.png"
                alt="Laagain Logo"
                />
        </div>
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

            <!-- Terms and Conditions Checkbox (Centered) -->
            <div class="mb-3 d-flex flex-column align-items-center text-center">
                <div class="d-flex align-items-center">
                    <input type="checkbox" id="termsCheckbox" v-model="acceptedTerms" class="custom-checkbox" required />
                    <label for="termsCheckbox" class="ms-2">
                        I agree to the 
                        <a href="#" @click.prevent="openModal">Terms and Conditions</a>
                    </label>
                </div>
            </div>

            <div class="d-flex justify-content-center">
                <button type="submit" class="btn btn-primary" :disabled="!acceptedTerms">Sign Up</button>
            </div>
        </form>

        <!-- <p class="mt-3 text-start">
            Already Have an Account? &nbsp; <router-link to="/login" class="text-primary"> Log In</router-link>
        </p> -->
        <p v-if="errorMessage" class="text-danger text-center mt-error mt-3">{{ errorMessage }}</p>
        <p v-if="successMessage" class="text-success text-center mt-3">{{ successMessage }}</p>
    </div>
 
    <!-- ==========================================================================
     MODALS
    ========================================================================== -->

    <!-- Terms and Conditions Modal -->
    <div v-if="showModal" class="modal">
        <div class="modal-content">
            <div class="modal-header d-flex justify-content_center flex-column gap-2">
                <div class="d-flex justify-content-center align-items-center">   
                    <img
                        src="https://hqhlhotapzwxyqsofqwz.supabase.co/storage/v1/object/public/gen-assets//laagain_logo.png"
                        alt="Laagain Logo"
                        />
                </div>
                <h2>Terms and Conditions</h2>
            </div>
            <div class="modal-body">
                <p> 
                    Welcome to <strong><em>Laagain!</em></strong> By using this application, you agree to abide by the following terms and conditions: 
                </p>
                <ul>
                    <li>You must be at least <strong>18 years old</strong> to use our services.</li> 
                    <li>All personal information provided must be <strong>accurate</strong> and <strong>up to date</strong>.</li> 
                    <li>You are responsible for maintaining the <strong>confidentiality</strong> of your account credentials.</li> 
                    <li>Any misuse of our services may result in <strong>account termination</strong>.</li> 
                    <li>We reserve the right to <strong>modify</strong> these terms at any time.</li> 
                </ul>
                <p>For more details, please contact our support team.</p>

            </div>
            <div class="d-flex justify-content-center">
                <button class="btn btn-primary" @click="closeModal">Close</button>
            </div>

        </div>
    </div>

</template>

<!-- <script>
import { supabase } from "../supabase";

export default {
    data() {
        return {
            fullName: "",
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            acceptedTerms: false, // Track checkbox state
            showModal: false, // Track modal visibility
            errorMessage: "",
            successMessage: "",
        };
    },
    methods: {
        openModal() {
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
        },
        async signUp() {
            if (!this.acceptedTerms) {
                this.errorMessage = "You must accept the Terms and Conditions.";
                return;
            }

            if (this.password !== this.confirmPassword) {
                this.errorMessage = "Passwords do not match!";
                return;
            }

            // Check if email already exists
            const { data: existingUser, error: fetchError } = await supabase
                .from("profiles")
                .select("id")
                .eq("email", this.email)
                .single();

            if (existingUser) {
                this.errorMessage = "This email is already registered.";
                return;
            }

            // Sign up user
            const { data, error } = await supabase.auth.signUp({
                email: this.email,
                password: this.password,
                options: {
                    data: {
                        full_name: this.fullName,
                        username: this.username,
                    },
                },
            });

            if (error) {
                this.errorMessage = error.message;
                console.error("Signup error:", error.message);
            } else if (data.user) {
                this.successMessage = "Sign-up successful! Check email to confirm before login!";
            } else {
                this.errorMessage = "Check your email to confirm your account first before logging in!";
            }
        }
    }
};
</script> -->

<script setup>
    import { ref } from 'vue'
    import { supabase } from "../supabase"

    // Reactive state variables
    const fullName = ref("")
    const username = ref("")
    const email = ref("")
    const password = ref("")
    const confirmPassword = ref("")
    const acceptedTerms = ref(false)
    const showModal = ref(false)
    const errorMessage = ref("")
    const successMessage = ref("")

    // Functions
    const openModal = () => {
    showModal.value = true
    }

    const closeModal = () => {
    showModal.value = false
    }

    const signUp = async () => {
    errorMessage.value = ""
    successMessage.value = ""

    if (!acceptedTerms.value) {
        errorMessage.value = "You must accept the Terms and Conditions."
        return
    }

    if (password.value !== confirmPassword.value) {
        errorMessage.value = "Passwords do not match!"
        return
    }

    // Check if email already exists
    const { data: existingUser, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email.value)
        .single()

    if (existingUser) {
        errorMessage.value = "This email is already registered."
        return
    }

    const { data: existingUsername, error: getError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.value)
        .single()
    
    if (existingUsername) {
        errorMessage.value = "This username is already registered."
        return
    }

    // Sign up user
    const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
        data: {
            full_name: fullName.value,
            username: username.value,
        },
        },
    })

    if (error) {
        errorMessage.value = error.message
        console.error("Signup error:", error.message)
    } else if (data.user) {
        successMessage.value = "Sign-up successful! Check email to confirm before login!"
    } else {
        errorMessage.value = "Check your email to confirm your account first before logging in!"
    }
    }
</script>




<style scoped>
    @import "../assets/styles/signup.css"; /* Import external CSS file */
</style>