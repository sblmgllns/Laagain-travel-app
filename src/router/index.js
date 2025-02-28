import { createRouter, createWebHistory } from "vue-router";
import LogInPage from "../pages/LogInPage.vue";
import SignUpPage from "../pages/SignUpPage.vue";
import HomePage from "../pages/HomePage.vue";
import Profile from "../pages/Profile.vue";
import ProfileSettings from "../pages/ProfileSettings.vue";
import ForgotPassword from "../pages/ForgotPassword.vue";
import ResetPassword from "../pages/ResetPassword.vue";
import DeactivateAccount from "../pages/DeactivateAccount.vue";

const routes = [
  { path: "/", redirect: "/login", meta:{title: "Laagain - Log In"}  }, // Redirect "/" to login
  { path: "/login", component: LogInPage, meta: {title: "Laagain - Log In"} },
  { path: "/signup", component: SignUpPage, meta: {title: "Laagain - Sign Up"} },
  { path: "/home", component: HomePage },
  { path: "/profile", component: Profile },
  { path: "/ProfileSettings", component: ProfileSettings},
  { path: "/forgot-password", component: ForgotPassword },
  { path: "/reset-password", component: ResetPassword },
  { path: "/deactivate-account", component: DeactivateAccount },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
