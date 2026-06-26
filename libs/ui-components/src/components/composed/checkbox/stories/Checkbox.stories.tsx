import { useState, useEffect, createRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Checkbox } from '../Checkbox.js';
import {
  defaultTests,
  descriptionTests,
  disabledTests,
  invalidTests,
} from '../Checkbox.test.js';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: {
    onCheckedChange: fn(),
    checked: false,
    label: "I'm a label",
    disabled: false,
    classes: {
      root: '',
      checkbox: '',
      icon: '',
      label: '',
    },
  },
  argTypes: {
    onCheckedChange: {
      description: 'Event called when checkbox is selected/unselected',
    },
    ref: {
      description: 'A ref passed to the `<span>` element with role="radio"',
    },
    checked: {
      description: 'Whether the checkbox is selected or not',
      control: { type: 'boolean' },
    },
    description: {
      description:
        'Optional helper text linked to the checkbox via aria-describedby',
      type: 'string',
    },
    required: {
      type: 'boolean',
      control: { type: 'boolean' },
      description:
        'Whether the checkbox must be selected before submitting a form',
    },
    classes: {
      description: 'For custom styling of individual elements',
    },
    inputRef: {
      description: 'A ref to access the hidden `<input>` element',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'An individual Checkbox component with an accompanying label. This checkbox allows you to toggle between checked and unchecked states.',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultStory(args) {
    const [checked, setChecked] = useState(args.checked);
    useEffect(() => setChecked(args.checked), [args.checked]);
    return (
      <Checkbox
        {...args}
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

export const WithDescription: Story = {
  args: {
    label: 'Enable this feature',
    description: 'This is an awesome feature',
  },
  render: function WithDescription(args) {
    const [checked, setChecked] = useState(args.checked);
    return (
      <Checkbox
        {...args}
        checked={checked}
        onCheckedChange={(val) => {
          args.onCheckedChange?.(val);
          setChecked(val);
        }}
      />
    );
  },
  play: descriptionTests,
};

export const Disabled: Story = {
  render: () => (
    <div className='flex gap-400'>
      <Checkbox label='Try and Select Me' disabled />
      <Checkbox label='Try and Unselect Me' disabled checked={true} />
    </div>
  ),
  play: disabledTests,
};

const checkboxRef = createRef<HTMLSpanElement>();
export const Invalid: Story = {
  args: {
    invalid: true,
    ref: checkboxRef,
  },
  render: function InvalidStory(args) {
    const [checked, setChecked] = useState(args.checked);
    useEffect(() => setChecked(args.checked), [args.checked]);

    return (
      <Checkbox
        {...args}
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
