import api from './api';
import { LoginCredentials, RegisterData, AuthResponse, Person } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async getMe(): Promise<{ person: Person }> {
    const response = await api.get<{ person: Person }>('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('person');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  setToken(token: string) {
    localStorage.setItem('token', token);
  },

  getPerson(): Person | null {
    const personStr = localStorage.getItem('person');
    return personStr ? JSON.parse(personStr) : null;
  },

  setPerson(person: Person) {
    localStorage.setItem('person', JSON.stringify(person));
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};