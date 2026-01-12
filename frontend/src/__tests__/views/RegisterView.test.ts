import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import RegisterView from '../../views/RegisterView.vue';
import { useAuthStore } from '../../stores/authStore';

vi.mock('../../stores/authStore');

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/register', component: RegisterView },
    { path: '/dashboard', component: { template: 'Dashboard' } },
    { path: '/login', component: { template: 'Login' } },
  ],
});

describe('RegisterView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders registration form correctly', () => {
    const wrapper = mount(RegisterView, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.text()).toContain('Create Account');
    expect(wrapper.find('#name').exists()).toBe(true);
    expect(wrapper.find('#email').exists()).toBe(true);
    expect(wrapper.find('#password').exists()).toBe(true);
    expect(wrapper.find('#confirmPassword').exists()).toBe(true);
  });

  it('has link to login page', () => {
    const wrapper = mount(RegisterView, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.text()).toContain('Already have an account?');
    const loginLink = wrapper.find('a[href="/login"]');
    expect(loginLink.exists()).toBe(true);
  });

  it('validates password match', async () => {
    const wrapper = mount(RegisterView, {
      global: {
        plugins: [router],
      },
    });

    await wrapper.find('#name').setValue('Test User');
    await wrapper.find('#email').setValue('test@example.com');
    await wrapper.find('#password').setValue('password123');
    await wrapper.find('#confirmPassword').setValue('differentpassword');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('Passwords do not match');
  });

  it('validates password length', async () => {
    const wrapper = mount(RegisterView, {
      global: {
        plugins: [router],
      },
    });

    await wrapper.find('#name').setValue('Test User');
    await wrapper.find('#email').setValue('test@example.com');
    await wrapper.find('#password').setValue('123');
    await wrapper.find('#confirmPassword').setValue('123');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('Password must be at least 6 characters');
  });

  it('calls register on successful form submit', async () => {
    const authStore = useAuthStore();
    const registerSpy = vi.spyOn(authStore, 'register').mockResolvedValue({
      token: 'test-token',
      person: { id: 1, name: 'Test User', email: 'test@example.com' },
      message: 'Registration successful',
    });
    const pushSpy = vi.spyOn(router, 'push');

    const wrapper = mount(RegisterView, {
      global: {
        plugins: [router],
      },
    });

    await wrapper.find('#name').setValue('Test User');
    await wrapper.find('#email').setValue('test@example.com');
    await wrapper.find('#password').setValue('password123');
    await wrapper.find('#confirmPassword').setValue('password123');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(registerSpy).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(pushSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('displays error message on registration failure', async () => {
    const authStore = useAuthStore();
    vi.spyOn(authStore, 'register').mockRejectedValue({
      response: { data: { error: 'Email already registered' } },
    });

    const wrapper = mount(RegisterView, {
      global: {
        plugins: [router],
      },
    });

    await wrapper.find('#name').setValue('Test User');
    await wrapper.find('#email').setValue('test@example.com');
    await wrapper.find('#password').setValue('password123');
    await wrapper.find('#confirmPassword').setValue('password123');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(wrapper.text()).toContain('Email already registered');
  });
});