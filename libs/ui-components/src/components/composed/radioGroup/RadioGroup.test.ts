import type { StoryContext } from '@storybook/react';
import { expect, within, userEvent } from 'storybook/test';
import type { RefObject } from 'react';
import type { RadioGroupProps } from './RadioGroup.types.js';

type RadioGroupContext = StoryContext<RadioGroupProps>;

// ---  Default RadioGroup Tests ---
export const defaultTests = async ({
  canvasElement,
  step,
}: RadioGroupContext) => {
  const canvas = within(canvasElement);

  await step('RadioGroup rendering RadioGroupItems ', async () => {
    const radioGroup = canvas.getByRole('radiogroup');

    await step(
      'RadioGroupItem renders radio with connected label',
      async () => {
        const radio = within(radioGroup).getAllByRole('radio'); // 2 RadioGroupItems in example
        const firstLabel = within(radioGroup).getByText('Label 1');
        const secondLabel = within(radioGroup).getByText('Label 2');

        expect(firstLabel).toBeInTheDocument();
        expect(secondLabel).toBeInTheDocument();
        expect(radio.length).toBe(2);
        expect(radio[0]).toHaveAccessibleName('Label 1');
        expect(radio[1]).toHaveAccessibleName('Label 2');
      },
    );

    await step('Clicking Radio triggers selection', async () => {
      const radio = within(radioGroup).getAllByRole('radio')[0];
      expect(radio).not.toBeChecked();
      //satisfy typescript that radio is present for click event
      if (!radio) throw new Error('Radio not found');

      await userEvent.click(radio);
      expect(radio).toBeChecked();
    });

    await step('Clicking Label triggers radio selection', async () => {
      const radio = within(radioGroup).getAllByRole('radio')[1];
      const label = within(radioGroup).getByText('Label 2');

      expect(radio).not.toBeChecked();
      await userEvent.click(label);
      expect(radio).toBeChecked();
    });
  });
};

// ---  Ref Forwarding Tests ---
export const refForwardingTests =
  (refs: {
    first: RefObject<HTMLSpanElement | null>;
    second: RefObject<HTMLSpanElement | null>;
  }) =>
  async ({ step }: RadioGroupContext) => {
    await step('option refs are passed to a distinct radio', async () => {
      expect(refs.first.current).toHaveAttribute('role', 'radio');
      expect(refs.second.current).toHaveAttribute('role', 'radio');
      expect(refs.first.current).not.toBe(refs.second.current);
    });

    await step('forwarded ref drives selection imperatively', async () => {
      const radio = refs.first.current;
      if (!radio) throw new Error('Radio not found');

      expect(radio).not.toBeChecked();
      await userEvent.click(radio);
      expect(radio).toBeChecked();
      expect(radio).toHaveFocus();
    });
  };

// ---  Disabled RadioGroupItem Tests ---
export const disabledTests = async ({
  args,
  canvasElement,
  step,
}: RadioGroupContext) => {
  const canvas = within(canvasElement);

  await step('RadioGroup rendering RadioGroupItems ', async () => {
    const radioGroup = canvas.getByRole('radiogroup');

    await step(
      'disabled property in option sets aria-disabled on the RadioGroupItem',
      async () => {
        const radio = within(radioGroup).getAllByRole('radio'); // 4 RadioGroupItems in example (2 disabled)
        expect(radio.length).toBe(4);
        expect(radio[2]).toHaveAccessibleName("Can't touch this");
        expect(radio[2]).toHaveAttribute('aria-disabled', 'true');
        expect(radio[2]).toHaveAttribute('data-disabled');
        expect(radio[2]).not.toBeDisabled();
        expect(radio[3]).toHaveAccessibleName('Not this either');
        expect(radio[3]).toHaveAttribute('aria-disabled', 'true');
        expect(radio[3]).toHaveAttribute('data-disabled');
        expect(radio[3]).not.toBeDisabled();
      },
    );

    await step(
      'Clicking disabled Radio does not trigger selection',
      async () => {
        const radio = within(radioGroup).getAllByRole('radio')[3];
        expect(radio).not.toBeChecked();

        if (!radio) throw new Error('Radio not found');
        await userEvent.click(radio);
        expect(radio).not.toBeChecked();
        expect(args.onValueChange).not.toHaveBeenCalled();
      },
    );
  });
};

// ---  Disabled RadioGroup Tests ---
export const disabledGroupTests = async ({
  args,
  canvasElement,
  step,
}: RadioGroupContext) => {
  const canvas = within(canvasElement);

  await step(
    'disabled property in option sets aria-disabled on the RadioGroupItem',
    async () => {
      const radioGroup = canvas.getByRole('radiogroup');
      expect(radioGroup).toHaveAttribute('aria-disabled', 'true');
      expect(radioGroup).toHaveAttribute('data-disabled');
      expect(radioGroup).not.toBeDisabled();

      const radio = within(radioGroup).getAllByRole('radio'); // 2 RadioGroupItems in example
      expect(radio[0]).toHaveAttribute('aria-disabled', 'true');
      expect(radio[0]).toHaveAttribute('data-disabled');
      expect(radio[0]).not.toBeDisabled();
    },
  );

  await step('Clicking disabled Radio does not trigger selection', async () => {
    const radioGroup = canvas.getByRole('radiogroup');
    const radio = within(radioGroup).getAllByRole('radio')[0];
    expect(radio).not.toBeChecked();

    if (!radio) throw new Error('Radio not found');
    await userEvent.click(radio);
    expect(radio).not.toBeChecked();
    expect(args.onValueChange).not.toHaveBeenCalled();

    await userEvent.tab();
    expect(radio).toHaveFocus();
    await userEvent.keyboard('[ArrowDown]');
    expect(radio).not.toBeChecked();
    expect(args.onValueChange).not.toHaveBeenCalled();
  });
};
