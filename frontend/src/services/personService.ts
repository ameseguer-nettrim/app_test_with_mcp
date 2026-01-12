import api from './api';
import { Person } from '@/types';

export const personService = {
  async getPeople(): Promise<{ people: Person[] }> {
    const response = await api.get<{ people: Person[] }>('/people');
    return response.data;
  },

  async getPeopleInEnvironment(environmentId: number): Promise<{ people: Person[] }> {
    const response = await api.get<{ people: Person[] }>(`/people/environment?environment_id=${environmentId}`);
    return response.data;
  },
};