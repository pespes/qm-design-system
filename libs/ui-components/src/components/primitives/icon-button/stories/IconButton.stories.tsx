import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import {
  MdOutlineAdd,
  MdInfoOutline,
  MdOutlineEdit,
  MdOutlineDelete,
} from 'react-icons/md';
import { IconButton } from '../IconButton.js';
import { VARIANT_TYPES, SIZE_TYPES } from '../IconButton.types.js';
import {
  defaultTests,
  disabledTests,
  loadingTests,
  polymorphismTests,
} from '../IconButton.tests.js';

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  args: {
    label: 'An Icon Button',
    children: <MdInfoOutline />,
    classes: { root: '', icon: '' },
    onClick: fn(),
  },
  argTypes: {
    children: {
      table: {
        type: { summary: 'ReactElement' },
      },
      control: { type: 'select' },
      options: ['add', 'edit', 'delete', 'info'],
      mapping: {
        add: <MdOutlineAdd />,
        edit: <MdOutlineEdit />,
        delete: <MdOutlineDelete />,
        info: <MdInfoOutline />,
      },
    },
    loading: {
      control: { type: 'select' },
      options: ['loading', 'active'],
      mapping: {
        loading: { title: 'Now Loading', state: 'loading' },
        active: { title: 'Now Loading', state: 'active' },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A flexible icon-only Button component built on top of Base UI, providing support for loading states, and polymorphism.',
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <MdOutlineAdd />,
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: { title: 'loading', state: 'active' },
  },
  play: defaultTests,
};

export const Brand: Story = {
  args: {
    variant: 'brand',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <div className='flex flex-wrap gap-400'>
      <IconButton data-testid='btn-loading-primary' {...args} />
      <IconButton
        data-testid='btn-loading-secondary'
        variant='secondary'
        {...args}
      />
    </div>
  ),
  play: disabledTests,
};

export const AllVariants: Story = {
  render: (args) => {
    const VariantStory = () => {
      const [lastClicked, setLastClicked] = useState('');
      return (
        <>
          <div className='flex flex-wrap gap-400'>
            {VARIANT_TYPES.map((type, idx) => (
              <IconButton
                data-testid={`btn-${type}`}
                key={idx}
                {...args}
                variant={type}
                onClick={() => setLastClicked(type)}
              />
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
  render: (args) => {
    const SizeStory = () => {
      const [lastClicked, setLastClicked] = useState('');
      return (
        <>
          <div className='flex flex-wrap gap-1000 items-center'>
            {SIZE_TYPES.map((size, idx) => (
              <IconButton
                data-testid={`btn-${size}`}
                key={idx}
                {...args}
                size={size}
                onClick={() => setLastClicked(size)}
              />
            ))}
          </div>
          <p className='type-ui-caption'>Last Clicked: {lastClicked}</p>
        </>
      );
    };

    return <SizeStory />;
  },
};

export const Loading: Story = {
  render: (args) => {
    const LoadingStory = () => {
      const [isLoading, setIsLoading] = useState(false);
      const handleClick = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 800);
      };
      return (
        <div className='flex gap-400'>
          <IconButton
            data-testid='btn-loading'
            {...args}
            loading={{ title: 'Already Loading', state: 'loading' }}
          />
          <IconButton
            data-testid='btn-active'
            {...args}
            onClick={handleClick}
            loading={{
              title: 'Now Loading',
              state: isLoading ? 'loading' : 'active',
            }}
          />
        </div>
      );
    };

    return <LoadingStory />;
  },
  play: loadingTests,
};

export const AsAnotherElement: Story = {
  render: (args) => {
    const PolyStory = () => {
      const [lastClicked, setLastClicked] = useState('');
      return (
        <>
          <div className='flex gap-400'>
            <IconButton
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
              <MdOutlineAdd />
            </IconButton>
            <IconButton
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
              <MdInfoOutline />
            </IconButton>
          </div>
          <p className='type-ui-caption'>Last Clicked: {lastClicked}</p>
        </>
      );
    };

    return <PolyStory />;
  },
  play: polymorphismTests,
};
