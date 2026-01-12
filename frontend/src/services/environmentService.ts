import api from './api';
import { Environment, Person, CreateEnvironmentData } from '@/types';

export const environmentService = {
  async getEnvironments(): Promise<{ environments: Environment[] }> {
    const response = await api.get<{ environments: Environment[] }>('/environments');
    return response.data;
  },

  async createEnvironment(data: CreateEnvironmentData): Promise<{ environment: Environment }> {
    const response = await api.post<{ environment: Environment }>('/environments', data);
    return response.data;
  },

  async getEnvironmentDetails(id: number): Promise<{ environment: Environment; people: Person[] }> {
    const response = await api.get<{ environment: Environment; people: Person[] }>(`/environments/${id}`);
    return response.data;
  },

  async addPersonToEnvironment(environmentId: number, personId: number): Promise<void> {
    await api.post(`/environments/${environmentId}/people`, { person_id: personId });
  },
};