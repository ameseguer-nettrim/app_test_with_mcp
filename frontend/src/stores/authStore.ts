import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/authService';
import { Person, LoginCredentials, RegisterData } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const person = ref<Person | null>(authService.getPerson());
  const token = ref<string | null>(authService.getToken());

  const isAuthenticated = computed(() => !!token.value);

  async function login(credentials: LoginCredentials) {
    const response = await authService.login(credentials);
    token.value = response.token;
    person.value = response.person;
    authService.setToken(response.token);
    authService.setPerson(response.person);
    return response;
  }

  async function register(data: RegisterData) {
    const response = await authService.register(data);
    token.value = response.token;
    person.value = response.person;
    authService.setToken(response.token);
    authService.setPerson(response.person);
    return response;
  }

  function logout() {
    authService.logout();
    token.value = null;
    person.value = null;
  }

  async function fetchCurrentUser() {
    if (token.value) {
      const response = await authService.getMe();
      person.value = response.person;
      authService.setPerson(response.person);
    }
  }

  return {
    person,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    fetchCurrentUser,
  };
});