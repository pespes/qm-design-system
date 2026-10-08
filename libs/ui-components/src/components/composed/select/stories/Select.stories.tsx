import React, { useState, createRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Select } from '../Select.js';
import {
  defaultTests,
  disabledTests,
  invalidTests,
  groupedTests,
  disabledItemsTests,
} from '../Select.test.js';

const meta = {
  title: 'Components/Select',
  component: Select,
  args: {
    onValueChange: fn(),
    value: null,
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
      trigger: '',
      triggerContent: '',
      overlay: '',
      groupLabel: '',
      item: '',
      scrollBtn: '',
      selectItemIcon: '',
    },
    disabled: false,
    onOpenChange: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'A component that renders a list of options for the user to choose a single option from, triggered by a button.',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    triggerTestId: 'test-select',
  },
  render: function DefaultStory(args) {
    const [selectedVal, setSelectedVal] = useState(args.value);
    return (
      <Select
        {...args}
        data-testid={args.triggerTestId}
        value={selectedVal}
        onValueChange={(val) => {
          args.onValueChange?.(val);
          setSelectedVal(val);
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

export const Disabled: Story = {
  args: {
    triggerTestId: 'disabled-select-closed',
    disabled: true,
    items: [
      { value: 'apple', label: 'Selected: Apple' },
      { value: 'pear', label: 'Selected: Pear' },
    ],
  },
  play: disabledTests,
};

export const DisabledItems: Story = {
  args: {
    items: [
      { value: 'apple', label: 'Selected: Apple' },
      { value: 'pear', label: 'Selected: Pear', disabled: true },
    ],
  },
  render: function DisabledItemsStory(args) {
    const [selectedVal, setSelectedVal] = useState(args.value);
    return (
      <Select
        {...args}
        data-testid='disabled-select-open'
        value={selectedVal}
        onValueChange={(val) => {
          args.onValueChange?.(val);
          setSelectedVal(val);
        }}
      />
    );
  },
};

// Hidden from the sidebar and docs (still run by Vitest) so browsing to DisabledItems doesn't auto-play the test
export const DisabledItemsTest: Story = {
  ...DisabledItems,
  tags: ['!dev', '!autodocs'],
  play: disabledItemsTests,
};

const inputRef = createRef<HTMLInputElement>();
const triggerRef = createRef<HTMLButtonElement>();
const itemRef = createRef<HTMLDivElement>();

export const Invalid: Story = {
  args: {
    triggerTestId: 'test-select',
    items: [
      { value: 'apple', label: 'Selected: Apple', ref: itemRef },
      { value: 'pear', label: 'Selected: Pear' },
    ],
    placeholder: 'wait for it...',
    error: true,
    id: 'select-trigger-id',
    inputRef,
    ref: triggerRef,
  },
  render: function InvalidStory(args) {
    const [selectedVal, setSelectedVal] = useState(args.value);
    return (
      <Select
        {...args}
        data-testid={args.triggerTestId}
        value={selectedVal}
        onValueChange={(val) => {
          args.onValueChange?.(val);
          setSelectedVal(val);
        }}
      />
    );
  },
};

// Hidden from the sidebar and docs (still run by Vitest) so browsing to Invalid doesn't auto-play the test
export const InvalidTest: Story = {
  ...Invalid,
  tags: ['!dev', '!autodocs'],
  play: invalidTests,
};

export const Grouped: Story = {
  args: {
    placeholder: 'select a fruit',
    triggerTestId: 'test--grouped-select',
    items: [
      {
        groupLabel: 'Citrus',
        items: [
          { value: 'kiwi', label: 'Kiwi' },
          { value: 'mango', label: 'Mango mango mango mango... MANGO NOW!!!!' },
        ],
      },
      {
        groupLabel: 'Berries',
        items: [
          { value: 'blueberry', label: 'Blueberry' },
          { value: 'raspberry', label: 'Raspberry' },
        ],
      },
      {
        groupLabel: 'Other',
        items: [
          { value: 'apple', label: 'Apple' },
          { value: 'banana', label: 'Banana' },
          { value: 'dragonfruit', label: 'Dragonfruit' },
          { value: 'pear', label: 'Pear' },
        ],
      },
    ],
  },
  render: function GroupedStory(args) {
    const [selectedVal, setSelectedVal] = useState(args.value);
    return (
      <Select
        {...args}
        data-testid={args.triggerTestId}
        value={selectedVal}
        onValueChange={(val) => {
          args.onValueChange?.(val);
          setSelectedVal(val);
        }}
      />
    );
  },
};

// Hidden from the sidebar and docs (still run by Vitest) so browsing to Grouped doesn't auto-play the test
export const GroupedTest: Story = {
  ...Grouped,
  tags: ['!dev', '!autodocs'],
  play: groupedTests,
};
