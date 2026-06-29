import type { StoryContext } from '@storybook/react';
import { expect, within, userEvent } from 'storybook/test';
import type { CheckboxFieldProps } from './CheckboxField.types.js';

type CheckboxFieldPlayContext = StoryContext<CheckboxFieldProps>;

// --- Default CheckboxField Tests ---
export const defaultTests = async ({
  args,
  canvasElement,
  step,
}: CheckboxFieldPlayContext) => {
  const canvas = within(canvasElement);
  // Encompassing fieldset has role=group as well as the CheckboxGroup
  const checkboxGroup = canvas.getAllByRole('group')[1];
  const checkboxes = canvas.getAllByRole('checkbox');

  await step('Legend correctly labels the checkbox group', () => {
    const label = args.label as string;
    const legend = canvas.getByText(label);
    expect(legend.tagName).toBe('LEGEND');
    expect(checkboxGroup).toHaveAccessibleName(label);
  });

  await step(
    'Multiple checkboxes can be selected / deselected independently',
    async () => {
      const firstCheckbox = checkboxes[0];
      const secondCheckbox = checkboxes[1];

      expect(firstCheckbox).not.toBeChecked();
      if (!firstCheckbox) throw new Error('first checkbox not found');
      await userEvent.click(firstCheckbox);
      expect(firstCheckbox).toBeChecked();
      expect(args.onValueChange).toHaveBeenNthCalledWith(1, ['option-1']);

      if (!secondCheckbox) throw new Error('second checkbox not found');
      await userEvent.click(secondCheckbox);
      expect(secondCheckbox).toBeChecked();
      expect(args.onValueChange).toHaveBeenNthCalledWith(2, [
        'option-1',
        'option-2',
      ]);

      await userEvent.click(secondCheckbox);
      expect(secondCheckbox).not.toBeChecked();
      expect(args.onValueChange).toHaveBeenNthCalledWith(3, ['option-1']);
    },
  );
};

// --- Description CheckboxField Tests ---
export const descriptionTests = async ({
  args,
  canvasElement,
  step,
}: CheckboxFieldPlayContext) => {
  const canvas = within(canvasElement);
  const fieldSet = canvas.getAllByRole('group')[1];

  await step('Description correctly describes the checkbox group', () => {
    const descriptionText = args?.description as string;
    expect(canvas.getByText(descriptionText)).toBeInTheDocument();
    expect(descriptionText).toBe('Select you notification methods.');
    expect(fieldSet).toHaveAccessibleDescription(descriptionText);
  });
};

// --- Disabled CheckboxField Tests ---
export const disabledTests = async ({
  args,
  canvasElement,
  step,
}: CheckboxFieldPlayContext) => {
  const canvas = within(canvasElement);
  const fieldSet = canvas.getAllByRole('group')[0];
  const checkboxes = canvas.getAllByRole('checkbox');

  await step(
    'Assigns data-disabled to FieldSet and disables all checkboxes',
    () => {
      expect(fieldSet).toHaveAttribute('data-disabled', 'true');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toHaveAttribute('aria-disabled', 'true');
      });
    },
  );

  await step('Disabled checkboxes cannot be selected', async () => {
    const firstCheckbox = checkboxes[0];
    if (!firstCheckbox) throw new Error('no checkbox found');
    expect(firstCheckbox).not.toBeChecked();
    await userEvent.click(firstCheckbox);
    expect(args.onValueChange).not.toHaveBeenCalled();
    expect(firstCheckbox).not.toBeChecked();
  });
};

// --- Invalid and Required CheckboxField Tests ---
export const invalidTests = async ({
  args,
  canvasElement,
  step,
}: CheckboxFieldPlayContext) => {
  const canvas = within(canvasElement);
  const groups = canvas.getAllByRole('group');
  const fieldSet = groups[0];
  const checkboxGroup = groups[1];
  const checkboxes = canvas.getAllByRole('checkbox');

  await step(
    'Passes aria-invalid to checkboxes and assigns data-invalid to FieldSet',
    () => {
      expect(fieldSet).toHaveAttribute('data-invalid', 'true');
      expect(checkboxGroup).not.toHaveAttribute('data-invalid');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toHaveAttribute('aria-invalid', 'true');
      });
    },
  );

  await step(
    'All errors renders and describes the checkboxGroup alongside description',
    () => {
      const description = args.description as string;
      const errors = args.error as Array<{ message: string }>;
      if (!errors[0] || !errors[1]) {
        throw new Error('multiple errors not provided');
      }
      const firstErrorMessage = errors[0].message;
      const secondErrorMessage = errors[1].message;

      expect(firstErrorMessage).toBe('Please make a selection');
      expect(secondErrorMessage).toBe('Another error!');

      expect(canvas.getByText(firstErrorMessage)).toBeInTheDocument();
      expect(canvas.getByText(secondErrorMessage)).toBeInTheDocument();
      expect(checkboxGroup).toHaveAccessibleDescription(
        `${description} ${firstErrorMessage} ${secondErrorMessage}`,
      );
    },
  );
};
