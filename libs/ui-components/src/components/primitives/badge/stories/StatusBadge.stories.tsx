import { createRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InfoIcon, LockIcon } from 'lucide-react';
import { STATUS_VARIANT_TYPES } from '../Badge.types';
import { StatusBadge } from '../Badge.js';
import {
  defaultTests,
  statusVariantTests,
  iconTests,
  polymorphicTests,
} from '../Badge.test.js';

const meta = {
  title: 'Components/Badges/StatusBadge',
  component: StatusBadge,
  args: {
    children: 'Badge',
    variant: 'system',
    classes: { root: '', content: '', icon: '' },
  },
  argTypes: {
    children: {
      description: 'The string of text for label',
    },
    icon: {
      control: { type: 'select' },
      options: ['left', 'right', 'none'],
      mapping: {
        left: { position: 'left', component: <LockIcon /> },
        right: { position: 'right', component: <LockIcon /> },
        none: null,
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A compact, inline indicator that communicates the current state / condition of an item.',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const System: Story = {
  play: defaultTests,
};

export const AllVariants: Story = {
  render: function VariantStory(args) {
    return (
      <div className='flex flex-wrap gap-400'>
        {STATUS_VARIANT_TYPES.map((type) => (
          <StatusBadge
            key={type}
            data-testid={`badge-${type}`}
            {...args}
            variant={type}
          >
            {type} badge
          </StatusBadge>
        ))}
      </div>
    );
  },
  play: statusVariantTests,
};

export const WithIcon: Story = {
  render: (args) => (
    <div>
      <StatusBadge
        {...args}
        data-testid='badge-icon-left'
        variant='danger'
        icon={{ position: 'left', component: <InfoIcon /> }}
        classes={{ root: 'mr-200' }}
      >
        Error!
      </StatusBadge>
      <StatusBadge
        {...args}
        data-testid='badge-icon-right'
        variant='success'
        icon={{ position: 'right', component: <InfoIcon /> }}
      >
        Success!
      </StatusBadge>
    </div>
  ),
  play: iconTests,
};

const badgeRef = createRef<HTMLDivElement>();
export const AsADiv: Story = {
  args: {
    render: (props) => <div {...props} />,
    children: 'A Div Badge',
    ref: badgeRef,
  },
  play: polymorphicTests,
};
