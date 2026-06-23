import { useState, useEffect, createRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SwitchField } from '../SwitchField.js';
import {
  defaultTests,
  generatedIdTests,
  disabledTests,
  descriptionTests,
  invalidTests,
  requiredTests,
} from '../SwitchField.test.js';

const meta = {
  title: 'Components/SwitchField',
  component: SwitchField,
  args: {
    size: 'md',
    checked: false,
    onCheckedChange: fn(),
    label: 'A Switch Label',
    classes: {
      root: '',
      thumb: '',
    },
  },
  argTypes: {
    size: {
      description: 'Size of the switch',
      control: { type: 'radio' },
      options: ['md', 'sm', 'lg'],
    },
    description: {
      description: 'The description for the switch',
      type: 'string',
    },
    error: {
      description: 'The error for the switch',
      type: 'string',
    },
    disabled: {
      description: 'Whether the Switch is disabled',
      control: { type: 'boolean' },
    },
    required: {
      description: 'Whether the field is required',
      type: 'boolean',
    },
    reverse: {
      description: 'Reverse grid layout (label on right, control on left)',
      type: 'boolean',
    },
    uncheckedValue: {
      description: 'The value submitted with the form when switch is off',
      type: 'string',
    },
    id: {
      type: 'string',
    },
    inputRef: {
      description: 'ref that can be passed directly to the input',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A composed component combining a `<Switch/>` with label, description and error fields to create an accessible form field. For more information on the Switch component itself, visit the [Switch Page](?path=/docs/components-switch--docs)',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof SwitchField>;

export default meta;
type Story = StoryObj<typeof meta>;

const switchRef = createRef<HTMLSpanElement>();

export const Default: Story = {
  args: {
    ref: switchRef,
    id: 'custom-switch-id',
  },
  render: function DefaultStory(args) {
    const [checked, setChecked] = useState(args.checked);
    useEffect(() => setChecked(args.checked), [args.checked]);
    return (
      <SwitchField
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

export const GeneratedId: Story = {
  args: {
    id: undefined,
  },
  render: function GeneratedIdStory(args) {
    const [checked, setChecked] = useState(false);
    return (
      <SwitchField
        {...args}
        checked={checked}
        onCheckedChange={(val) => {
          args.onCheckedChange?.(val);
          setChecked(val);
        }}
      />
    );
  },
  play: generatedIdTests,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: function DisabledStory(args) {
    const [checked, setChecked] = useState(false);
    return (
      <SwitchField
        {...args}
        checked={checked}
        onCheckedChange={(val) => {
          args.onCheckedChange?.(val);
          setChecked(val);
        }}
      />
    );
  },
  play: disabledTests,
};

export const WithDescription: Story = {
  args: {
    description: 'This is a helpful description for the switch',
  },
  render: function WithDescriptionStory(args) {
    const [checked, setChecked] = useState(false);
    return (
      <SwitchField
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

export const Invalid: Story = {
  args: {
    error: [
      {
        message:
          'You must enable this feature this feature to continue to the next step',
      },
      { message: 'Second error should not appear' },
    ],
    description: 'This is a really awesome feature',
  },
  render: function InvalidStory(args) {
    const [checked, setChecked] = useState(false);
    return (
      <SwitchField
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

export const Required: Story = {
  args: {
    required: true,
  },
  render: function RequiredStory(args) {
    const [checked, setChecked] = useState(false);
    return (
      <SwitchField
        {...args}
        checked={checked}
        onCheckedChange={(val) => {
          args.onCheckedChange?.(val);
          setChecked(val);
        }}
      />
    );
  },
  play: requiredTests,
};
