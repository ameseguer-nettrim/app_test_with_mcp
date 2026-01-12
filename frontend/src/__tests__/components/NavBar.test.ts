import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import NavBar from '../../components/NavBar.vue';
import { useAuthStore } from '../../stores/authStore';

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: 'Home' } },
    { path: '/dashboard', component: { template: 'Dashboard' } },
    { path: '/history', component: { template: 'History' } },
    { path: '/login', component: { template: 'Login' } },
  ],
});

describe('NavBar Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders correctly with user info', () => {
    const authStore = useAuthStore();
    authStore.person = { id: 1, name: 'John Doe', email: 'john@example.com' };

    const wrapper = mount(NavBar, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.text()).toContain('Family Expense Tracker');
    expect(wrapper.text()).toContain('Welcome, John Doe');
    expect(wrapper.text()).toContain('Dashboard');
    expect(wrapper.text()).toContain('History');
    expect(wrapper.text()).toContain('Logout');
  });

  it('calls logout when logout button is clicked', async () => {
    const authStore = useAuthStore();
    authStore.person = { id: 1, name: 'John Doe', email: 'john@example.com' };
    const logoutSpy = vi.spyOn(authStore, 'logout');
    const pushSpy = vi.spyOn(router, 'push');

    const wrapper = mount(NavBar, {
      global: {
        plugins: [router],
      },
    });

    const logoutButton = wrapper.find('button');
    await logoutButton.trigger('click');

    expect(logoutSpy).toHaveBeenCalled();
    expect(pushSpy).toHaveBeenCalledWith('/login');
  });

  it('highlights active route', async () => {
    await router.push('/dashboard');
    await router.isReady();

    const wrapper = mount(NavBar, {
      global: {
        plugins: [router],
      },
    });

    const dashboardLink = wrapper.findAll('a').find(link => link.text() === 'Dashboard');
    expect(dashboardLink?.classes()).toContain('bg-primary-100');
  });
});