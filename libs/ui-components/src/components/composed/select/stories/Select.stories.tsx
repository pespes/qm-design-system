import React, { useState, createRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Select } from '../Select.js';
import {
  defaultTests,
  disabledTests,
  disabledOpenTests,
  invalidTests,
  groupedTests,
  disabledOptionTests,
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
  play: defaultTests,
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
  play: groupedTests,
};
