import { useState, useEffect, createRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Switch } from '../Switch.js';
import {
  defaultTests,
  disabledTests,
  invalidTests,
  polymorphicTests,
} from '../Switch.test.js';
import { Label } from '@/components/primitives/label/Label.js';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    size: 'md',
    checked: false,
    onCheckedChange: fn(),
    disabled: false,
    classes: {
      root: '',
      thumb: '',
    },
  },
  argTypes: {
    id: {
      type: 'string',
    },
    defaultChecked: {
      type: 'boolean',
      description: 'Whether the Switch initially renders as checked',
    },
    inputRef: {
      description: 'ref that can be passed directly to the input',
    },
    uncheckedValue: {
      description: 'The value submitted with the form when switch is off',
      type: 'string',
    },
    nativeButton: {
      description:
        'Whether the component renders a `<button>` in place of a `<span>` when using the render() prop. Defaults to false',
      type: 'boolean',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A control that allows users to toggle between an "on" (checked) and "off" (unchecked) state.',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultStory(args) {
    const [checked, setChecked] = useState(args.checked);
    useEffect(() => setChecked(args.checked), [args.checked]);
    return (
      <Switch
        {...args}
        aria-label='Satisfy a11y Testing'
        checked={checked}
        onCheckedChange={(val) => {
          args.onCheckedChange?.(val);
          setChecked(val);
        }}
      />
    );
  },
  play: defaultTests,
};

export const WithLabel: Story = {
  render: function WithLabel(args) {
    const [checked, setChecked] = useState(false);
    return (
      <div>
        <Label htmlFor='switch-labelled' className='inline-flex mr-600'>
          Automatically Update
        </Label>
        <Switch
          {...args}
          id='switch-labelled'
          checked={checked}
          onCheckedChange={(val) => {
            args.onCheckedChange?.(val);
            setChecked(val);
          }}
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: function Disabled(args) {
    const [checked, setChecked] = useState(false);
    return (
      <div className='flex flex-row gap-400'>
        <Switch
          {...args}
          aria-label='Satisfy a11y Testing'
          checked={checked}
          onCheckedChange={(val) => {
            args.onCheckedChange?.(val);
            setChecked(val);
          }}
        />
        <Switch {...args} checked={true} aria-label='Satisfy a11y testing' />
      </div>
    );
  },
  play: disabledTests,
};

export const AllSizes: Story = {
  render: function Sizes(args) {
    const [checked, setChecked] = useState(false);
    return (
      <div className='flex gap-400 items-center'>
        <Switch
          {...args}
          size='sm'
          aria-label='Small'
          checked={checked}
          onCheckedChange={(val) => setChecked(val)}
        />
        <Switch
          {...args}
          size='md'
          aria-label='Medium'
          checked={checked}
          onCheckedChange={(val) => setChecked(val)}
        />
        <Switch
          {...args}
          size='lg'
          aria-label='Large'
          checked={checked}
          onCheckedChange={(val) => setChecked(val)}
        />
      </div>
    );
  },
};

export const Polymorphism: Story = {
  render: function Test(args) {
    const [checked, setChecked] = useState(false);
    return (
      <Switch
        {...args}
        render={<button data-testid='test' />}
        nativeButton
        aria-label='Satisfy a11y Testing'
        data-testid='test'
        checked={checked}
        onCheckedChange={(val) => {
          args.onCheckedChange?.(val);
          setChecked(val);
        }}
      />
    );
  },
  play: polymorphicTests,
};

const inputRef = createRef<HTMLInputElement>();
const rootRef = createRef<HTMLSpanElement>();
export const Invalid: Story = {
  args: {
    'aria-invalid': true,
    inputRef,
    ref: rootRef,
  },
  render: function InvalidStory(args) {
    const [checked, setChecked] = useState(false);
    return (
      <Switch
        {...args}
        aria-label='Satisfy a11y Testing'
        checked={checked}
        onCheckedChange={(val) => {
          args.onCheckedChange?.(val);
          setChecked(val);
        }}
      />
    );
  },
  play: invalidTests,
};
