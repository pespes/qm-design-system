import { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { RadioField } from '../RadioField.js';
import {
  defaultTests,
  descriptionTests,
  disabledTests,
  invalidTests,
} from '../RadioField.test.js';

const meta = {
  title: 'Components/RadioField',
  component: RadioField,
  args: {
    options: [
      { value: 'value 1', label: 'Radio 1' },
      { value: 'value 2', label: 'Radio 2' },
    ],
    label: 'A FieldSet Label',
    value: '',
    onValueChange: fn(),
    classes: {
      root: '',
      option: '',
      radio: '',
      label: '',
      descriptionText: '',
      radioLabel: '',
      radioDescriptionText: '',
      errorText: '',
    },
  },
  argTypes: {
    value: {
      description: 'A `value` string from `options[] prop`',
    },
    options: {
      description:
        'Array of `OptionProps[]`. Each item shape: `{ value: string; label: string; description?: string; disabled?: bool }`',
    },
    description: {
      description:
        'optional helper text that links to the RadioGroup via aria-describedby',
      type: 'string',
    },
    error: {
      description:
        'optional error text that renders when provided, setting the radios as aria-invalid',
      type: 'string',
    },
    disabled: {
      description: 'Whether the entire RadioField & options are disabled',
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
          'A list of Radio options, where only one option can be selected at a time. This component comes with `<RadioGroup>`' +
          ' and an accompanying label, description and error messaging.',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof RadioField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultStory(args) {
    const [selected, setSelected] = useState('');
    // Allow users to also update the value in the Storybook control panel for this primary example
    useEffect(() => setSelected(args.value ?? ''), [args.value]);

    return (
      <RadioField
        {...args}
        value={selected}
        onValueChange={(val) => {
          if (args.onValueChange) {
            args.onValueChange(val);
          }
          setSelected(val);
        }}
      />
    );
  },
};

// Hidden from the sidebar and docs (still run by Vitest) so browsing to Default doesn't auto-play the test
export const DefaultTest: Story = {
  ...Default,
  tags: ['!dev', '!autodocs'],
  play: defaultTests,
};

export const WithDescription: Story = {
  args: {
    description:
      'Select one of the available options. This is a group-level description that appears below the legend.',
    options: [
      {
        value: 'value 1',
        label: 'Radio 1',
        description: 'This is your first option',
      },
      {
        value: 'value 2',
        label: 'Radio 2',
        description: 'This is your second option',
      },
    ],
  },
  render: function WithDescriptionStory(args) {
    const [selected, setSelected] = useState('');

    return (
      <RadioField
        {...args}
        value={selected}
        onValueChange={(val) => {
          if (args.onValueChange) {
            args.onValueChange(val);
          }
          setSelected(val);
        }}
      />
    );
  },
  play: descriptionTests,
};

export const Invalid: Story = {
  args: {
    error: 'Please select an option',
    description: 'A description',
    required: true,
  },
  render: function InvalidStory(args) {
    const [selected, setSelected] = useState('');

    return (
      <RadioField
        {...args}
        value={selected}
        onValueChange={(val) => {
          if (args.onValueChange) {
            args.onValueChange(val);
          }
          setSelected(val);
        }}
      />
    );
  },
  play: invalidTests,
};

export const DisabledFieldSet: Story = {
  args: {
    disabled: true,
  },
  render: function DisabledFieldSetStory(args) {
    const [selected, setSelected] = useState('');

    return (
      <RadioField
        {...args}
        value={selected}
        onValueChange={(val) => {
          if (args.onValueChange) {
            args.onValueChange(val);
          }
          setSelected(val);
        }}
      />
    );
  },
  play: disabledTests,
};

export const DisabledOptions: Story = {
  args: {
    options: [
      { value: 'value 1', label: 'First Option' },
      { value: 'value 2', label: 'Another Option' },
      { value: 'value 3', label: 'Not this Option', disabled: true },
    ],
  },
  render: function DisabledOptionsStory(args) {
    const [selected, setSelected] = useState('');

    return (
      <RadioField
        {...args}
        value={selected}
        onValueChange={(val) => {
          if (args.onValueChange) {
            args.onValueChange(val);
          }
          setSelected(val);
        }}
      />
    );
  },
};
