import { createApp } from "vue";
import App from "./App.vue";
import router from "./router"; // Import router
import { supabase } from "./supabase"; // Import Supabase if used
import './style.css'

const app = createApp(App);
app.use(router); // Use router in app
app.mount("#app");
