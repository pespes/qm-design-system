import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from '../Label.js';
import { defaultTests, emphasisTests } from '../Label.test.js';
import {
  RadioGroupItem,
  RadioGroup,
} from '@/components/primitives/radio/radio-group.js';

const meta = {
  title: 'Components/Label',
  component: Label,
  args: {
    children: 'Label',
    type: 'default',
    htmlFor: 'form-el-id',
  },
  parameters: {
    docs: {
      description: {
        component: 'A label element accompanying a form control element.',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: defaultTests,
};

export const Emphasis: Story = {
  args: {
    type: 'emphasis',
  },
  play: emphasisTests,
};

export const DisabledBySibling: Story = {
  render: (args) => (
    <div className='flex items-center gap-200'>
      <RadioGroupItem value='option1' id='disabled-radio' disabled />
      <Label {...args} htmlFor='disabled-radio' />
    </div>
  ),
};

export const DisabledByParent: Story = {
  render: (args) => (
    <RadioGroup className='flex items-center gap-200' disabled>
      <RadioGroupItem value='option2' id='disabled-parent' />
      <Label {...args} htmlFor='disabled-parent' />
    </RadioGroup>
  ),
};
