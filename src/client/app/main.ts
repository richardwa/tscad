import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import "@picocss/pico";
import App from "./App.vue";

const router = createRouter({
  // @ts-ignore
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: import("./views/HomeView.vue"),
    },
    {
      path: "/raymarch/:file",
      component: import("./views/RayMarcher.vue"),
    },
  ],
});

const app = createApp(App);

app.use(router);

app.mount("#app");
