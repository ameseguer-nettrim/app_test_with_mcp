import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { authService } from '@/services/authService';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/HistoryView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/invite/:token',
    name: 'invitation',
    component: () => import('@/views/InvitationView.vue'),
  },
  {
    path: '/environments/:id/categories',
    name: 'Categories',
    component: () => import('@/views/CategoriesView.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, _, next) => {
  const isAuthenticated = authService.isAuthenticated();
  const requiresAuth = to.meta.requiresAuth !== false;

  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (
    !requiresAuth &&
    isAuthenticated &&
    (to.path === '/login' || to.path === '/register')
  ) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
