import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "../supabase"; // adjust the path based on your setup

// Import all pages
import LogInPage from "../pages/LogInPage.vue";
import SignUpPage from "../pages/SignUpPage.vue";
import HomePage from "../pages/HomePage.vue";
import Profile from "../pages/Profile.vue";
import ProfileSettings from "../pages/ProfileSettings.vue";
import ForgotPassword from "../pages/ForgotPassword.vue";
import ResetPassword from "../pages/ResetPassword.vue";
import DeactivateAccount from "../pages/DeactivateAccount.vue";
import Dashboard from "../pages/Dashboard.vue";
import newItinerary from "../pages/newItinerary.vue";
import EditItinerary from "../pages/EditItinerary.vue";
import Explore from "../pages/Explore.vue";
import Notifications from "../pages/Notifications.vue";
import Landing from "../pages/Landing.vue";

// Define routes
const routes = [
  { path: "/", redirect: "/landing", meta:{title: "Welcome to Laagain!"}  },

  { path: "/login", component: LogInPage, meta: { title: "Laagain - Log In", layout: 'none', guestOnly: true } },
  { path: "/signup", component: SignUpPage, meta: { title: "Laagain - Sign Up", layout: 'none', guestOnly: true } },
  { path: "/forgot-password", component: ForgotPassword, meta: { layout: 'none', guestOnly: true } },
  { path: "/reset-password", component: ResetPassword, meta: { layout: 'none', guestOnly: true } },

  { path: "/home", component: HomePage, meta: { requiresAuth: true } },
  { path: "/profile", component: Profile, meta: { requiresAuth: true } },
  { path: "/ProfileSettings", component: ProfileSettings, meta: { requiresAuth: true } },
  { path: "/deactivate-account", component: DeactivateAccount, meta: { layout: 'none', requiresAuth: true } },

  { path: "/dashboard", component: Dashboard, meta: { requiresAuth: true } },
  { path: "/new-itinerary", component: newItinerary, meta: { requiresAuth: true } },
  { path: "/edit-itinerary", component: EditItinerary, meta: { layout: 'none', requiresAuth: true } },
  { path: "/explore", component: Explore, meta: { requiresAuth: true } },
  { path: "/notifications", component: Notifications, meta: { requiresAuth: true } },
  {path: "/landing", component: Landing, meta:  {layout: 'none', guestOnly: true }},
];

// Create the router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users away from protected pages
  if (to.meta.requiresAuth && !user) {
    return next("/login");
  }

  // Redirect authenticated users away from login/signup pages
  if (to.meta.guestOnly && user) {
    return next("/dashboard");
  }

  return next();
});

export default router;
