import type { StoryContext } from '@storybook/react';
import { expect, within, userEvent } from 'storybook/test';
import type { RefObject } from 'react';
import type { SelectFieldProps } from './SelectField.types.js';

type SelectFieldPlayContext = StoryContext<SelectFieldProps>;

// --- Default SelectField Test ---
export const defaultTests = async ({
  args,
  canvasElement,
  step,
}: SelectFieldPlayContext) => {
  const canvas = within(canvasElement);
  const label = canvas.getByText('I am a Label');
  const trigger = canvas.getByRole('combobox');

  await step(
    'Select Trigger is correctly associated with label when id provided',
    () => {
      expect(trigger).toHaveAccessibleName(label.textContent);
    },
  );

  await step('Correctly passes the ref through to the trigger', async () => {
    await userEvent.click(document.body);
    const ref = args.ref as RefObject<HTMLButtonElement>;
    const button = ref.current;
    expect(button?.tagName).toBe('BUTTON');
  });

  await step('Trigger opens the select menu when clicked', async () => {
    expect(args.onOpenChange).not.toHaveBeenCalled();
    await userEvent.click(trigger);
    expect(args.onOpenChange).toHaveBeenCalledTimes(1);
  });
};

// --- Disabled SelectField Test ---
export const disabledTests = async ({
  args,
  canvasElement,
  step,
}: SelectFieldPlayContext) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('combobox');

  await step('Assigns data-disabled to Field and disables trigger', () => {
    const field = canvas.getAllByRole('group')[0];
    expect(field).toHaveAttribute('data-disabled', 'true');
    expect(trigger).toBeDisabled();
  });

  await step('Label does not focus disabled trigger when clicked', async () => {
    await userEvent.click(trigger);
    expect(args.onOpenChange).not.toHaveBeenCalled();
  });
};

export const descriptionTest = async ({
  args,
  canvasElement,
  step,
}: SelectFieldPlayContext) => {
  const canvas = within(canvasElement);

  await step('Description correctly describes the trigger', () => {
    const descriptionText = args?.description as string;
    expect(canvas.getByText(descriptionText)).toBeInTheDocument();
    const trigger = canvas.getByRole('combobox');
    expect(trigger).toHaveAccessibleDescription(descriptionText);
  });
};

export const invalidTests = async ({
  args,
  canvasElement,
  step,
}: SelectFieldPlayContext) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('combobox');

  await step('Renders all errors provided', () => {
    const errors = args?.error as string[];
    if (!errors[0] || !errors[1]) {
      throw new Error('multiple errors not provided');
    }
    const firstErrorMessage = errors[0];
    const secondErrorMessage = errors[1];

    expect(canvas.getByText(firstErrorMessage)).toBeInTheDocument();
    expect(canvas.queryByText(secondErrorMessage)).toBeInTheDocument();

    //Check that description and errors are all included in description
    expect(trigger).toHaveAccessibleDescription(
      `${args.description} ${firstErrorMessage} ${secondErrorMessage}`,
    );
  });

  await step(
    'Assigns data-invalid to Field and combobox is marked invalid',
    async () => {
      const field = canvas.getByRole('group');
      expect(field).toHaveAttribute('data-invalid', 'true');
      expect(trigger).toHaveAttribute('aria-invalid', 'true');
    },
  );
};

export const requiredTests = async ({
  canvasElement,
  step,
}: SelectFieldPlayContext) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('combobox');

  await step('Passes aria-required and assigns data-required to Field', () => {
    const field = canvas.getByRole('group');
    expect(field).toHaveAttribute('data-required', 'true');
    expect(trigger).toHaveAttribute('aria-required', 'true');
  });
};
