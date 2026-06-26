import type { StoryContext } from '@storybook/react';
import { expect, within, userEvent } from 'storybook/test';
import type { CheckboxGroupProps } from './CheckboxGroup.types.js';

type CheckboxGroupContext = StoryContext<CheckboxGroupProps>;

export const defaultTests = async ({
  args,
  canvasElement,
  step,
}: CheckboxGroupContext) => {
  const canvas = within(canvasElement);
  const checkboxGroup = canvas.getAllByRole('group')[0];
  const checkboxes = canvas.getAllByRole('checkbox');

  await step('Renders checkboxes within an element with role="group', () => {
    if (!checkboxGroup) throw new Error('no checkbox group found');
    expect(within(checkboxGroup).getAllByRole('checkbox').length).toBe(3);
  });

  await step(
    'Multiple Checkboxes can be selected, and updates CheckboxGroup selected state',
    async () => {
      const firstCheckbox = checkboxes[0];
      const secondCheckbox = checkboxes[1];

      if (!firstCheckbox || !secondCheckbox)
        throw new Error('No checkbox found');

      await userEvent.click(firstCheckbox);
      expect(args.onValueChange).toHaveBeenNthCalledWith(1, ['option-1']);
      await userEvent.click(secondCheckbox);
      expect(args.onValueChange).toHaveBeenNthCalledWith(2, [
        'option-1',
        'option-2',
      ]);
      await userEvent.click(secondCheckbox);
      expect(args.onValueChange).toHaveBeenNthCalledWith(3, ['option-1']);
    },
  );
};

export const disabledGroupTests = async ({
  args,
  canvasElement,
  step,
}: CheckboxGroupContext) => {
  const canvas = within(canvasElement);
  const checkboxGroup = canvas.getAllByRole('group')[0];
  const checkboxes = canvas.getAllByRole('checkbox');

  await step(
    'Passing disabled prop to checkboxGroup disables children & sets data-disabled on group',
    async () => {
      checkboxes.forEach((check) =>
        expect(check).toHaveAttribute('aria-disabled', 'true'),
      );
      expect(checkboxGroup).toHaveAttribute('data-disabled');
    },
  );

  await step(
    'Clicking disabled checkbox does not trigger selection',
    async () => {
      const disabledCheckbox = checkboxes[0];
      if (!disabledCheckbox) throw new Error('no checkbox found');
      await userEvent.click(disabledCheckbox);
      expect(args.onValueChange).not.toHaveBeenCalled();
    },
  );
};
