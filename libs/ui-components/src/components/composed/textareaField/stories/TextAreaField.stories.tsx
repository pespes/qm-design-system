import React, { useState, createRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { TextAreaField } from '../TextAreaField.js';
import {
  defaultTests,
  disabledTests,
  generatedIdTests,
} from '../TextAreaField.test.js';

const meta = {
  title: 'Components/TextAreaField',
  component: TextAreaField,
  args: {
    label: 'I am a Label',
    value: '',
    onChange: fn(),
    placeholder: 'This is a placeholder...',
    classes: { root: '', label: '', textarea: '' },
  },
  argTypes: {
    value: {
      control: { disabled: true },
    },
    disabled: {
      description: 'Whether the Textarea is disabled',
      type: 'boolean',
      control: { type: 'boolean' },
    },
    autoFocus: {
      description: 'If true, the textarea element is focused on first mount',
      type: 'boolean',
    },
    testId: {
      description:
        "An id to pass to the native textarea's data-testid attribute",
      type: 'string',
    },
    rows: {
      description:
        "Number of visible lines for textarea and locks in textarea's height. Must be positive number",
      control: { type: 'number' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A Textarea component combined with a label to create an accessible form field. For more information on the Textarea' +
          ' component itself, visit the [Textarea Page](?path=/docs/components-textarea--docs)',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof TextAreaField>;

export default meta;
type Story = StoryObj<typeof meta>;

const textareaRef = createRef<HTMLTextAreaElement>();
export const Default: Story = {
  args: {
    testId: 'default-textarea-group',
    ref: textareaRef,
    id: 'custom-id',
  },
  render: function DefaultStory(args) {
    const [value, setValue] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      args.onChange?.(e);
      setValue(e.target.value);
    };
    return (
      <TextAreaField
        {...args}
        testId={args.testId}
        onChange={handleChange}
        value={value}
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
    const [value, setValue] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      args.onChange?.(e);
      setValue(e.target.value);
    };
    return (
      <TextAreaField
        {...args}
        testId='generated-id-textarea-group'
        onChange={handleChange}
        value={value}
      />
    );
  },
  play: generatedIdTests,
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "You can't change me",
  },
  render: function DisabledStory(args) {
    const [value, setValue] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      args.onChange?.(e);
      setValue(e.target.value);
    };
    return (
      <TextAreaField
        {...args}
        testId='disabled-textarea-group'
        onChange={handleChange}
        value={value}
      />
    );
  },
  play: disabledTests,
};
