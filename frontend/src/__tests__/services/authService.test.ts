import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '../../services/authService';
import api from '../../services/api';

vi.mock('../../services/api');

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('should login successfully and return token and person', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          person: { id: 1, name: 'John', email: 'john@example.com' },
          message: 'Login successful',
        },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: 'john@example.com',
        password: 'password123',
      });

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'john@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          person: { id: 1, name: 'John', email: 'john@example.com' },
          message: 'Registration successful',
        },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const result = await authService.register({
        name: 'John',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        name: 'John',
        email: 'john@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getMe', () => {
    it('should get current user info', async () => {
      const mockResponse = {
        data: {
          person: { id: 1, name: 'John', email: 'john@example.com' },
        },
      };

      (api.get as any).mockResolvedValue(mockResponse);

      const result = await authService.getMe();

      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('logout', () => {
    it('should clear token and person from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('person', JSON.stringify({ id: 1, name: 'John' }));

      authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('person')).toBeNull();
    });
  });

  describe('token management', () => {
    it('should get token from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      expect(authService.getToken()).toBe('test-token');
    });

    it('should set token in localStorage', () => {
      authService.setToken('new-token');
      expect(localStorage.getItem('token')).toBe('new-token');
    });
  });

  describe('person management', () => {
    it('should get person from localStorage', () => {
      const person = { id: 1, name: 'John', email: 'john@example.com' };
      localStorage.setItem('person', JSON.stringify(person));
      expect(authService.getPerson()).toEqual(person);
    });

    it('should set person in localStorage', () => {
      const person = { id: 1, name: 'John', email: 'john@example.com' };
      authService.setPerson(person);
      expect(JSON.parse(localStorage.getItem('person')!)).toEqual(person);
    });

    it('should return null if no person in localStorage', () => {
      expect(authService.getPerson()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if token exists', () => {
      localStorage.setItem('token', 'test-token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false if token does not exist', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});