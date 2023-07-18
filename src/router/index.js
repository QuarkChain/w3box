import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../page/Home.vue';
import Profile from '../page/Profile.vue';
import AAPage from '../page/AAPage.vue';

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
  {
    path: '/aa',
    name: 'AA',
    component: AAPage,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
