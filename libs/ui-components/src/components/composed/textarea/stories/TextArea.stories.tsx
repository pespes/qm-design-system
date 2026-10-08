import { useState, useEffect, createRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import {
  autoGrowTests,
  defaultTests,
  disabledTests,
  fixedSizeTests,
  invalidTests,
  maxLengthTests,
} from '../TextArea.test.js';
import { TextArea } from '../TextArea.js';
import { Label } from '@/components/primitives/label/Label.js';

const meta = {
  title: 'Components/Textarea',
  component: TextArea,
  args: {
    placeholder: '...start typing to clear',
    value: '',
    onChange: fn(),
    classes: { root: '', content: '', counter: '' },
  },
  argTypes: {
    value: {
      control: { disable: true },
    },
    maxLength: {
      description: 'The maximum characters allowed in a textarea.',
      type: 'number',
      control: {
        // This needs to be paired with the maxLengthSrFunc. If dev adjusts maxLength number, it will break because the func is not provided.
        // Example provided instead for clarity
        disable: true,
      },
    },
    maxLengthSRFunc: {
      description:
        'The translate fn producing a string the screen reader announces when maxLength is reached. Only to be used with `maxLength` prop',
    },
    rows: {
      description:
        "Number of visible lines for textarea and locks in textarea's height. Must be positive number",
      control: { type: 'number' },
    },
    testId: {
      description: "An id to pass to the textarea's data-testid attribute",
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
          'A basic textarea component that allows for a multi-line plain-text value. The component scales to fit content to allow users to enter a sizeable amount of text, with a minumum height set.',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    testId: 'default-textarea',
  },
  render: function DefaultStory(args) {
    const [value, setValue] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      args.onChange?.(e);
      setValue(e.target.value);
    };
    return (
      <TextArea
        {...args}
        testId={args.testId}
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

export const WithLabel: Story = {
  render: function LabelledStory(args) {
    const [value, setValue] = useState('');
    return (
      <div>
        <Label htmlFor='labelled-textarea'>I am a Label</Label>
        <TextArea
          {...args}
          testId='labelled-textarea'
          id='labelled-textarea'
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
      </div>
    );
  },
};

export const WithMaxLength: Story = {
  args: {
    testId: 'default-textarea',
    maxLength: 30,
    maxLengthSRFunc: fn(() => 'You have reached your character limit'),
  },
  render: function DefaultStory(args) {
    const [value, setValue] = useState('');
    return (
      <div>
        <Label htmlFor='maxlength-textarea'>Add Only 30 Characters</Label>
        <TextArea
          {...args}
          id='maxlength-textarea'
          testId={args.testId}
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
      </div>
    );
  },
};

// Hidden from the sidebar and docs (still run by Vitest) so browsing to WithMaxLength doesn't auto-play the test
export const WithMaxLengthTest: Story = {
  ...WithMaxLength,
  tags: ['!dev', '!autodocs'],
  play: maxLengthTests,
};

export const Disabled: Story = {
  args: {
    disabled: true,
    testId: 'disabled-textarea',
  },
  render: function DisabledStory(args) {
    const [value, setValue] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      args.onChange?.(e);
      setValue(e.target.value);
    };
    return (
      <TextArea
        {...args}
        testId={args.testId}
        onChange={handleChange}
        value={value}
      />
    );
  },
  play: disabledTests,
};

const textareaRef = createRef<HTMLTextAreaElement>();
export const Invalid: Story = {
  args: {
    'aria-invalid': true,
    ref: textareaRef,
  },
  render: function InvalidStory(args) {
    const [value, setValue] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      args.onChange?.(e);
      setValue(e.target.value);
    };
    return (
      <TextArea
        {...args}
        testId={undefined}
        onChange={handleChange}
        value={value}
      />
    );
  },
  play: invalidTests,
};

export const FixedSize: Story = {
  args: {
    rows: 5,
  },
  render: function FixedStory(args) {
    const [largeValue, setLargeValue] = useState(args.value ?? '');
    const [smallValue, setSmallValue] = useState('');
    useEffect(() => setLargeValue(args.value ?? ''), [args.value]);
    const handleLargeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      args.onChange?.(e);
      setLargeValue(e.target.value);
    };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <TextArea
          {...args}
          testId='fixed-textarea-large'
          placeholder='...rows=5, I should be taller than 68px minimum'
          onChange={handleLargeChange}
          value={largeValue}
        />
        <TextArea
          testId='fixed-textarea-min'
          rows={1}
          placeholder='...rows=1 should still render at the 68px minimum'
          value={smallValue}
          onChange={(e) => setSmallValue(e.target.value)}
        />
      </div>
    );
  },
  play: fixedSizeTests,
};

export const AutoGrow: Story = {
  render: function AutoGrowStory(args) {
    const [value, setValue] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      args.onChange?.(e);
      setValue(e.target.value);
    };
    return (
      <div style={{ width: 240 }}>
        <TextArea
          {...args}
          testId='auto-grow-textarea'
          placeholder='This textarea has a fixed width to test textarea scales.'
          onChange={handleChange}
          value={value}
        />
      </div>
    );
  },
};

// Hidden from the sidebar and docs (still run by Vitest) so browsing to AutoGrow doesn't auto-play the test
export const AutoGrowTest: Story = {
  ...AutoGrow,
  tags: ['!dev', '!autodocs'],
  play: autoGrowTests,
};
