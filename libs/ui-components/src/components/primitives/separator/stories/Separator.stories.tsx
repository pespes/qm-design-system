import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SeparatorProps } from '../Separator.types.js';
import { Separator } from '../Separator.jsx';
import { verticalTests, defaultTests } from '../Separator.test.js';
import { Button } from '@/components/primitives/button/Button.jsx';

const meta = {
  title: 'Components/Separator',
  component: Separator,
  args: {
    orientation: 'horizontal',
    spacing: 'none',
  },
  argTypes: {
    orientation: {
      options: ['horizontal', 'vertical'],
      control: { type: 'radio' },
    },
    spacing: {
      options: ['none', 'sm', 'md'],
      control: { type: 'radio' },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'An element that serves as a visual and accessible divider between sections of content or groups of menu items.',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args: SeparatorProps) => (
    <div className='h-1200 flex items-center'>
      <Separator {...args} />
    </div>
  ),
  play: defaultTests,
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args: SeparatorProps) => (
    <div className='h-1800'>
      <Separator {...args} />
    </div>
  ),
  play: verticalTests,
};

export const HorizontalOrientation: Story = {
  args: {
    spacing: 'sm',
  },
  render: (args: SeparatorProps) => (
    <div className='w-2800 flex flex-col items-center'>
      <Button data-testid='layout-button-1'>Click Me</Button>
      <Separator {...args} />
      <Button data-testid='layout-button-2' variant='outline'>
        Click Me
      </Button>
      <Separator {...args} />
      <Button data-testid='layout-button-2' variant='brand'>
        Or Me
      </Button>
    </div>
  ),
};

export const VerticalOrientation: Story = {
  args: {
    orientation: 'vertical',
    spacing: 'md',
  },
  render: (args: SeparatorProps) => (
    <div className='flex items-center'>
      <Button data-testid='layout-button-1'>Click Me</Button>
      <Separator {...args} />
      <Button data-testid='layout-button-2' variant='outline'>
        Click Me
      </Button>
      <Separator {...args} />
      <Button data-testid='layout-button-2' variant='brand'>
        Or Me
      </Button>
    </div>
  ),
};
