import type { RefObject } from 'react';
import type { StoryContext } from '@storybook/react';
import { expect, within, userEvent } from 'storybook/test';
import type { SwitchProps } from './Switch.types.js';

type SwitchContext = StoryContext<SwitchProps>;

// ---  Default Switch Tests ---
export const defaultTests = async ({
  args,
  canvasElement,
  step,
}: SwitchContext) => {
  const canvas = within(canvasElement);

  await step('Renders an input with type=checkbox', async () => {
    const switchEl = canvas.getByRole('switch');
    expect(switchEl).toBeInTheDocument();
  });

  await step('Clicking Switch toggles aria-checked', async () => {
    const switchEl = canvas.getByRole('switch');
    expect(switchEl).not.toBeChecked();

    await userEvent.click(switchEl);
    expect(switchEl).toBeChecked();
    expect(args.onCheckedChange).toHaveBeenCalledTimes(1);

    await userEvent.click(switchEl);
    expect(switchEl).not.toBeChecked();
    expect(args.onCheckedChange).toHaveBeenCalledTimes(2);
  });

  await step('Hitting "Space" or "Enter" key triggers toggle', async () => {
    const switchEl = canvas.getByRole('switch');
    expect(switchEl).not.toBeChecked();

    expect(switchEl).toHaveFocus();
    await userEvent.keyboard('{enter}');
    expect(args.onCheckedChange).toHaveBeenCalledTimes(3); //Including prev step
    expect(switchEl).toBeChecked();
    await userEvent.keyboard('{ }');
    expect(args.onCheckedChange).toHaveBeenCalledTimes(4);
  });
};

// ---  Disabled Switch Tests ---
export const disabledTests = async ({
  args,
  canvasElement,
  step,
}: SwitchContext) => {
  const canvas = within(canvasElement);
  await step(
    'disabled property sets aria-disabled on the Checkbox',
    async () => {
      const switchEl = canvas.getAllByRole('switch')[0];
      expect(switchEl).toHaveAttribute('aria-disabled', 'true');
      expect(switchEl).toHaveAttribute('data-disabled');
      expect(switchEl).not.toBeDisabled();
    },
  );

  await step(
    'Clicking disabled checkbox does not trigger selection',
    async () => {
      const switchEl = canvas.getAllByRole('switch')[0];
      expect(switchEl).not.toBeChecked();

      if (!switchEl) throw new Error('Switch not found');
      await userEvent.click(switchEl);
      expect(switchEl).not.toBeChecked();
      expect(args.onCheckedChange).not.toHaveBeenCalled();
    },
  );

  await step('Switch is removed from tab order when disabled', async () => {
    const switchEl = canvas.getAllByRole('switch')[0];
    expect(switchEl).toHaveAttribute('tabIndex', '-1');
    expect(switchEl).not.toHaveFocus();
    await userEvent.tab();
    expect(switchEl).not.toHaveFocus();
  });
};

// ---  Invalid & InputRef Forwarding Switch Tests ---
export const invalidTests = async ({
  args,
  canvasElement,
  step,
}: SwitchContext) => {
  const canvas = within(canvasElement);
  await step(
    'Correctly passes the aria-invalid state to the switch',
    async () => {
      const switchEl = canvas.getByRole('switch');
      expect(switchEl).toHaveAttribute('aria-invalid', 'true');
    },
  );

  await step('Correctly passes the ref to the root <span> el', async () => {
    const ref = args.ref as RefObject<HTMLSpanElement>;
    const switchEl = ref.current;
    expect(switchEl).not.toBeChecked();
    expect(switchEl.tagName).toBe('SPAN');
    expect(switchEl).toHaveAttribute('role', 'switch');
    await userEvent.click(switchEl);
    expect(switchEl).toBeChecked();
  });

  await step(
    'Correctly passes the inputRef to the input[type=checkbox]',
    async () => {
      const ref = args.inputRef as RefObject<HTMLInputElement>;
      const input = ref.current;
      expect(input).toBeChecked(); //checked from prev test
      expect(input.tagName).toBe('INPUT');
      expect(input).toHaveAttribute('type', 'checkbox');
      await userEvent.click(input);
      expect(input).not.toBeChecked();
    },
  );
};

// ---  Polymorphic Switch Tests ---
export const polymorphicTests = async ({
  args,
  canvasElement,
  step,
}: SwitchContext) => {
  const canvas = within(canvasElement);
  await step(
    'Renders provided HTML tag when render prop is provided',
    async () => {
      const switchEl = canvas.getByRole('switch');
      expect(switchEl.tagName).toBe('BUTTON');
    },
  );

  await step('Button as Switch still calls onCheckedChange', async () => {
    const switchEl = canvas.getByRole('switch');
    expect(switchEl).not.toBeChecked();

    await userEvent.click(switchEl);
    expect(switchEl).toBeChecked();
    expect(args.onCheckedChange).toHaveBeenCalledTimes(1);
  });
};
