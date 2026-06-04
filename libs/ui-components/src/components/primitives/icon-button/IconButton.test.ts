import type { StoryContext } from '@storybook/react';
import { expect, within, fireEvent, userEvent, waitFor } from 'storybook/test';
import type { IconButtonProps } from './IconButton.types.js';

type ButtonPlayContext = StoryContext<IconButtonProps>;

// ---  Default Button Tests ---
export const defaultTests = async ({
  args,
  canvasElement,
  step,
}: ButtonPlayContext) => {
  const canvas = within(canvasElement);

  await step('Button renders base variant by default', async () => {
    const button = canvas.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.classList).toContain('bg-base-background');
  });

  await step('Button renders an aria-label by default', async () => {
    const button = canvas.getByRole('button');
    expect(button).toHaveAccessibleName(args.label);
  });

  await step('Button triggers onClick via Enter and Space keys', async () => {
    const button = canvas.getByRole('button');
    await userEvent.tab();
    expect(button).toHaveFocus();
    await userEvent.keyboard('{enter}');
    expect(args.onClick).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{ }');
    expect(args.onClick).toHaveBeenCalledTimes(2);
  });

  await step('Button passes onClick event through', async () => {
    await userEvent.click(canvas.getByRole('button'));
    expect(args.onClick).toHaveBeenCalled();
  });
};

// --- Disabled Tests ---
export const disabledTests = async ({
  args,
  canvasElement,
  step,
}: ButtonPlayContext) => {
  const canvas = within(canvasElement);

  await step('Button is disabled when disabled prop is true', async () => {
    const button = canvas.getAllByRole('button')[0];
    if (!button) throw new Error('Button not found');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-disabled');
  });

  await step('Button does not trigger onClick when disabled', async () => {
    const button = canvas.getAllByRole('button')[0];
    if (!button) throw new Error('Button not found');
    // Recent versions of userEvent will throw an error if trying to click an element that has
    // pointer-events:none set. Using fireEvent as a workaround to confirm onClick is not called
    fireEvent.click(button);
    await waitFor(() => {
      expect(args.onClick).not.toHaveBeenCalled();
    });
    const style = window.getComputedStyle(button);
    await expect(style.pointerEvents).toBe('none');
  });

  await step('Button does not have focus when disabled', async () => {
    const button = canvas.getAllByRole('button')[0];
    if (!button) throw new Error('Button not found');
    await userEvent.tab();
    expect(button).not.toHaveFocus();
  });
};

// --- Loading State Tests ---
export const loadingTests = async ({
  canvasElement,
  step,
}: ButtonPlayContext) => {
  const canvas = within(canvasElement);

  await step('Button renders loading spinner', async () => {
    const loadingBtn = canvas.getByTestId('btn-loading');
    const statusRegions = within(loadingBtn).getAllByRole('status', {
      hidden: true,
    });
    expect(statusRegions.length).toBe(2); // 1 for .sr-only, one for loading spinner
    if (statusRegions[1]) {
      expect(statusRegions[1].tagName).toBe('svg');
    }
  });

  await step(
    'Sets aria-disabled, aria-busy on button and populates live region with loading.title when loading',
    async () => {
      const activeBtn = canvas.getByTestId('btn-active');
      expect(activeBtn).not.toHaveAttribute('aria-disabled');
      expect(activeBtn).toHaveAttribute('aria-busy', 'false');

      const status = within(activeBtn).getByRole('status');
      expect(status).toBeEmptyDOMElement();

      await userEvent.click(activeBtn);
      expect(activeBtn).toHaveAttribute('aria-disabled', 'true');
      expect(activeBtn).toHaveAttribute('data-disabled');
      expect(activeBtn).not.toBeDisabled();
      expect(activeBtn).toHaveAttribute('aria-busy', 'true');

      expect(status).toHaveTextContent('Now Loading');
    },
  );
};

// --- Polymorphism Tests ---
export const polymorphismTests = async ({
  args,
  canvasElement,
  step,
}: ButtonPlayContext) => {
  const canvas = within(canvasElement);

  await step(
    "Button renders HTML tag from render prop's element and sets nativeButton to false",
    async () => {
      const button = canvas.getByTestId('btn-render-el');
      expect(button.tagName).toBe('DIV');
      expect(button).toHaveAttribute('role', 'button');
      //confirm it is focusable
      expect(button).toHaveAttribute('tabindex', '0');
    },
  );

  await step(
    "Button renders HTML tag from render prop's function",
    async () => {
      const button = canvas.getByTestId('btn-render-func');
      expect(button.tagName).toBe('SPAN');
      expect(button).toHaveAttribute('role', 'button');
      expect(button).toHaveAttribute('tabindex', '0');
    },
  );

  await step(
    'Polymorphic button retains focus and onClick functionality',
    async () => {
      const button = canvas.getByTestId('btn-render-el');
      await userEvent.tab();
      expect(button).toHaveFocus();
      await userEvent.keyboard('{enter}');
      expect(args.onClick).toHaveBeenCalledTimes(1);
      await userEvent.click(button);
      expect(args.onClick).toHaveBeenCalledTimes(2);
    },
  );
};
