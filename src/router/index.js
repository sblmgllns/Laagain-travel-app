import { createRouter, createWebHistory } from "vue-router";
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

const routes = [
  //{ path: "/", redirect: "/edit-itinerary", meta:{title: "Laagain - Log In"}  }, // Redirect "/" to login
  { path: "/", redirect: "/login", meta:{title: "Laagain - Log In"}  },
  { path: "/login", component: LogInPage, meta: {title: "Laagain - Log In"} },
  { path: "/signup", component: SignUpPage, meta: {title: "Laagain - Sign Up"} },
  { path: "/home", component: HomePage },
  { path: "/profile", component: Profile },
  { path: "/ProfileSettings", component: ProfileSettings},
  { path: "/forgot-password", component: ForgotPassword },
  { path: "/reset-password", component: ResetPassword },
  { path: "/deactivate-account", component: DeactivateAccount },
  { path: "/dashboard", component: Dashboard },
  { path: "/new-itinerary", component: newItinerary },
  { path: "/edit-itinerary", component: EditItinerary},
  { path: "/explore", component: Explore},
  { path: "/notifications", component: Notifications},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
