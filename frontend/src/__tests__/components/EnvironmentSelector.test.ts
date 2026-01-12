import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import EnvironmentSelector from '../../components/EnvironmentSelector.vue';
import { useEnvironmentStore } from '../../stores/environmentStore';
import type { Environment } from '../../types';

vi.mock('../../stores/environmentStore');

describe('EnvironmentSelector Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mockEnvironments: Environment[] = [
    { id: 1, name: 'Home', description: 'Main home', created_at: '2024-01-01' },
    { id: 2, name: 'Summer House', description: 'Vacation home', created_at: '2024-01-02' },
  ];

  it('renders environment list correctly', async () => {
    const environmentStore = useEnvironmentStore();
    environmentStore.environments = mockEnvironments;
    environmentStore.loading = false;

    const wrapper = mount(EnvironmentSelector);
    await flushPromises();

    expect(wrapper.text()).toContain('Select Environment');
    expect(wrapper.text()).toContain('Home');
    expect(wrapper.text()).toContain('Summer House');
  });

  it('displays loading state', () => {
    const environmentStore = useEnvironmentStore();
    environmentStore.environments = [];
    environmentStore.loading = true;

    const wrapper = mount(EnvironmentSelector);

    expect(wrapper.text()).toContain('Loading environments...');
  });

  it('displays empty state when no environments', () => {
    const environmentStore = useEnvironmentStore();
    environmentStore.environments = [];
    environmentStore.loading = false;

    const wrapper = mount(EnvironmentSelector);

    expect(wrapper.text()).toContain('No environments yet');
  });

  it('shows create environment button', () => {
    const wrapper = mount(EnvironmentSelector);

    const createButton = wrapper.find('button');
    expect(createButton.text()).toContain('New Environment');
  });

  it('opens create modal when button clicked', async () => {
    const wrapper = mount(EnvironmentSelector);

    const createButton = wrapper.find('button');
    await createButton.trigger('click');

    expect(wrapper.text()).toContain('Create New Environment');
    expect(wrapper.find('#envName').exists()).toBe(true);
  });

  it('calls setCurrentEnvironment when environment is clicked', async () => {
    const environmentStore = useEnvironmentStore();
    environmentStore.environments = mockEnvironments;
    environmentStore.loading = false;
    const setCurrentEnvironmentSpy = vi.spyOn(environmentStore, 'setCurrentEnvironment').mockResolvedValue(undefined);

    const wrapper = mount(EnvironmentSelector);
    await flushPromises();

    const environmentButtons = wrapper.findAll('button').filter(btn => btn.text().includes('Home'));
    await environmentButtons[0].trigger('click');

    expect(setCurrentEnvironmentSpy).toHaveBeenCalledWith(1);
  });

  it('emits environment-selected event when environment is selected', async () => {
    const environmentStore = useEnvironmentStore();
    environmentStore.environments = mockEnvironments;
    environmentStore.loading = false;
    vi.spyOn(environmentStore, 'setCurrentEnvironment').mockResolvedValue(undefined);

    const wrapper = mount(EnvironmentSelector);
    await flushPromises();

    const environmentButtons = wrapper.findAll('button').filter(btn => btn.text().includes('Home'));
    await environmentButtons[0].trigger('click');
    await flushPromises();

    expect(wrapper.emitted('environment-selected')).toBeTruthy();
  });

  it('highlights selected environment', () => {
    const environmentStore = useEnvironmentStore();
    environmentStore.environments = mockEnvironments;
    environmentStore.currentEnvironment = mockEnvironments[0];
    environmentStore.loading = false;

    const wrapper = mount(EnvironmentSelector);

    const buttons = wrapper.findAll('button').filter(btn => btn.text().includes('Home'));
    expect(buttons[0].classes()).toContain('border-primary-500');
  });

  it('creates new environment when form is submitted', async () => {
    const environmentStore = useEnvironmentStore();
    const createEnvironmentSpy = vi.spyOn(environmentStore, 'createEnvironment').mockResolvedValue({
      environment: { id: 3, name: 'New Home', description: 'Test' },
    });

    const wrapper = mount(EnvironmentSelector);

    const createButton = wrapper.find('button');
    await createButton.trigger('click');

    await wrapper.find('#envName').setValue('New Home');
    await wrapper.find('#envDescription').setValue('Test description');

    const form = wrapper.find('form');
    await form.trigger('submit.prevent');
    await flushPromises();

    expect(createEnvironmentSpy).toHaveBeenCalledWith({
      name: 'New Home',
      description: 'Test description',
    });
  });
});