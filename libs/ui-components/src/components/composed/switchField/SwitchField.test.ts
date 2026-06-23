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
};

// --- Generated id SwitchField Test (no id provided) ---
export const generatedIdTests = async ({
  args,
  canvasElement,
  step,
}: SwitchFieldPlayContext) => {
  const canvas = within(canvasElement);
  const switchEl = canvas.getByRole('switch');
  const label = canvas.getByText('A Switch Label');

  await step(
    'Label correctly associated with switch and calls onCheckedChange when clicked',
    async () => {
      expect(switchEl).not.toHaveFocus();
      expect(switchEl).not.toBeChecked();
      await userEvent.click(label);
      expect(switchEl).toHaveFocus();
      expect(switchEl).toBeChecked();
      expect(args.onCheckedChange).toHaveBeenCalledWith(true);
    },
  );
};

// --- Disabled SwitchField Test ---
export const disabledTests = async ({
  canvasElement,
  step,
}: SwitchFieldPlayContext) => {
  const canvas = within(canvasElement);
  const switchEl = canvas.getByRole('switch');
  const label = canvas.getByText('A Switch Label');

  await step('Assigns data-disabled to Field and disables switch', () => {
    const field = canvas.getByRole('group');
    expect(field).toHaveAttribute('data-disabled', 'true');
    expect(switchEl).toHaveAttribute('aria-disabled', 'true');
  });

  await step('Label does not toggle disabled switch when clicked', async () => {
    expect(switchEl).not.toBeChecked();
    await userEvent.click(label);
    expect(switchEl).not.toBeChecked();
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

  await step('Correctly passes the ref through to the switch', async () => {
    const ref = args.ref as RefObject<HTMLSpanElement>;
    const switchElement = ref.current;
    expect(switchElement).not.toBeChecked();
    expect(switchElement.tagName).toBe('SPAN');
    expect(switchElement).toHaveAttribute('role', 'switch');
    await userEvent.click(switchElement);
    expect(switchElement).toBeChecked();
    expect(args.onCheckedChange).toHaveBeenCalledTimes(1);
  });
};

// --- Invalid SwitchField Test ---
export const invalidTests = async ({
  args,
  canvasElement,
  step,
}: SwitchFieldPlayContext) => {
  const canvas = within(canvasElement);
  const switchEl = canvas.getByRole('switch');

  await step(
    'Only the first error message is rendered when multiple are provided',
    () => {
      const errors = args?.error as Array<{ message: string }>;
      if (!errors[0] || !errors[1]) {
        throw new Error('multiple errors not provided');
      }
      const firstErrorMessage = errors[0].message;
      const secondErrorMessage = errors[1].message;

      expect(canvas.getByText(firstErrorMessage)).toBeInTheDocument();
      expect(canvas.getByText(secondErrorMessage)).toBeInTheDocument();

      expect(switchEl).toHaveAccessibleDescription(
        `${args.description} ${firstErrorMessage} ${secondErrorMessage}`,
      );
    },
  );

  await step(
    'Passes aria-invalid and assigns data-invalid to Field',
    async () => {
      const field = canvas.getByRole('group');
      expect(field).toHaveAttribute('data-invalid', 'true');
      expect(switchEl).toHaveAttribute('aria-invalid', 'true');
    },
  );
};

// --- Required SwitchField Test ---
export const requiredTests = async ({
  canvasElement,
  step,
}: SwitchFieldPlayContext) => {
  const canvas = within(canvasElement);
  const switchEl = canvas.getByRole('switch');

  await step('Passes aria-required and assigns data-required to Field', () => {
    const field = canvas.getByRole('group');
    expect(field).toHaveAttribute('data-required', 'true');
    expect(switchEl).toHaveAttribute('aria-required', 'true');
  });
};
