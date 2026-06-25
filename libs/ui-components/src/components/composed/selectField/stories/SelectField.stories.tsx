import { useState, createRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SelectField } from '../SelectField.js';

const meta = {
  title: 'Components/SelectField',
  component: SelectField,
  args: {
    label: 'I am a Label',
    value: null,
    onValueChange: fn(),
    items: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'kiwi', label: 'Kiwi' },
      { value: 'mango', label: 'MANGO mango mango mango mango... MANGO' },
      { value: 'dragonfruit', label: 'Dragonfruit' },
      { value: 'blueberry', label: 'Blueberry' },
      { value: 'raspberry', label: 'Raspberry' },
      { value: 'pear', label: 'Pear' },
    ],
    classes: {
      root: '',
      label: '',
      errorText: '',
      descriptionText: '',
      trigger: '',
      triggerContent: '',
      overlay: '',
      groupLabel: '',
      item: '',
      scrollBtn: '',
      selectItemIcon: '',
    },
  },
  argTypes: {
    items: {
      control: { disabled: true },
    },
    placeholder: {
      description: 'Placeholder text shown when no value is selected',
      type: 'string',
    },
    disabled: {
      description: 'Whether the Select is disabled',
      type: 'boolean',
      control: { type: 'boolean' },
    },
    id: {
      description:
        'An id that connects label with native select trigger, also passed as testId',
      type: 'string',
    },
    description: {
      description: 'The description for the select',
      type: 'string',
    },
    error: {
      description: 'The error for the select',
      type: 'string',
    },
    required: {
      description: 'Whether the field is required',
      type: 'boolean',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The Select component combined with a label, error and description to create an accessible form field. For more information on the Select' +
          ' component itself, visit the [Select Page](?path=/docs/components-select--docs)',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof SelectField>;

export default meta;
type Story = StoryObj<typeof meta>;

const selectRef = createRef<HTMLButtonElement>();
export const Default: Story = {
  args: {
    id: 'default-select-field',
    ref: selectRef,
    onOpenChange: fn(),
  },
  render: function DefaultStory(args) {
    const [value, setValue] = useState<string | number | null>(null);
    return (
      <SelectField
        {...args}
        data-testid={args.id}
        value={value}
        onValueChange={(val) => {
          args.onValueChange?.(val);
          setValue(val);
        }}
      />
    );
  },
};

export const WithDescription: Story = {
  args: {
    description:
      'Please select your preferred fruit from the many options. Make this description way too long to test how it wraps',
  },
  render: function WithDescriptionStory(args) {
    const [value, setValue] = useState<string | number | null>(null);
    return (
      <SelectField
        {...args}
        data-testid='with-description-select-field'
        value={value}
        onValueChange={(val) => {
          args.onValueChange?.(val);
          setValue(val);
        }}
      />
    );
  },
};
