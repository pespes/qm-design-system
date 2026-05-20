import type { StoryContext } from '@storybook/react';
import { expect, within } from 'storybook/test';
import type { LabelProps } from './Label.types.js';

type LabelPlayContext = StoryContext<LabelProps>;

// Tests involving a user clicking the label to trigger the focus / selection of a form control element
// (when enabled / disabled) will be handled in relevant form control element tests

// ---  Default Label Test ---
export const defaultTests = async ({
  canvasElement,
  step,
}: LabelPlayContext) => {
  const canvas = within(canvasElement);

  await step('Label renders "default" type by default', () => {
    const label = canvas.getByText('Label');
    expect(label.classList).toContain('type-body-default');
  });
};

// ---  Emphasized Label Test ---
export const emphasisTests = async ({
  canvasElement,
  step,
}: LabelPlayContext) => {
  const canvas = within(canvasElement);

  await step('Label renders "emphasis" type when selected', () => {
    const label = canvas.getByText('Label');
    expect(label.classList).toContain('type-ui-default');
  });
};
