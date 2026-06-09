import React, { useState, createRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InfoIcon, LockIcon } from 'lucide-react';
import { fn } from 'storybook/test';
import { InputGroup } from '../InputGroup.js';
import { defaultTests, disabledTests } from '../InputGroup.test.js';

const meta = {
  title: 'Components/InputGroup',
  component: InputGroup,
  args: {
    label: 'I am a Label',
    size: 'default',
    value: '',
    onChange: fn(),
    placeholder: 'This is a placeholder...',
    classes: { root: '', label: '', input: '', icon: '' },
  },
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: ['default', 'lg'],
    },
    startAdornment: {
      description: 'An icon that renders nested in the Input, at the start',
      control: { type: 'select' },
      options: ['infoIcon', 'lockIcon', 'none'],
      mapping: {
        infoIcon: <InfoIcon />,
        lockIcon: <LockIcon />,
        none: undefined,
      },
    },
    endAdornment: {
      description: 'An icon that renders nested in the Input, at the end',
      control: { type: 'select' },
      options: ['infoIcon', 'lockIcon', 'none'],
      mapping: {
        infoIcon: <InfoIcon />,
        lockIcon: <LockIcon />,
        none: undefined,
      },
    },
    type: {
      description: 'Array of input data types',
      control: { type: 'select' },
      options: ['text', 'number', 'email', 'password', 'tel', 'url'],
    },
    disabled: {
      description: 'Whether the Input is disabled',
      type: 'boolean',
      control: { type: 'boolean' },
    },
    togglePasswordText: {
      description:
        'Aria-label text for the passwword toggle button. Defaults to "hide password" / "show password" ',
      control: { type: 'object' },
    },
    hasVisibilityToggle: {
      description:
        'Allow for password text to be toggled to visible. Only applicable for inputs with type="password"',
      type: 'boolean',
    },
    autoFocus: {
      description: 'If true, the input element is focused on first mount',
      type: 'boolean',
    },
    testId: {
      description: "An id to pass to the native input's data-testid attribute",
      type: 'string',
    },
    passwordTestId: {
      description:
        "An id to pass to the password toggle's data-testid attribute",
      type: 'string',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'An Input component combined with a label to create an accessible form field. For more information on the Input' +
          ' component itself, visit the [Input Page](?path=/docs/components-input--docs)',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const inputRef = createRef<HTMLInputElement>();
export const Default: Story = {
  args: {
    testId: 'default-input',
    ref: inputRef,
    id: 'custom-id',
  },
  render: function DefaultStory(args) {
    const [value, setValue] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      args.onChange?.(e);
      setValue(e.target.value);
    };
    return (
      <InputGroup
        {...args}
        testId={args.testId}
        onChange={handleChange}
        value={value}
      />
    );
  },
  play: defaultTests,
};

export const Disabled: Story = {
  args: {
    disabled: true,
    endAdornment: <LockIcon />,
    value: "You can't change me",
  },
  render: function DisabledStory(args) {
    const [value, setValue] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      args.onChange?.(e);
      setValue(e.target.value);
    };
    return (
      <InputGroup
        {...args}
        testId='disabled-input'
        onChange={handleChange}
        value={value}
      />
    );
  },
  play: disabledTests,
};
