import type { StoryContext } from '@storybook/react';
import { expect, within, userEvent, waitFor } from 'storybook/test';
import type { RefObject } from 'react';
import type { CheckboxProps } from './Checkbox.types.js';

type CheckboxContext = StoryContext<CheckboxProps>;

// ---  Default Checkbox Tests ---
export const defaultTests = async ({
  args,
  canvasElement,
  step,
}: CheckboxContext) => {
  const canvas = within(canvasElement);

  await step('Renders a checkbox with connected label', async () => {
    const checkbox = canvas.getByRole('checkbox');
    const label = canvas.getByText(args.label);

    expect(checkbox).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(checkbox).toHaveAccessibleName(args.label);
  });

  await step('Clicking Checkbox triggers selection', async () => {
    const checkbox = canvas.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);
    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
    expect(args.onCheckedChange).toHaveBeenCalledTimes(1);

    // state does not reset in between steps in single canvas - so uncheck checkbox for next test
    await userEvent.click(checkbox);
  });

  await step('Clicking Checkbox label triggers selection', async () => {
    const checkbox = canvas.getByRole('checkbox');
    const label = canvas.getByText(args.label);
    expect(checkbox).not.toBeChecked();

    await userEvent.click(label);
    expect(checkbox).toBeChecked();
    expect(args.onCheckedChange).toHaveBeenCalledTimes(3); // including previous test
  });
};

// --- Checkbox with Description Tests ---
export const descriptionTests = async ({
  args,
  canvasElement,
  step,
}: CheckboxContext) => {
  const canvas = within(canvasElement);
  await step(
    'Render a description if provided, connected to checkbox',
    async () => {
      const descriptionText = args.description as string;
      const checkbox = canvas.getByRole('checkbox');
      expect(checkbox).toHaveAccessibleDescription(descriptionText);
      expect(canvas.getByText(descriptionText)).toBeInTheDocument();
      expect(descriptionText).toBe('This is an awesome feature');
    },
  );
};

// ---  Disabled Checkbox Tests ---
export const disabledTests = async ({
  args,
  canvasElement,
  step,
}: CheckboxContext) => {
  const canvas = within(canvasElement);
  await step(
    'disabled property sets aria-disabled on the Checkbox',
    async () => {
      const checkbox = canvas.getAllByRole('checkbox')[0];
      expect(checkbox).toHaveAttribute('aria-disabled', 'true');
      expect(checkbox).toHaveAttribute('data-disabled');
      expect(checkbox).not.toBeDisabled();
    },
  );

  await step(
    'Clicking disabled checkbox does not trigger selection',
    async () => {
      const checkbox = canvas.getAllByRole('checkbox')[0];
      expect(checkbox).not.toBeChecked();

      if (!checkbox) throw new Error('Checkbox not found');
      await userEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
      expect(args.onCheckedChange).not.toHaveBeenCalled();
    },
  );

  await step(
    'Clicking disabled checkbox label does not trigger selection',
    async () => {
      const checkbox = canvas.getAllByRole('checkbox')[0];
      const label = canvas.getByText('Try and Select Me');
      expect(checkbox).not.toBeChecked();

      if (!checkbox) throw new Error('Checkbox not found');
      await userEvent.click(label);
      expect(checkbox).not.toBeChecked();
      expect(args.onCheckedChange).not.toHaveBeenCalled();
    },
  );
};

// ---  Invalid & Ref Forwarding Checkbox Tests ---
export const invalidTests = async ({
  args,
  canvasElement,
  step,
}: CheckboxContext) => {
  const canvas = within(canvasElement);
  await step(
    'Correctly passes the aria-invalid state to the checkbox',
    async () => {
      const checkbox = canvas.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    },
  );

  await step('test', async () => {
    const ref = args.ref as RefObject<HTMLSpanElement>;
    const checkbox = ref.current;
    expect(checkbox).toHaveAttribute('role', 'checkbox');
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(checkbox).toHaveFocus();
  });
};
