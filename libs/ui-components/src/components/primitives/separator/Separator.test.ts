import type { StoryContext } from '@storybook/react';
import { expect, within } from 'storybook/test';
import type { SeparatorProps } from './Separator.types.js';

type SeparatorPlayContext = StoryContext<SeparatorProps>;

// ---  Horizontal Separator Test ---
export const defaultTests = async ({
  canvasElement,
  step,
}: SeparatorPlayContext) => {
  const canvas = within(canvasElement);

  await step(
    'Separator renders element with aria-role"separator" and horizontal orientation by default',
    () => {
      const separator = canvas.getByRole('separator');
      expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    },
  );
};

// ---  Vertical Separator Test ---
export const verticalTests = async ({
  canvasElement,
  step,
}: SeparatorPlayContext) => {
  const canvas = within(canvasElement);

  await step(
    'Separator renders element with aria-role"separator" and horizontal orientation by default',
    () => {
      const separator = canvas.getByRole('separator');
      expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    },
  );
};
