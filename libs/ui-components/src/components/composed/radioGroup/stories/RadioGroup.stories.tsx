import { useState, useEffect, createRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { RadioGroup } from '../RadioGroup.jsx';
import {
  defaultTests,
  refForwardingTests,
  disabledTests,
  disabledGroupTests,
} from '../RadioGroup.test.js';

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  args: {
    options: [
      { value: 'value 1', label: 'Label 1', disabled: false },
      { value: 'value 2', label: 'Label 2', disabled: false },
    ],
    value: '',
    onValueChange: fn(),
    classes: { root: '', option: '', label: '', radio: '' },
  },
  argTypes: {
    value: {
      description: 'A `value` string from `options[] prop`',
    },
    options: {
      description:
        'Array of `OptionProps[]`. Each item shape: `{ value: string; label: string; disabled: bool }`',
    },
    classes: {
      description: 'For custom styling individual elements',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A list of Radio options, where only one option can be selected at a time. Note that this component does not ' +
          'handle any invalid or required states. For additional functionality, see the `RadioFieldSet` component.',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const firstOptionRef = createRef<HTMLSpanElement>();
const secondOptionRef = createRef<HTMLSpanElement>();

export const Default: Story = {
  render: function DefaultStory(args) {
    const refsArr = [firstOptionRef, secondOptionRef];
    const optionsWithRef = args.options.map((opt, i) => ({
      ...opt,
      ref: refsArr[i],
    }));
    const [selected, setSelected] = useState('');
    // Allow users to also update the value in the Storybook control panel for this primary example
    useEffect(() => setSelected(args.value ?? ''), [args.value]);

    return (
      <RadioGroup
        {...args}
        options={optionsWithRef}
        value={selected}
        onValueChange={(val) => {
          if (args.onValueChange) {
            args.onValueChange(val);
          }
          setSelected(val);
        }}
      />
    );
  },
  play: async (ctx) => {
    await defaultTests(ctx);
    await refForwardingTests({
      first: firstOptionRef,
      second: secondOptionRef,
    })(ctx);
  },
};

export const WithGroupLabel: Story = {
  render: function LabelledStory(args) {
    const [selected, setSelected] = useState('');
    return (
      <>
        <p id='group-label' className='type-ui-lead my-200'>
          Review These Options
        </p>
        <RadioGroup
          {...args}
          aria-labelledby='group-label'
          value={selected}
          onValueChange={(val) => {
            if (args.onValueChange) {
              args.onValueChange(val);
            }
            setSelected(val);
          }}
        />
      </>
    );
  },
};

export const DisabledOptions: Story = {
  args: {
    options: [
      { value: 'value 1', label: 'Select Me' },
      { value: 'value 2', label: 'Or Me' },
      { value: 'value 3', label: "Can't touch this", disabled: true },
      { value: 'value 4', label: 'Not this either', disabled: true },
    ],
  },
  render: function DisabledStory(args) {
    const [selected, setSelected] = useState('');
    return (
      <RadioGroup
        {...args}
        value={selected}
        onValueChange={(val) => {
          if (args.onValueChange) {
            args.onValueChange(val);
          }
          setSelected(val);
        }}
      />
    );
  },
  play: disabledTests,
};

export const DisabledGroup: Story = {
  render: function DisabledStory(args) {
    const [selected, setSelected] = useState('2');
    return (
      <RadioGroup
        {...args}
        disabled
        value={selected}
        onValueChange={(val) => setSelected(val)}
      />
    );
  },
  play: disabledGroupTests,
};
