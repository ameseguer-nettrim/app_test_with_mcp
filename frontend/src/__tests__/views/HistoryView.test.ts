import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import HistoryView from '../../views/HistoryView.vue';
import { useEnvironmentStore } from '../../stores/environmentStore';
import { useExpenseStore } from '../../stores/expenseStore';
import type { ComputedExpense } from '../../types';

vi.mock('../../stores/environmentStore');
vi.mock('../../stores/expenseStore');

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/history', component: HistoryView },
  ],
});

describe('HistoryView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mockComputedExpenses: ComputedExpense[] = [
    {
      id: 1,
      expense_id: 1,
      amount: 50.0,
      description: 'Groceries',
      expense_date: '2024-01-10',
      payer_id: 1,
      payer_name: 'John',
      registered_by_id: 2,
      registered_by_name: 'Jane',
      environment_id: 1,
      computed_at: '2024-01-15T10:00:00Z',
      computed_by_id: 1,
      computed_by_name: 'Admin',
    },
    {
      id: 2,
      expense_id: 2,
      amount: 75.5,
      description: 'Utilities',
      expense_date: '2024-01-11',
      payer_id: 2,
      payer_name: 'Jane',
      registered_by_id: 1,
      registered_by_name: 'John',
      environment_id: 1,
      computed_at: '2024-01-15T10:00:00Z',
      computed_by_id: 1,
      computed_by_name: 'Admin',
    },
  ];

  it('renders history view correctly', () => {
    const wrapper = mount(HistoryView, {
      global: {
        plugins: [router],
        stubs: {
          NavBar: true,
          EnvironmentSelector: true,
        },
      },
    });

    expect(wrapper.text()).toContain('Expense History');
    expect(wrapper.text()).toContain('View your computed and archived expenses');
  });

  it('displays computed expenses correctly', () => {
    const expenseStore = useExpenseStore();
    expenseStore.computedExpenses = mockComputedExpenses;
    expenseStore.loading = false;

    const wrapper = mount(HistoryView, {
      global: {
        plugins: [router],
        stubs: {
          NavBar: true,
          EnvironmentSelector: true,
        },
      },
    });

    expect(wrapper.text()).toContain('Computed Expenses');
    expect(wrapper.text()).toContain('€50.00');
    expect(wrapper.text()).toContain('Groceries');
    expect(wrapper.text()).toContain('Paid by: John');
  });

  it('groups expenses by computation date', () => {
    const expenseStore = useExpenseStore();
    expenseStore.computedExpenses = mockComputedExpenses;
    expenseStore.loading = false;

    const wrapper = mount(HistoryView, {
      global: {
        plugins: [router],
        stubs: {
          NavBar: true,
          EnvironmentSelector: true,
        },
      },
    });

    expect(wrapper.text()).toContain('Computed on');
    expect(wrapper.text()).toContain('2 expense(s)');
  });

  it('displays subtotal and grand total', () => {
    const expenseStore = useExpenseStore();
    expenseStore.computedExpenses = mockComputedExpenses;
    expenseStore.loading = false;

    const wrapper = mount(HistoryView, {
      global: {
        plugins: [router],
        stubs: {
          NavBar: true,
          EnvironmentSelector: true,
        },
      },
    });

    expect(wrapper.text()).toContain('Subtotal:');
    expect(wrapper.text()).toContain('Grand Total:');
    expect(wrapper.text()).toContain('€125.50'); // 50.00 + 75.50
  });

  it('displays loading state', () => {
    const expenseStore = useExpenseStore();
    expenseStore.computedExpenses = [];
    expenseStore.loading = true;

    const wrapper = mount(HistoryView, {
      global: {
        plugins: [router],
        stubs: {
          NavBar: true,
          EnvironmentSelector: true,
        },
      },
    });

    expect(wrapper.text()).toContain('Loading history...');
  });

  it('displays empty state when no computed expenses', () => {
    const expenseStore = useExpenseStore();
    expenseStore.computedExpenses = [];
    expenseStore.loading = false;

    const wrapper = mount(HistoryView, {
      global: {
        plugins: [router],
        stubs: {
          NavBar: true,
          EnvironmentSelector: true,
        },
      },
    });

    expect(wrapper.text()).toContain('No computed expenses yet');
  });

  it('loads computed expenses when environment is selected', async () => {
    const environmentStore = useEnvironmentStore();
    const expenseStore = useExpenseStore();
    
    environmentStore.currentEnvironment = {
      id: 1,
      name: 'Home',
      description: 'Main home',
      created_at: '2024-01-01',
    };

    const fetchComputedExpensesSpy = vi.spyOn(expenseStore, 'fetchComputedExpenses').mockResolvedValue(undefined);

    const wrapper = mount(HistoryView, {
      global: {
        plugins: [router],
        stubs: {
          NavBar: true,
          EnvironmentSelector: true,
        },
      },
    });

    await flushPromises();

    expect(fetchComputedExpensesSpy).toHaveBeenCalledWith(1);
  });
});