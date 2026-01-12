import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import DashboardView from '../../views/DashboardView.vue';
import { useEnvironmentStore } from '../../stores/environmentStore';
import { useExpenseStore } from '../../stores/expenseStore';
import NavBar from '../../components/NavBar.vue';
import EnvironmentSelector from '../../components/EnvironmentSelector.vue';
import AddExpenseForm from '../../components/AddExpenseForm.vue';
import ExpenseList from '../../components/ExpenseList.vue';

vi.mock('../../stores/environmentStore');
vi.mock('../../stores/expenseStore');

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/dashboard', component: DashboardView },
  ],
});

describe('DashboardView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders all main components', () => {
    const wrapper = mount(DashboardView, {
      global: {
        plugins: [router],
        stubs: {
          NavBar: true,
          EnvironmentSelector: true,
          AddExpenseForm: true,
          ExpenseList: true,
        },
      },
    });

    expect(wrapper.text()).toContain('Dashboard');
    expect(wrapper.text()).toContain('Manage your family expenses');
  });

  it('displays current environment people when environment is selected', () => {
    const environmentStore = useEnvironmentStore();
    environmentStore.currentEnvironment = {
      id: 1,
      name: 'Home',
      description: 'Main home',
      created_at: '2024-01-01',
    };
    environmentStore.currentEnvironmentPeople = [
      { id: 1, name: 'John', email: 'john@example.com' },
      { id: 2, name: 'Jane', email: 'jane@example.com' },
    ];

    const wrapper = mount(DashboardView, {
      global: {
        plugins: [router],
        stubs: {
          NavBar: true,
          EnvironmentSelector: true,
          AddExpenseForm: true,
          ExpenseList: true,
        },
      },
    });

    expect(wrapper.text()).toContain('People in this environment');
    expect(wrapper.text()).toContain('John');
    expect(wrapper.text()).toContain('Jane');
  });

  it('loads expenses when environment is selected', async () => {
    const environmentStore = useEnvironmentStore();
    const expenseStore = useExpenseStore();
    
    environmentStore.currentEnvironment = {
      id: 1,
      name: 'Home',
      description: 'Main home',
      created_at: '2024-01-01',
    };

    const fetchExpensesSpy = vi.spyOn(expenseStore, 'fetchExpenses').mockResolvedValue(undefined);

    const wrapper = mount(DashboardView, {
      global: {
        plugins: [router],
        stubs: {
          NavBar: true,
          EnvironmentSelector: true,
          AddExpenseForm: true,
          ExpenseList: true,
        },
      },
    });

    await flushPromises();

    expect(fetchExpensesSpy).toHaveBeenCalledWith(1);
  });
});