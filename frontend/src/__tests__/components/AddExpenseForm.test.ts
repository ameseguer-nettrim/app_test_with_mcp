import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AddExpenseForm from '../../components/AddExpenseForm.vue';
import { useExpenseStore } from '../../stores/expenseStore';

vi.mock('../../stores/expenseStore');

describe('AddExpenseForm Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders the form with all fields', () => {
    const wrapper = mount(AddExpenseForm, {
      props: {
        environmentId: 1,
        people: [
          { id: 1, name: 'John', email: 'john@example.com' },
          { id: 2, name: 'Jane', email: 'jane@example.com' },
        ],
      },
    });

    expect(wrapper.find('#amount').exists()).toBe(true);
    expect(wrapper.find('#payer').exists()).toBe(true);
    expect(wrapper.find('#description').exists()).toBe(true);
    expect(wrapper.find('#expenseDate').exists()).toBe(true);
    expect(wrapper.text()).toContain('Add New Expense');
  });

  it('populates payer select with people', () => {
    const wrapper = mount(AddExpenseForm, {
      props: {
        environmentId: 1,
        people: [
          { id: 1, name: 'John', email: 'john@example.com' },
          { id: 2, name: 'Jane', email: 'jane@example.com' },
        ],
      },
    });

    const select = wrapper.find('#payer');
    const options = select.findAll('option');
    
    expect(options.length).toBe(3); // Including "Select person"
    expect(options[1].text()).toBe('John');
    expect(options[2].text()).toBe('Jane');
  });

  it('disables submit when no environment selected', () => {
    const wrapper = mount(AddExpenseForm, {
      props: {
        environmentId: null,
        people: [],
      },
    });

    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.attributes('disabled')).toBeDefined();
  });

  it('calls createExpense on form submit', async () => {
    const expenseStore = useExpenseStore();
    const createExpenseSpy = vi.spyOn(expenseStore, 'createExpense').mockResolvedValue({ expense: { id: 1 } });

    const wrapper = mount(AddExpenseForm, {
      props: {
        environmentId: 1,
        people: [
          { id: 1, name: 'John', email: 'john@example.com' },
        ],
      },
    });

    await wrapper.find('#amount').setValue('50.00');
    await wrapper.find('#payer').setValue('1');
    await wrapper.find('#description').setValue('Test expense');
    await wrapper.find('#expenseDate').setValue('2024-01-10');

    await wrapper.find('form').trigger('submit.prevent');

    expect(createExpenseSpy).toHaveBeenCalledWith({
      amount: 50,
      description: 'Test expense',
      expense_date: '2024-01-10',
      payer_id: 1,
      environment_id: 1,
    });
  });

  it('emits expense-added event after successful creation', async () => {
    const expenseStore = useExpenseStore();
    vi.spyOn(expenseStore, 'createExpense').mockResolvedValue({ expense: { id: 1 } });

    const wrapper = mount(AddExpenseForm, {
      props: {
        environmentId: 1,
        people: [
          { id: 1, name: 'John', email: 'john@example.com' },
        ],
      },
    });

    await wrapper.find('#amount').setValue('50.00');
    await wrapper.find('#payer').setValue('1');
    await wrapper.find('#description').setValue('Test expense');
    await wrapper.find('#expenseDate').setValue('2024-01-10');

    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('expense-added')).toBeTruthy();
  });

  it('displays error message on failed submission', async () => {
    const expenseStore = useExpenseStore();
    vi.spyOn(expenseStore, 'createExpense').mockRejectedValue({
      response: { data: { error: 'Failed to create expense' } },
    });

    const wrapper = mount(AddExpenseForm, {
      props: {
        environmentId: 1,
        people: [
          { id: 1, name: 'John', email: 'john@example.com' },
        ],
      },
    });

    await wrapper.find('#amount').setValue('50.00');
    await wrapper.find('#payer').setValue('1');
    await wrapper.find('#description').setValue('Test expense');
    await wrapper.find('#expenseDate').setValue('2024-01-10');

    await wrapper.find('form').trigger('submit.prevent');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Failed to create expense');
  });
});