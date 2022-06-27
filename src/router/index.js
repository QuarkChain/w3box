import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../components/Home.vue';
import Profile from '../components/Profile.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/address/:address',
    name: 'Profile',
    component: Profile,
  },
];

const router = new VueRouter({
  base: '/filebox.w3q/',
  routes,
});

export default router;
