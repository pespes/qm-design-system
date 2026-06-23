import type { StoryContext } from '@storybook/react';
import { expect, within, userEvent } from 'storybook/test';
import type { RefObject } from 'react';
import type { InputFieldProps } from './InputField.types.js';

type InputFieldPlayContext = StoryContext<InputFieldProps>;

// ---  Default InputField Test ---
export const defaultTests = async ({
  args,
  canvasElement,
  step,
}: InputFieldPlayContext) => {
  const canvas = within(canvasElement);
  const input = canvas.getByRole('textbox');

  await step('Label correctly connects to input', () => {
    const label = canvas.getByText('I am a Label');
    expect(label).toHaveAttribute('for', input.id);
  });

  await step('Correctly passes the testId to the input', () => {
    // Required in order to allow passing of args.testId to 'getByTestId' without
    // typescript complaint, even though we deliberately pass a testId in the args
    if (!args.testId) throw new Error('testId arg is required for this story');
    const input = canvas.getByTestId(args.testId);
    expect(input.tagName).toBe('INPUT');
  });

  await step('Label focuses input when clicked', async () => {
    const label = canvas.getByText('I am a Label');
    expect(input).not.toHaveFocus();
    await userEvent.click(label);
    expect(input).toHaveFocus();
  });

  await step('Correctly passes the ref through to the input', async () => {
    await userEvent.click(document.body);
    const ref = args.ref as RefObject<HTMLInputElement>;
    const input = ref.current;
    expect(input.tagName).toBe('INPUT');
    await userEvent.click(input);
    expect(input).toHaveFocus();
  });

  await step(
    'Does not render description or error when not provided',
    async () => {
      expect(input).not.toHaveAccessibleDescription();
      expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    },
  );

  await step('Input triggers onChange when user types', async () => {
    await userEvent.click(document.body);
    await userEvent.click(input);
    expect(input).toHaveFocus();
    expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.keyboard('t');
    expect(args.onChange).toHaveBeenCalledTimes(1);
  });
};

// --- InputField Description Test ---
export const descriptionTest = async ({
  args,
  canvasElement,
  step,
}: InputFieldPlayContext) => {
  const canvas = within(canvasElement);

  await step('Description correctly describes the input', () => {
    const descriptionText = args?.description as string;
    expect(canvas.getByText(descriptionText)).toBeInTheDocument();
    const input = canvas.getByRole('textbox');
    expect(input).toHaveAccessibleDescription(descriptionText);
  });
};

// ---  Disabled InputField Test ---
export const disabledTests = async ({
  canvasElement,
  step,
}: InputFieldPlayContext) => {
  const canvas = within(canvasElement);
  const input = canvas.getByRole('textbox');

  await step(
    'Passes disabled to the innput, and assigns data-disabled to Field',
    async () => {
      // Field and encompassing shadcn InputField element both have role='group'
      const field = canvas.getAllByRole('group')[0];
      expect(field).toHaveAttribute('data-disabled', 'true');
      expect(input).toBeDisabled();
    },
  );

  // a similar test as one in DefaultTests, for when an id is not supplied by dev
  await step('Label correctly connects to input', () => {
    const label = canvas.getByText('I am a Label');
    expect(label).toHaveAttribute('for', input.id);
  });

  await step('Label does not focus input when clicked', async () => {
    const label = canvas.getByText('I am a Label');
    expect(input).not.toHaveFocus();
    await userEvent.click(label);
    expect(input).not.toHaveFocus();
  });
};

// --- InputField Description Test ---
export const invalidTests = async ({
  args,
  canvasElement,
  step,
}: InputFieldPlayContext) => {
  const canvas = within(canvasElement);
  const input = canvas.getByRole('textbox');

  await step('Error correctly renders and describes the input', () => {
    const errorText = args?.error as string;
    expect(canvas.getByText(errorText)).toBeInTheDocument();
    expect(input).toHaveAccessibleDescription(
      expect.stringContaining(errorText),
    );
  });

  await step(
    'The errorText is appended to list of items describing the input instead of overriding',
    () => {
      const descriptionText = args?.description as string;
      expect(canvas.getByText(descriptionText)).toBeInTheDocument();
      expect(input).toHaveAccessibleDescription(
        expect.stringContaining(descriptionText),
      );
    },
  );

  await step(
    'Passes aria-invalid to the innput, and assigns data-invalid to Field',
    async () => {
      // Field and encompassing shadcn InputField element both have role='group'
      const field = canvas.getAllByRole('group')[0];
      expect(field).toHaveAttribute('data-invalid', 'true');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    },
  );
};

export const requiredTests = async ({
  canvasElement,
  step,
}: InputFieldPlayContext) => {
  const canvas = within(canvasElement);
  const input = canvas.getByRole('textbox');

  await step('Passes aria-required and assigns data-required to Field', () => {
    const field = canvas.getAllByRole('group')[0];
    expect(field).toHaveAttribute('data-required', 'true');
    expect(input).toHaveAttribute('aria-required', 'true');
  });
};
