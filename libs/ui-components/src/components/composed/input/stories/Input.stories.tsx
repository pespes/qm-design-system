import React, { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InfoIcon, LockIcon } from 'lucide-react';
import { fn } from 'storybook/test';
import { Input } from '../Input.js';
import {
  defaultTests,
  sizesTest,
  iconTests,
  disabledTests,
  invalidTests,
  passwordTests,
  passwordDisabledTests,
} from '../Input.test.js';

const meta = {
  title: 'Components/Input',
  component: Input,
  args: {
    size: 'default',
    value: '',
    onChange: fn(),
    placeholder: 'This is a placeholder...',
    classes: { root: '', icon: '' },
  },
  argTypes: {
    startAdornment: {
      control: { type: 'select' },
      options: ['infoIcon', 'lockIcon', 'none'],
      mapping: {
        infoIcon: <InfoIcon />,
        lockIcon: <LockIcon />,
        none: undefined,
      },
    },
    endAdornment: {
      control: { type: 'select' },
      options: ['infoIcon', 'lockIcon', 'none'],
      mapping: {
        infoIcon: <InfoIcon />,
        lockIcon: <LockIcon />,
        none: undefined,
      },
    },
    togglePasswordText: {
      description: 'Aria-label text for the passwword toggle button',
    },
    hasVisibilityToggle: {
      description: 'Allow for password text to be toggled to visible',
    },
    autoFocus: {
      description: 'If true, the input element is focused on first mount',
      type: 'boolean',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A Text input component. This component does not come with a label, description or error text. See InputGroup for this additional functionality.',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultStory(args) {
    const [value, setValue] = useState(args.value ?? '');
    useEffect(() => setValue(args.value ?? ''), [args.value]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      args.onChange?.(e);
      setValue(e.target.value);
    };
    return <Input {...args} onChange={handleChange} value={value} />;
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
    const [value, setValue] = useState(args.value ?? '');
    useEffect(() => setValue(args.value ?? ''), [args.value]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      args.onChange?.(e);
      setValue(e.target.value);
    };
    return <Input {...args} onChange={handleChange} value={value} />;
  },
  play: disabledTests,
};

export const Invalid: Story = {
  args: {
    'aria-invalid': true,
  },
  render: function InvalidStory(args) {
    const [value, setValue] = useState(args.value ?? '');
    useEffect(() => setValue(args.value ?? ''), [args.value]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      args.onChange?.(e);
      setValue(e.target.value);
    };
    return <Input {...args} onChange={handleChange} value={value} />;
  },
  play: invalidTests,
};

export const WithAdornments: Story = {
  render: function AdornmentStory(args) {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    return (
      <div className='flex flex-col gap-400'>
        <Input
          {...args}
          startAdornment={<LockIcon />}
          onChange={(e) => setValue1(e.target.value)}
          value={value1}
        />
        <Input
          {...args}
          endAdornment={<InfoIcon />}
          onChange={(e) => setValue2(e.target.value)}
          value={value2}
        />
      </div>
    );
  },
  play: iconTests,
};

export const Password: Story = {
  args: {
    type: 'password',
    endAdornment: <LockIcon />,
  },
  render: function PasswordStory(args) {
    const [value, setValue] = useState(args.value ?? '');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      args.onChange?.(e);
      setValue(e.target.value);
    };
    return <Input {...args} onChange={handleChange} value={value} />;
  },
  play: passwordTests,
};

export const PasswordDisabled: Story = {
  args: {
    type: 'password',
  },
  render: function PasswordDisabledStory(args) {
    const [disabledValue, setDisabledValue] = useState('');
    const [noToggleValue, setNoToggleValue] = useState('');
    return (
      <div className='flex flex-col gap-400'>
        <Input
          {...args}
          disabled
          onChange={(e) => setDisabledValue(e.target.value)}
          value={disabledValue}
        />
        <Input
          {...args}
          hasVisibilityToggle={false}
          onChange={(e) => setNoToggleValue(e.target.value)}
          value={noToggleValue}
        />
      </div>
    );
  },
  play: passwordDisabledTests,
};

export const AllSizes: Story = {
  render: () => (
    <div className='flex flex-col gap-400'>
      <Input placeholder='default placeholder' />
      <Input size='lg' placeholder='lg placeholder' />
    </div>
  ),
  play: sizesTest,
};

export const AllTypes: Story = {
  render: () => (
    <div className='flex flex-col gap-400'>
      <Input placeholder='text...' type='text' />
      <Input placeholder='email...' type='email' />
      <Input placeholder='number...' type='number' />
      <Input placeholder='telephone...' type='tel' />
      <Input placeholder='password...' type='password' />
    </div>
  ),
};
