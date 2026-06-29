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
