import React, { useState, createRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InfoIcon, LockIcon } from 'lucide-react';
import { fn } from 'storybook/test';
import { InputField } from '../InputField.js';
import {
  defaultTests,
  disabledTests,
  descriptionTest,
  invalidTests,
  requiredTests,
} from '../InputField.test.js';

const meta = {
  title: 'Components/InputField',
  component: InputField,
  args: {
    label: 'I am a Label',
    size: 'default',
    value: '',
    onChange: fn(),
    placeholder: 'This is a placeholder...',
    error: '',
    description: '',
    classes: { root: '', label: '', input: '', icon: '' },
  },
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: ['default', 'lg'],
    },
    description: {
      description:
        'optional helper text that links to input via aria-describedby',
      type: 'string',
    },
    error: {
      description:
        'optional error text that renders when provided, setting the input as aria-invalid',
      type: 'string',
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
} satisfies Meta<typeof InputField>;

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
    const [value, setValue] = useState(args.value);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      args.onChange?.(e);
      setValue(e.target.value);
    };
    return (
      <InputField
        {...args}
        testId={args.testId}
        onChange={handleChange}
        value={value}
      />
    );
  },
  play: defaultTests,
};

export const WithDescription: Story = {
  args: {
    description: 'This is a description for your Input',
    // error: [{ message: 'Uh Oh' }],
  },
  play: descriptionTest,
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
      <InputField
        {...args}
        testId='disabled-input'
        onChange={handleChange}
        value={value}
      />
    );
  },
  play: disabledTests,
};

export const Invalid: Story = {
  args: {
    placeholder: 'Uh oh....',
    error: 'Input must not be empty',
    description: 'More descriptive text for your Input',
  },
  render: function DisabledStory(args) {
    const [value, setValue] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      args.onChange?.(e);
      setValue(e.target.value);
    };
    return (
      <InputField
        {...args}
        testId='disabled-input'
        onChange={handleChange}
        value={value}
      />
    );
  },
  play: invalidTests,
};

export const Required: Story = {
  args: {
    required: true,
    testId: 'required-textarea-group',
  },
  play: requiredTests,
};
