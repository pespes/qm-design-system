/// <reference types="vite/client" />
import { createRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Avatar } from '../Avatar.js';
import { AVATAR_SIZE_TYPES } from '../Avatar.types.js';
import {
  defaultTests,
  fallbackTests,
  brokenImageTests,
  sizeTests,
} from '../Avatar.test.js';

// AI-generated portrait (not a real person), bundled locally so stories and tests never depend on the network
import samplePhoto from './assets/sample-avatar.jpg';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  args: {
    alt: 'Wendy Wells',
    fallback: 'WW',
    src: samplePhoto,
    size: 'md',
    onLoadingStatusChange: fn(),
    classes: { root: '', image: '', fallback: '' },
  },
  argTypes: {
    alt: {
      description:
        'Name of the person or entity. Used as the image alt text and the fallback accessible name',
    },
    src: {
      description:
        'Image URL. When omitted or the image fails to load, the fallback is shown',
      control: { type: 'text' },
    },
    fallback: {
      description: 'Initials shown when there is no image (1–2 characters)',
    },
    size: {
      control: { type: 'select' },
      options: AVATAR_SIZE_TYPES,
    },
    onLoadingStatusChange: {
      description:
        'Called when the image loading status changes: idle, loading, loaded or error',
    },
    classes: {
      description: 'For custom styling of individual elements',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Displays a user's profile photo, falling back to their initials when no photo is available.",
      },
    },
  },
  async afterEach(context) {
    console.log(`✅ Tested ${context.name} story`);
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: defaultTests,
};

const fallbackRef = createRef<HTMLSpanElement>();
export const Fallback: Story = {
  args: {
    src: undefined,
    ref: fallbackRef,
  },
  play: fallbackTests(fallbackRef),
};

export const BrokenImage: Story = {
  args: {
    // An invalid image triggers the error state without a network request
    src: 'data:image/png;base64,invalid',
  },
  play: brokenImageTests,
};

export const AllSizes: Story = {
  render: function AllSizesStory(args) {
    return (
      <div className='flex flex-col gap-400'>
        <div className='flex items-center gap-400'>
          {AVATAR_SIZE_TYPES.map((size) => (
            <Avatar key={size} {...args} size={size} />
          ))}
        </div>
        <div className='flex items-center gap-400'>
          {AVATAR_SIZE_TYPES.map((size) => (
            <Avatar key={size} {...args} src={undefined} size={size} />
          ))}
        </div>
      </div>
    );
  },
  play: sizeTests,
};
