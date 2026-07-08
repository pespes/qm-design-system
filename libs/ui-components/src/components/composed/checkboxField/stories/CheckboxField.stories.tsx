import { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CheckboxField } from '../CheckboxField.js';
import {
  defaultTests,
  descriptionTests,
  disabledTests,
  invalidTests,
} from '../CheckboxField.test.js';
import { Checkbox } from '@/components/composed/checkbox/Checkbox.js';

const meta = {
  title: 'Components/CheckboxField',
  component: CheckboxField,
  args: {
    label: 'Select your preferences',
    value: [],
    onValueChange: fn(),
    classes: {
      root: '',
      label: '',
      descriptionText: '',
      errorText: '',
    },
    children: (
      <>
        <Checkbox label='Option 1' value='option-1' name='option-1' />
        <Checkbox label='Option 2' value='option-2' name='option-2' />
        <Checkbox label='Option 3' value='option-3' name='option-3' />
      </>
    ),
  },
  argTypes: {
    value: {
      description: 'Array of selected checkbox values',
      control: { type: 'object' },
    },
    label: {
      description: 'The legend/label for the group of checkboxes',
      type: 'string',
    },
    description: {
      description:
        'Optional helper text that describes the group of checkboxes',
      type: 'string',
    },
    error: {
      description: 'Optional error text that renders when provided',
      type: 'string',
    },
    disabled: {
      description: 'Whether the entire CheckboxField & options are disabled',
      type: 'boolean',
      control: { type: 'boolean' },
    },
    classes: {
      description: 'For custom styling individual elements',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A group of checkboxes with a legend, optional description, error messaging, and support for validation states. ' +
          'Use this component when you need form-integrated checkbox selections with validation and error handling.',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof CheckboxField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultStory(args) {
    const [selected, setSelected] = useState<string[]>(args.value ?? []);
    useEffect(() => setSelected(args.value ?? []), [args.value]);

    return (
      <div className='flex flex-col gap-300'>
        <CheckboxField
          {...args}
          value={selected}
          onValueChange={(val) => {
            args.onValueChange?.(val);
            setSelected(val);
          }}
        />
        <p>Selected: {selected.join(', ')}</p>
      </div>
    );
  },
  play: defaultTests,
};

export const WithDescription: Story = {
  args: {
    description: 'Select you notification methods.',
  },
  render: function WithDescriptionStory(args) {
    const [selected, setSelected] = useState<string[]>([]);

    return (
      <CheckboxField
        {...args}
        value={selected}
        onValueChange={(val) => {
          args.onValueChange?.(val);
          setSelected(val);
        }}
      >
        <Checkbox
          label='Weekly Digest'
          value='digest'
          description='Just a peek at the week'
        />
        <Checkbox
          label='Monthly Reports'
          value='reports'
          description="What's going on this month"
        />
        <Checkbox
          label='Event Notifications'
          value='events'
          description='Some noteworthy events'
        />
      </CheckboxField>
    );
  },
  play: descriptionTests,
};

export const Invalid: Story = {
  args: {
    error: [
      { message: 'Please make a selection' },
      { message: 'Another error!' },
    ],
    description: 'Your preferences help us tailor your experience.',
  },
  render: function InvalidStory(args) {
    const [selected, setSelected] = useState<string[]>([]);

    return (
      <CheckboxField
        {...args}
        value={selected}
        onValueChange={(val) => {
          args.onValueChange?.(val);
          setSelected(val);
        }}
      />
    );
  },
  play: invalidTests,
};

export const DisabledField: Story = {
  args: {
    disabled: true,
  },
  render: function DisabledFieldStory(args) {
    const [selected, setSelected] = useState<string[]>([]);

    return (
      <CheckboxField
        {...args}
        value={selected}
        onValueChange={(val) => {
          args.onValueChange?.(val);
          setSelected(val);
        }}
      />
    );
  },
  play: disabledTests,
};

export const DisabledOptions: Story = {
  render: function DisabledOptionsStory(args) {
    const [selected, setSelected] = useState<string[]>([]);

    return (
      <div className='flex flex-col gap-300'>
        <CheckboxField
          {...args}
          value={selected}
          onValueChange={(val) => {
            args.onValueChange?.(val);
            setSelected(val);
          }}
        >
          <Checkbox
            label='Available Option'
            value='available'
            name='available'
          />
          <Checkbox
            label='Another Available'
            value='available-2'
            name='available-2'
          />
          <Checkbox label='Coming Soon' value='soon' disabled name='soon' />
          <Checkbox
            label='Not Available'
            value='unavailable'
            disabled
            name='unavailable'
          />
        </CheckboxField>
        <p>Selected: {selected.join(', ')}</p>
      </div>
    );
  },
};
