import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import LoginView from '../../views/LoginView.vue';
import { useAuthStore } from '../../stores/authStore';

vi.mock('../../stores/authStore');

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/login', component: LoginView },
    { path: '/dashboard', component: { template: 'Dashboard' } },
    { path: '/register', component: { template: 'Register' } },
  ],
});

describe('LoginView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders login form correctly', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.text()).toContain('Family Expense Tracker');
    expect(wrapper.text()).toContain('Sign in to manage your family expenses');
    expect(wrapper.find('#email').exists()).toBe(true);
    expect(wrapper.find('#password').exists()).toBe(true);
    expect(wrapper.text()).toContain('Sign In');
  });

  it('has link to register page', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.text()).toContain("Don't have an account?");
    const registerLink = wrapper.find('a[href="/register"]');
    expect(registerLink.exists()).toBe(true);
  });

  it('calls login on form submit', async () => {
    const authStore = useAuthStore();
    const loginSpy = vi.spyOn(authStore, 'login').mockResolvedValue({
      token: 'test-token',
      person: { id: 1, name: 'Test', email: 'test@example.com' },
      message: 'Login successful',
    });
    const pushSpy = vi.spyOn(router, 'push');

    const wrapper = mount(LoginView, {
      global: {
        plugins: [router],
      },
    });

    await wrapper.find('#email').setValue('test@example.com');
    await wrapper.find('#password').setValue('password123');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(loginSpy).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(pushSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('displays error message on login failure', async () => {
    const authStore = useAuthStore();
    vi.spyOn(authStore, 'login').mockRejectedValue({
      response: { data: { error: 'Invalid credentials' } },
    });

    const wrapper = mount(LoginView, {
      global: {
        plugins: [router],
      },
    });

    await wrapper.find('#email').setValue('test@example.com');
    await wrapper.find('#password').setValue('wrongpassword');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('Invalid credentials');
  });

  it('disables submit button while loading', async () => {
    const authStore = useAuthStore();
    vi.spyOn(authStore, 'login').mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    const wrapper = mount(LoginView, {
      global: {
        plugins: [router],
      },
    });

    await wrapper.find('#email').setValue('test@example.com');
    await wrapper.find('#password').setValue('password123');
    
    const submitButton = wrapper.find('button[type="submit"]');
    await wrapper.find('form').trigger('submit.prevent');

    expect(submitButton.attributes('disabled')).toBeDefined();
    expect(submitButton.text()).toContain('Signing in...');
  });
});