import { createRouter, createWebHistory } from "vue-router";
import LogInPage from "../pages/LogInPage.vue";
import SignUpPage from "../pages/SignUpPage.vue";
import HomePage from "../pages/HomePage.vue";

const routes = [
  { path: "/", redirect: "/login" }, // Redirect "/" to login
  { path: "/login", component: LogInPage },
  { path: "/signup", component: SignUpPage },
  { path: "/home", component: HomePage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
