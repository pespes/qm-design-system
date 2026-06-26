import { useState, useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CheckboxGroup } from '../CheckboxGroup.js';
import { defaultTests, disabledGroupTests } from '../CheckboxGroup.test.js';
import { Checkbox } from '@/components/composed/checkbox/Checkbox.js';

const meta = {
  title: 'Components/CheckboxGroup',
  component: CheckboxGroup,
  args: {
    value: [],
    onValueChange: fn(),
    classes: { root: '' },
  },
  argTypes: {
    value: {
      description: 'Array of selected checkbox values',
      control: { type: 'object' },
    },
    onValueChange: {
      description: 'Event called when checkbox selection changes',
    },
    disabled: {
      description: 'Whether the entire CheckboxGroup is disabled',
      type: 'boolean',
      control: { type: 'boolean' },
    },
    classes: {
      description:
        'Class override for the CheckboxGroup itself (not checkboxes)',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A wrapper component that manages the selection state of multiple Checkbox components. ' +
          "Checkboxes within a CheckboxGroup are controlled via the group's value and onChange props. ",
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultStory(args) {
    const [selected, setSelected] = useState(args.value ?? []);
    useEffect(() => setSelected(args.value ?? []), [args.value]);

    return (
      <div>
        <CheckboxGroup
          {...args}
          value={selected}
          onValueChange={(val) => {
            args.onValueChange?.(val);
            setSelected(val);
          }}
        >
          <Checkbox label='Option 1' name='option-1' value='option-1' />
          <Checkbox label='Option 2' name='option-2' value='option-2' />
          <Checkbox label='Option 3' name='option-3' value='option-3' />
        </CheckboxGroup>
        <p>Selected options: {selected.join(', ')} </p>
      </div>
    );
  },
  play: defaultTests,
};

export const WithGroupLabel: Story = {
  render: function LabelledStory(args) {
    const [selected, setSelected] = useState<string[]>([]);

    return (
      <div className='flex flex-col gap-100'>
        <label
          id='group-label'
          className='type-ui-lead my-200'
          htmlFor='checkbox-group'
        >
          Select Your Preferences
        </label>
        <CheckboxGroup
          {...args}
          id='checkbox-group'
          aria-labelledby='group-label'
          value={selected}
          onValueChange={(val) => {
            args.onValueChange?.(val);
            setSelected(val);
          }}
        >
          <Checkbox
            label='Notifications'
            name='notifications'
            value='notifications'
          />
          <Checkbox
            label='Marketing Emails'
            name='marketing'
            value='marketing'
          />
          <Checkbox label='Weekly Digest' name='digest' value='digest' />
        </CheckboxGroup>
      </div>
    );
  },
};

export const DisabledOptions: Story = {
  render: function DisabledStory(args) {
    const [selected, setSelected] = useState<string[]>([]);

    return (
      <CheckboxGroup
        {...args}
        value={selected}
        onValueChange={(val) => {
          args.onValueChange?.(val);
          setSelected(val);
        }}
      >
        <Checkbox label='Enable A Feature' name='feature-a' value='feature-a' />
        <Checkbox
          label='Enable Another Feature'
          name='feature-b'
          value='feature-b'
        />
        <Checkbox
          label='Legacy Feature (deprecated)'
          name='legacy'
          value='legacy'
          disabled
        />
      </CheckboxGroup>
    );
  },
};

export const DisabledGroup: Story = {
  render: function DisabledStory(args) {
    const [selected, setSelected] = useState<string[]>(['option-1']);

    return (
      <CheckboxGroup
        {...args}
        disabled
        value={selected}
        onValueChange={(val) => {
          args.onValueChange?.(val);
          setSelected(val);
        }}
      >
        <Checkbox label='Option 1' name='option-1' value='option-1' />
        <Checkbox label='Option 2' name='option-2' value='option-2' />
        <Checkbox label='Option 3' name='option-3' value='option-3' />
      </CheckboxGroup>
    );
  },
  play: disabledGroupTests,
};
