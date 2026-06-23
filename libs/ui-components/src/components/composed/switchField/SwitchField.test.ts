import type { RefObject } from 'react';
import type { StoryContext } from '@storybook/react';
import { expect, within, userEvent } from 'storybook/test';
import type { SwitchFieldProps } from './SwitchField.types.js';

type SwitchFieldPlayContext = StoryContext<SwitchFieldProps>;

// --- Default SwitchField Test (id provided by dev) ---
export const defaultTests = async ({
  args,
  canvasElement,
  step,
}: SwitchFieldPlayContext) => {
  const canvas = within(canvasElement);
  const label = canvas.getByText('A Switch Label');
  const switchEl = canvas.getByRole('switch');

  await step('Label correctly connects to switch via provided id', () => {
    expect(label).toHaveAttribute('for', args.id);
    expect(switchEl).toHaveAccessibleName(args.label);
  });

  await step(
    'Label focuses switch and calls onCheckedChange when clicked',
    async () => {
      expect(switchEl).not.toHaveFocus();
      expect(args.onCheckedChange).not.toHaveBeenCalled();
      await userEvent.click(label);
      expect(switchEl).toHaveFocus();
      expect(args.onCheckedChange).toHaveBeenCalledTimes(1);
    },
  );

  await step('Correctly passes the ref through to the switch', async () => {
    const ref = args.ref as RefObject<HTMLSpanElement>;
    const switchElement = ref.current;
    //element is checked and has focus from previous test
    expect(switchElement).toBeChecked();
    expect(switchElement.tagName).toBe('SPAN');
    expect(switchElement).toHaveAttribute('role', 'switch');
    await userEvent.click(switchElement);
    expect(switchElement).not.toBeChecked();
    expect(args.onCheckedChange).toHaveBeenCalledTimes(2);
  });
};

// --- Description SwitchField Test ---
export const descriptionTests = async ({
  args,
  canvasElement,
  step,
}: SwitchFieldPlayContext) => {
  const canvas = within(canvasElement);

  await step('Description correctly describes the switch', () => {
    const descriptionText = args?.description as string;
    expect(canvas.getByText(descriptionText)).toBeInTheDocument();
    const switchEl = canvas.getByRole('switch');
    expect(switchEl).toHaveAccessibleDescription(descriptionText);
  });
};
