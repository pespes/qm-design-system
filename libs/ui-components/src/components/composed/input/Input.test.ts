import type { StoryContext } from '@storybook/react';
import { expect, within, userEvent, fireEvent, waitFor } from 'storybook/test';
import type { InputProps } from './Input.types.js';

type InputPlayContext = StoryContext<InputProps>;

/** Test functions exported as named exports, each testing a specific feature set.
 * Attached to stories via play() to run automatically in Storybook.
 * Use step() to organize assertions; use within(canvasElement) to scope queries. */
// ---  Default Input Tests ---
export const defaultTests = async ({
  args,
  canvasElement,
  step,
}: InputPlayContext) => {
  const canvas = within(canvasElement);

  await step('Input correctly renders placeholder', async () => {
    /** Query preference: getByRole > getByText > getByTestId (last resort). */
    const input = canvas.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', args.placeholder);
  });

  await step('Correctly passes the testId to the input', () => {
    /** This test explicitly verifies testId prop is forwarded correctly. */
    if (!args.testId) throw new Error('testId arg is required for this story');
    const input = canvas.getByTestId(args.testId);
    expect(input.tagName).toBe('INPUT');
  });

  await step('Input triggers onChange when user types', async () => {
    const input = canvas.getByRole('textbox');
    await userEvent.tab();
    expect(input).toHaveFocus();
    expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.keyboard('t');
    expect(args.onChange).toHaveBeenCalledTimes(1);
  });
};

// ---  Icon Input Tests ---
export const iconTests = async ({ canvasElement, step }: InputPlayContext) => {
  const canvas = within(canvasElement);

  await step(
    'Input renders icons when startAdornment and endAdornment are provided',
    async () => {
      const [startIconInput, endIconInput] = canvas.getAllByRole('group');
      if (!startIconInput || !endIconInput) {
        throw new Error('Default size input not found');
      }

      const startIcon = within(startIconInput).getByTestId(
        'input-group-addon-inline-start',
      );
      expect(startIcon).toBeInTheDocument();
      expect(startIcon).toHaveAttribute('aria-hidden', 'true');

      const endIcon = within(endIconInput).getByTestId(
        'input-group-addon-inline-end',
      );
      expect(endIcon).toBeInTheDocument();
      expect(endIcon).toHaveAttribute('aria-hidden', 'true');
    },
  );
};

// ---  Disabled Input Tests ---
export const disabledTests = async ({
  canvasElement,
  step,
}: InputPlayContext) => {
  const canvas = within(canvasElement);

  await step('Input is marked as disabled', async () => {
    const input = canvas.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  await step('Disabled input is not focusable via tab', async () => {
    const input = canvas.getByRole('textbox');
    await userEvent.tab();
    expect(input).not.toHaveFocus();
  });
};

// ---  Invalid Input Tests ---
export const invalidTests = async ({
  canvasElement,
  step,
}: InputPlayContext) => {
  const canvas = within(canvasElement);

  await step('aria-invalid is forwarded to native input', async () => {
    const input = canvas.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
};

// ---  Password Input Tests ---
export const passwordTests = async ({
  args,
  canvasElement,
  step,
}: InputPlayContext) => {
  const canvas = within(canvasElement);
  // Password inputs have no implicit ARIA role per the HTML-AAM spec, so
  // getByRole('textbox') won't find them — query by placeholder instead.
  const input = canvas.getByPlaceholderText(
    args.placeholder ?? '',
  ) as HTMLInputElement;

  await step('Input renders with type="password" by default', async () => {
    expect(input).toHaveAttribute('type', 'password');
  });

  await step('Correctly passes the passwordId to the toggle', () => {
    if (!args.passwordTestId)
      throw new Error('passwordId arg is required for this story');
    const passwordToggle = canvas.getByTestId(args.passwordTestId);
    expect(passwordToggle.tagName).toBe('BUTTON');
    expect(passwordToggle).toHaveAttribute(
      'aria-label',
      args.togglePasswordText?.show,
    );
  });

  await step(
    'Visibility toggle overrides endAdornment with no InputGroupAddon rendered',
    async () => {
      const addon = canvas.queryByTestId('input-group-addon');
      expect(addon).not.toBeInTheDocument();
    },
  );

  await step('Typing in input fires onChange and value is masked', async () => {
    await userEvent.click(input);
    await userEvent.keyboard('secret');
    expect(args.onChange).toHaveBeenCalled();
    expect(input).toHaveAttribute('type', 'password');
    expect(input.value).toBe('secret');
  });

  await step(
    'Clicking the toggle switches type to "text" and correctly updates toggle label',
    async () => {
      const passwordToggle = canvas.getByRole('button', {
        name: /show password/i,
      });
      expect(passwordToggle).toHaveAttribute('aria-pressed', 'false');

      await userEvent.click(passwordToggle);
      expect(input).toHaveAttribute('type', 'text');

      expect(passwordToggle).toHaveAttribute('aria-pressed', 'true');
      expect(passwordToggle).toHaveAttribute(
        'aria-label',
        args.togglePasswordText?.hide,
      );
    },
  );

  await step(
    'Clicking the toggle again switches back to "password"',
    async () => {
      const toggle = canvas.getByRole('button', { name: /hide password/i });
      await userEvent.click(toggle);
      expect(input).toHaveAttribute('type', 'password');
    },
  );
};

// ---  Disabled / No-Toggle Password Input Tests ---
export const passwordDisabledTests = async ({
  canvasElement,
  step,
}: InputPlayContext) => {
  const canvas = within(canvasElement);
  const [disabledGroup, noToggleGroup] = canvas.getAllByRole('group');
  if (!disabledGroup || !noToggleGroup) {
    throw new Error('Expected disabled and no-toggle password inputs');
  }

  await step(
    'Disabled toggle is disabled and cannot switch the input type',
    async () => {
      const disabledInput = within(disabledGroup).getByPlaceholderText(/.+/);
      const toggle = within(disabledGroup).getByRole('button', {
        name: /show password/i,
      });
      expect(toggle).toBeDisabled();
      // userEvent.click is blocked by pointer-events:none on the disabled
      // button, use fireEvent instead to confirm no change to the input type
      fireEvent.click(toggle);
      await waitFor(() => {
        expect(disabledInput).toHaveAttribute('type', 'password');
      });
    },
  );

  await step(
    'No toggle button is rendered when hasVisibilityToggle is false',
    async () => {
      const toggle = within(noToggleGroup).queryByRole('button', {
        name: /show password/i,
      });
      expect(toggle).not.toBeInTheDocument();
    },
  );
};

// ---  Size Input Tests ---
export const sizesTest = async ({ canvasElement, step }: InputPlayContext) => {
  const canvas = within(canvasElement);

  await step('Input renders "default" size variant by default', async () => {
    const [defaultInput, largeInput] = canvas.getAllByRole('textbox');
    if (!defaultInput || !largeInput) {
      throw new Error('Inputs not found');
    }

    expect(defaultInput.classList).toContain('py-250');
    expect(defaultInput.classList).toContain('px-300');
    expect(defaultInput.classList).toContain('type-ui-default');

    expect(largeInput.classList).toContain('px-350');
    expect(largeInput.classList).toContain('py-300');
    expect(largeInput.classList).toContain('type-ui-lead');
  });
};
