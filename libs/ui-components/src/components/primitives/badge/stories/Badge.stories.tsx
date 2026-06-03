import { createRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InfoIcon, LockIcon } from 'lucide-react';
import { BADGE_VARIANT_TYPES } from '../Badge.types';
import { Badge } from '../Badge.js';
import {
  defaultTests,
  variantTests,
  iconTests,
  polymorphicTests,
} from '../Badge.test.js';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: {
    children: 'Badge',
    variant: 'base',
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
          'A compact, inline indicator used to categorize, tag or classify content.',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
  play: defaultTests,
};

export const AllVariants: Story = {
  render: function VariantStory(args) {
    return (
      <div className='flex flex-wrap gap-400'>
        {BADGE_VARIANT_TYPES.map((type) => (
          <Badge
            key={type}
            {...args}
            data-testid={`badge-${type}`}
            variant={type}
          >
            {type} badge
          </Badge>
        ))}
      </div>
    );
  },
  play: variantTests,
};

export const WithIcon: Story = {
  render: (args) => (
    <div>
      <Badge
        data-testid='badge-icon-left'
        {...args}
        variant='outline'
        icon={{ position: 'left', component: <InfoIcon /> }}
        classes={{ root: 'mr-200' }}
      >
        First Badge
      </Badge>
      <Badge
        data-testid='badge-icon-right'
        {...args}
        variant='secondary'
        icon={{ position: 'right', component: <InfoIcon /> }}
      >
        Last Badge
      </Badge>
    </div>
  ),
  play: iconTests,
};

const badgeRef = createRef<HTMLDivElement>();
export const AsADiv: Story = {
  args: {
    children: 'A Div Badge',
    render: <div />,
    ref: badgeRef,
  },
  play: polymorphicTests,
};
