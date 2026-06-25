import type { StoryContext } from '@storybook/react';
import { expect, within, userEvent } from 'storybook/test';
import type { RefObject } from 'react';
import type { TextAreaFieldProps } from './TextAreaField.types.js';

type TextAreaFieldPlayContext = StoryContext<TextAreaFieldProps>;

// --- Default TextAreaField Test (id provided by dev) ---
export const defaultTests = async ({
  args,
  canvasElement,
  step,
}: TextAreaFieldPlayContext) => {
  const canvas = within(canvasElement);
  const label = canvas.getByText('I am a Label');
  const textarea = canvas.getByRole('textbox');

  await step('Label correctly connects to textarea via provided id', () => {
    if (!args.id) throw new Error('id arg is required for this story');
    expect(textarea.id).toBe(args.id);
    expect(label).toHaveAttribute('for', args.id);
  });

  await step('Label focuses textarea when clicked', async () => {
    expect(textarea).not.toHaveFocus();
    await userEvent.click(label);
    expect(textarea).toHaveFocus();
  });

  await step('Correctly passes the ref through to the textarea', async () => {
    await userEvent.click(document.body);
    const ref = args.ref as RefObject<HTMLTextAreaElement>;
    const textarea = ref.current;
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).not.toHaveFocus();
    await userEvent.click(textarea);
    expect(textarea).toHaveFocus();
  });

  await step('Textarea triggers onChange when user types', async () => {
    await userEvent.click(document.body);
    await userEvent.click(textarea);
    expect(textarea).toHaveFocus();
    expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.keyboard('t');
    expect(args.onChange).toHaveBeenCalledTimes(1);
  });
};

// --- Generated id & maxLength TextAreaField Tests (no id provided) ---
export const generatedIdTests = async ({
  args,
  canvasElement,
  step,
}: TextAreaFieldPlayContext) => {
  const canvas = within(canvasElement);
  const textarea = canvas.getByRole('textbox');
  const label = canvas.getByText('I am a Label');

  await step('Label correctly connects to textarea via generated id', () => {
    expect(textarea.id).toBeTruthy();
    expect(label).toHaveAttribute('for', textarea.id);
  });

  await step('Label focuses textarea when clicked', async () => {
    expect(textarea).not.toHaveFocus();
    await userEvent.click(label);
    expect(textarea).toHaveFocus();
  });

  await step(
    'Textarea is described by both the counter and description text',
    async () => {
      const descriptionText = args?.description as string;

      expect(textarea).toHaveAccessibleDescription(
        expect.stringContaining(descriptionText),
      );
      expect(textarea).toHaveAccessibleDescription(
        expect.stringContaining(`0 / ${args.maxLength}`),
      );
    },
  );
};

// --- Disabled TextAreaField Test ---
export const disabledTests = async ({
  canvasElement,
  step,
}: TextAreaFieldPlayContext) => {
  const canvas = within(canvasElement);
  const textarea = canvas.getByRole('textbox');
  const label = canvas.getByText('I am a Label');

  await step('Label correctly connects to textarea', () => {
    expect(label).toHaveAttribute('for', textarea.id);
  });

  await step('Assigns data-disabled to Field and disables textarea', () => {
    const field = canvas.getAllByRole('group')[0];
    expect(field).toHaveAttribute('data-disabled', 'true');
    expect(textarea).toBeDisabled();
  });

  await step(
    'Label does not focus disabled textarea when clicked',
    async () => {
      expect(textarea).not.toHaveFocus();
      await userEvent.click(label);
      expect(textarea).not.toHaveFocus();
    },
  );
};

export const descriptionTest = async ({
  args,
  canvasElement,
  step,
}: TextAreaFieldPlayContext) => {
  const canvas = within(canvasElement);

  await step('Description correctly describes the textarea', () => {
    const descriptionText = args?.description as string;
    expect(canvas.getByText(descriptionText)).toBeInTheDocument();
    const textarea = canvas.getByRole('textbox');
    expect(textarea).toHaveAccessibleDescription(descriptionText);
  });
};

export const invalidTests = async ({
  args,
  canvasElement,
  step,
}: TextAreaFieldPlayContext) => {
  const canvas = within(canvasElement);
  const textarea = canvas.getByRole('textbox');

  await step('Renders all errors provided', () => {
    const errors = args?.error as Array<{ message: string }>;
    if (!errors[0] || !errors[1]) {
      throw new Error('multiple errors not provided');
    }
    const firstErrorMessage = errors[0].message;
    const secondErrorMessage = errors[1].message;

    expect(canvas.getByText(firstErrorMessage)).toBeInTheDocument();
    expect(canvas.getByText(secondErrorMessage)).toBeInTheDocument();

    expect(textarea).toHaveAccessibleDescription(
      expect.stringContaining(`${firstErrorMessage} ${secondErrorMessage}`),
    );
  });

  await step(
    'Passes aria-invalid and assigns data-invalid to Field',
    async () => {
      const field = canvas.getAllByRole('group')[0];
      expect(field).toHaveAttribute('data-invalid', 'true');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    },
  );
};

export const requiredTests = async ({
  canvasElement,
  step,
}: TextAreaFieldPlayContext) => {
  const canvas = within(canvasElement);
  const textarea = canvas.getByRole('textbox');

  await step('Passes aria-required and assigns data-required to Field', () => {
    const field = canvas.getAllByRole('group')[0];
    expect(field).toHaveAttribute('data-required', 'true');
    expect(textarea).toHaveAttribute('aria-required', 'true');
  });
};
