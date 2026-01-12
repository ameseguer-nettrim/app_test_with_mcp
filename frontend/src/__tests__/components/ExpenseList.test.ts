import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ExpenseList from '../../components/ExpenseList.vue';
import { useExpenseStore } from '../../stores/expenseStore';
import type { Expense } from '../../types';

vi.mock('../../stores/expenseStore');

describe('ExpenseList Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.confirm = vi.fn(() => true);
    window.alert = vi.fn();
  });

  const mockExpenses: Expense[] = [
    {
      id: 1,
      amount: 50.0,
      description: 'Groceries',
      expense_date: '2024-01-10',
      payer_id: 1,
      payer_name: 'John',
      registered_by_id: 2,
      registered_by_name: 'Jane',
      environment_id: 1,
      created_at: '2024-01-10T10:00:00Z',
      updated_at: '2024-01-10T10:00:00Z',
    },
    {
      id: 2,
      amount: 75.5,
      description: 'Utilities',
      expense_date: '2024-01-11',
      payer_id: 2,
      payer_name: 'Jane',
      registered_by_id: 1,
      registered_by_name: 'John',
      environment_id: 1,
      created_at: '2024-01-11T10:00:00Z',
      updated_at: '2024-01-11T10:00:00Z',
    },
  ];

  it('renders expense list correctly', () => {
    const wrapper = mount(ExpenseList, {
      props: {
        expenses: mockExpenses,
        loading: false,
        environmentId: 1,
      },
    });

    expect(wrapper.text()).toContain('Current Expenses');
    expect(wrapper.text()).toContain('€50.00');
    expect(wrapper.text()).toContain('Groceries');
    expect(wrapper.text()).toContain('Paid by: John');
    expect(wrapper.text()).toContain('€75.50');
    expect(wrapper.text()).toContain('Utilities');
  });

  it('displays loading state', () => {
    const wrapper = mount(ExpenseList, {
      props: {
        expenses: [],
        loading: true,
        environmentId: 1,
      },
    });

    expect(wrapper.text()).toContain('Loading expenses...');
  });

  it('displays empty state when no expenses', () => {
    const wrapper = mount(ExpenseList, {
      props: {
        expenses: [],
        loading: false,
        environmentId: 1,
      },
    });

    expect(wrapper.text()).toContain('No expenses yet');
  });

  it('calculates total correctly', () => {
    const wrapper = mount(ExpenseList, {
      props: {
        expenses: mockExpenses,
        loading: false,
        environmentId: 1,
      },
    });

    expect(wrapper.text()).toContain('Total:');
    expect(wrapper.text()).toContain('€125.50'); // 50.00 + 75.50
  });

  it('shows compute button when expenses exist', () => {
    const wrapper = mount(ExpenseList, {
      props: {
        expenses: mockExpenses,
        loading: false,
        environmentId: 1,
      },
    });

    const computeButton = wrapper.find('button');
    expect(computeButton.text()).toContain('Compute & Export to Excel');
  });

  it('calls deleteExpense when delete button is clicked', async () => {
    const expenseStore = useExpenseStore();
    const deleteExpenseSpy = vi.spyOn(expenseStore, 'deleteExpense').mockResolvedValue(undefined);

    const wrapper = mount(ExpenseList, {
      props: {
        expenses: mockExpenses,
        loading: false,
        environmentId: 1,
      },
    });

    const deleteButtons = wrapper.findAll('button[title="Delete expense"]');
    await deleteButtons[0].trigger('click');

    expect(window.confirm).toHaveBeenCalled();
    expect(deleteExpenseSpy).toHaveBeenCalledWith(1);
  });

  it('calls computeExpenses when compute button is clicked', async () => {
    const expenseStore = useExpenseStore();
    const computeExpensesSpy = vi.spyOn(expenseStore, 'computeExpenses').mockResolvedValue(undefined);

    const wrapper = mount(ExpenseList, {
      props: {
        expenses: mockExpenses,
        loading: false,
        environmentId: 1,
      },
    });

    const computeButton = wrapper.find('button');
    await computeButton.trigger('click');

    expect(window.confirm).toHaveBeenCalled();
    expect(computeExpensesSpy).toHaveBeenCalledWith(1);
  });

  it('formats dates correctly', () => {
    const wrapper = mount(ExpenseList, {
      props: {
        expenses: mockExpenses,
        loading: false,
        environmentId: 1,
      },
    });

    expect(wrapper.text()).toContain('10/01/2024');
    expect(wrapper.text()).toContain('11/01/2024');
  });
});