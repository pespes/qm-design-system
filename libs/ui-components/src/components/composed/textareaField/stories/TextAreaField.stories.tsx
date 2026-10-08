import React, { useState, createRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { TextAreaField } from '../TextAreaField.js';
import {
  defaultTests,
  disabledTests,
  generatedIdTests,
  descriptionTest,
  invalidTests,
  requiredTests,
} from '../TextAreaField.test.js';

const meta = {
  title: 'Components/TextAreaField',
  component: TextAreaField,
  args: {
    label: 'I am a Label',
    value: '',
    onChange: fn(),
    placeholder: 'This is a placeholder...',
    classes: {
      root: '',
      label: '',
      errorText: '',
      descriptionText: '',
      textarea: '',
      counter: '',
      content: '',
    },
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
    id: {
      description:
        'An id that connects label with native textarea, also passed as data-testid',
      type: 'string',
    },
    description: {
      description: 'The description for the textarea',
      type: 'string',
    },
    error: {
      description: 'The error for the textarea',
      type: 'string',
    },
    required: {
      description: 'Whether the field is required',
      type: 'boolean',
    },
    rows: {
      description:
        "Number of visible lines for textarea and locks in textarea's height. Must be positive number",
      control: { type: 'number' },
    },
    autoFocus: {
      description: 'If true, the textarea element is focused on first mount',
      type: 'boolean',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The TextArea component combined with a label, error and description to create an accessible form field. For more information on the TextArea' +
          ' component itself, visit the [TextArea Page](?path=/docs/components-textarea--docs)',
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
    id: 'default-textarea-group',
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
        data-testid={args.id}
        onChange={handleChange}
        value={value}
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

export const WithCounter: Story = {
  args: {
    id: undefined,
    description: 'Provide feedback, just not too much...',
    maxLength: 50,
    maxLengthSRFunc: () => 'Max length reached',
  },
  render: function MaxLength(args) {
    const [value, setValue] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      args.onChange?.(e);
      setValue(e.target.value);
    };
    return (
      <TextAreaField
        {...args}
        data-testid='generated-id-textarea-group'
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
        data-testid='disabled-textarea-group'
        onChange={handleChange}
        value={value}
      />
    );
  },
  play: disabledTests,
};

export const WithDescription: Story = {
  args: {
    description: 'Please provide detailed feedback',
  },
  render: function WithDescriptionStory(args) {
    const [value, setValue] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      args.onChange?.(e);
      setValue(e.target.value);
    };
    return (
      <TextAreaField
        {...args}
        data-testid='with-description-textarea-group'
        onChange={handleChange}
        value={value}
      />
    );
  },
  play: descriptionTest,
};

export const Invalid: Story = {
  args: {
    label: 'Feedback',
    error: [
      { message: 'This field is required' },
      { message: 'Second error will appear as well' },
    ],
    description: 'Help us improve our service',
    ref: textareaRef,
  },
  render: function InvalidStory(args) {
    const [value, setValue] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      args.onChange?.(e);
      setValue(e.target.value);
    };
    return (
      <TextAreaField
        {...args}
        data-testid='invalid-textarea-group'
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
  },
  render: function RequiredStory(args) {
    const [value, setValue] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      args.onChange?.(e);
      setValue(e.target.value);
    };
    return (
      <TextAreaField
        {...args}
        data-testid='required-textarea-group'
        onChange={handleChange}
        value={value}
      />
    );
  },
  play: requiredTests,
};
