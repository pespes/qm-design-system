import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { MdInfoOutline, MdOutlineAdd } from 'react-icons/md';
import { Button } from '../Button.js';
import { VARIANT_TYPES, SIZE_TYPES, RADIUS_TYPES } from '../Button.types.js';
import {
  defaultTests,
  disabledTests,
  loadingTests,
  polymorphismTests,
} from '../Button.test.js';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { onClick: fn(), classes: { root: '', content: '', icon: '' } },
  argTypes: {
    icon: {
      control: { type: 'select' },
      options: ['left', 'right', 'none'],
      mapping: {
        left: { position: 'left', component: <MdOutlineAdd /> },
        right: { position: 'right', component: <MdOutlineAdd /> },
        none: null,
      },
    },
    loading: {
      control: { type: 'select' },
      options: ['loading', 'active'],
      mapping: {
        active: { title: 'Loading...', state: 'active' },
        loading: { title: 'Loading...', state: 'loading' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A flexible Button component built on top of Base UI, providing support for loading states, icon positioning, and polymorphism.',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'base',
    size: 'md',
    rounded: 'default',
    children: 'Click me',
    disabled: false,
  },
  render: (args) => <Button {...args} data-testid='btn-default' />,
  play: defaultTests,
};

export const Brand: Story = {
  args: {
    variant: 'brand',
    children: 'Choose Brand to Watch Me Change',
  },
  render: (args) => <Button {...args} data-testid='btn-brand' />,
};

export const Disabled: Story = {
  args: {
    children: 'Just try and Click Me',
    disabled: true,
    onClick: fn(),
  },
  render: (args) => (
    <div className='flex flex-wrap gap-400'>
      <Button data-testid='btn-loading-base' {...args}>
        {args.children}
      </Button>
      <Button data-testid='btn-loading-secondary' {...args} variant='secondary'>
        {args.children}
      </Button>
    </div>
  ),
  play: disabledTests,
};

export const AllVariants: Story = {
  render: () => {
    const VariantStory = () => {
      const [lastClicked, setLastClicked] = useState('');
      return (
        <>
          <div className='flex flex-wrap gap-400'>
            {VARIANT_TYPES.map((type, idx) => (
              <Button
                data-testid={`btn-${type}`}
                key={idx}
                variant={type}
                onClick={() => setLastClicked(type)}
              >
                {type}
              </Button>
            ))}
          </div>
          <p className='type-ui-caption'>Last Clicked: {lastClicked}</p>
        </>
      );
    };

    return <VariantStory />;
  },
};

export const AllSizes: Story = {
  render: () => {
    const SizeStory = () => {
      const [lastClicked, setLastClicked] = useState('');
      return (
        <>
          <div className='flex flex-wrap items-center gap-400'>
            {SIZE_TYPES.map((size, idx) => (
              <Button
                data-testid={`btn-${size}`}
                key={idx}
                size={size}
                onClick={() => setLastClicked(size)}
              >
                {size} Button
              </Button>
            ))}
          </div>
          <p className='type-ui-caption'>Last Clicked: {lastClicked}</p>
        </>
      );
    };

    return <SizeStory />;
  },
};

export const AllRadius: Story = {
  render: () => {
    const SizeStory = () => {
      const [lastClicked, setLastClicked] = useState('');
      return (
        <>
          <div className='flex flex-wrap gap-400'>
            {RADIUS_TYPES.map((radius, idx) => (
              <Button
                data-testid={`btn-${radius}-radius`}
                key={idx}
                rounded={radius}
                onClick={() => setLastClicked(radius)}
              >
                {radius} Button
              </Button>
            ))}
          </div>
          <p className='type-ui-caption m-200'>Last Clicked: {lastClicked}</p>
        </>
      );
    };

    return <SizeStory />;
  },
};

export const Loading: Story = {
  args: {
    children: 'Do Not Render',
    loading: { title: 'Already Loading', state: 'loading' },
  },
  render: (args) => {
    const LoadingStory = () => {
      const [isLoading, setIsLoading] = useState(false);
      const handleClick = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 800);
      };
      return (
        <div className='flex gap-400'>
          <Button data-testid='btn-loading' {...args} />
          <Button
            data-testid='btn-active'
            onClick={handleClick}
            loading={{
              title: 'Now Loading',
              state: isLoading ? 'loading' : 'active',
            }}
          >
            Click to Load
          </Button>
        </div>
      );
    };

    return <LoadingStory />;
  },
  play: loadingTests,
};

export const WithIcon: Story = {
  render: () => {
    const IconStory = () => {
      const [lastClicked, setLastClicked] = useState('');
      return (
        <>
          <div className='flex gap-400'>
            <Button
              variant='base'
              data-testid='btn-icon-left'
              icon={{
                position: 'left',
                component: <MdInfoOutline />,
              }}
              onClick={() => setLastClicked('Left Icon')}
            >
              Left Placement
            </Button>
            <Button
              variant='outline'
              data-testid='btn-icon-right'
              icon={{
                position: 'right',
                component: <MdInfoOutline />,
              }}
              onClick={() => setLastClicked('Right Icon')}
            >
              Right Placement
            </Button>
          </div>
          <p className='type-ui-caption'>Last Clicked: {lastClicked}</p>
        </>
      );
    };

    return <IconStory />;
  },
};

export const AsAnotherElement: Story = {
  render: (args) => {
    const PolyStory = () => {
      const [lastClicked, setLastClicked] = useState('');
      return (
        <>
          <div className='flex gap-400'>
            <Button
              data-testid='btn-render-el'
              render={<div />}
              {...args}
              onClick={(e) => {
                if (args.onClick) {
                  args.onClick(e);
                }
                setLastClicked('DIV');
              }}
            >
              div as Element
            </Button>
            <Button
              data-testid='btn-render-func'
              nativeButton={false}
              render={(props) => <span {...props} />}
              {...args}
              onClick={(e) => {
                if (args.onClick) {
                  args.onClick(e);
                }
                setLastClicked('SPAN');
              }}
            >
              span as Function
            </Button>
          </div>
          <p className='type-ui-caption'>Last Clicked: {lastClicked}</p>
        </>
      );
    };

    return <PolyStory />;
  },
  play: polymorphismTests,
};
